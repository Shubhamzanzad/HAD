#!/usr/bin/env bash
# MediSync — GCP/VM Setup Script
# Installs prerequisites, clones the repo, builds all 6 services,
# registers systemd units, builds the React frontend, and configures nginx.
# Does NOT start services — run deploy-secrets.sh after this.
#
# Usage:
#   gcloud compute scp azure-vm-setup.sh ubuntu@<VM>:~/ --zone=<zone>
#   gcloud compute ssh ubuntu@<VM> --zone=<zone> --command="bash ~/azure-vm-setup.sh"

set -euo pipefail

HAD_REPO="https://github.com/Shubhamzanzad/HAD.git"
INSTALL_DIR="/opt/had"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()     { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[DONE]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }

# ── 1. System packages ────────────────────────────────────────────────────────
log "Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y build-essential git curl wget gnupg maven nginx nodejs npm

# Install Java 21 via Eclipse Temurin (skip if already installed)
if java -version 2>&1 | grep -q "21\."; then
    warn "Java 21 already installed — skipping."
else
    log "Installing Java 21 via Eclipse Temurin..."
    . /etc/os-release
    # Remove stale key from previous runs before re-adding
    sudo rm -f /etc/apt/trusted.gpg.d/adoptium.gpg
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public \
        | sudo gpg --batch --no-tty --dearmour -o /etc/apt/trusted.gpg.d/adoptium.gpg
    echo "deb https://packages.adoptium.net/artifactory/deb ${VERSION_CODENAME} main" \
        | sudo tee /etc/apt/sources.list.d/adoptium.list > /dev/null
    sudo apt-get update -q
    sudo apt-get install -y temurin-21-jdk
fi

# Detect JAVA_HOME dynamically — works for any JDK installation
JAVA_HOME=$(dirname "$(dirname "$(readlink -f "$(which java)")")")
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"
java -version
mvn -version
success "System packages ready. JAVA_HOME=$JAVA_HOME"

# ── 2. PDF output directory ───────────────────────────────────────────────────
log "Creating PDF output directory..."
mkdir -p /tmp/medisync/pdfs
success "PDF directory ready."

# ── 3. Clone HAD repo ─────────────────────────────────────────────────────────
log "Cloning HAD repository..."
# Remove leftover directory from a previous failed run if it's not a git repo
if [ -d "$INSTALL_DIR" ] && [ ! -d "$INSTALL_DIR/.git" ]; then
    warn "$INSTALL_DIR exists but is not a git repo — cleaning up..."
    sudo rm -rf "$INSTALL_DIR"
fi
sudo mkdir -p "$INSTALL_DIR"
sudo chown ubuntu:ubuntu "$INSTALL_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
    warn "Repo already exists — pulling latest..."
    git -C "$INSTALL_DIR" pull
else
    git clone "$HAD_REPO" "$INSTALL_DIR"
fi
success "Repository ready at $INSTALL_DIR."

# ── 4. Build all 6 Java services ─────────────────────────────────────────────
log "Building all 6 Java services (first run ~10 min)..."

log "  [1/6] AccountService (mvn install — needed by PatientService)..."
cd "$INSTALL_DIR/Backend/AccountService"
mvn clean install -DskipTests -q

log "  [2/6] DiscoveryServer..."
cd "$INSTALL_DIR/Backend/DiscoveryServer"
mvn clean package -DskipTests -q

log "  [3/6] API-Gateway..."
cd "$INSTALL_DIR/Backend/API-Gateway"
mvn clean package -DskipTests -q

log "  [4/6] PatientService..."
cd "$INSTALL_DIR/Backend/PatientService"
mvn clean package -DskipTests -q

log "  [5/6] ConsentService..."
cd "$INSTALL_DIR/Backend/ConsentService"
mvn clean package -DskipTests -q

log "  [6/6] ABDM_Backend..."
cd "$INSTALL_DIR/ABDM_Backend"
mvn clean package -DskipTests -q

success "All services built."

# ── 5. Register systemd units ─────────────────────────────────────────────────
log "Registering systemd services..."

TIDB_HOST="gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000"
TIDB_OPTS="sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true"

write_service() {
    local name="$1"
    local jar_path="$2"
    local description="$3"
    local after="${4:-had-discovery.service}"
    local db_url="${5:-}"

    local db_line=""
    [ -n "$db_url" ] && db_line="Environment=\"DB_URL=${db_url}\""

    # Use printf to avoid heredoc variable-expansion surprises
    sudo tee "/etc/systemd/system/had-${name}.service" > /dev/null <<UNIT
[Unit]
Description=HAD $description
After=network.target $after

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$(dirname "$jar_path")
EnvironmentFile=/opt/had/config/env.conf
Environment="JAVA_HOME=${JAVA_HOME}"
${db_line}
ExecStart=${JAVA_HOME}/bin/java -jar ${jar_path}
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT
}

write_service "discovery"   \
    "$INSTALL_DIR/Backend/DiscoveryServer/target/DiscoveryServer-0.0.1-SNAPSHOT.jar" \
    "Eureka Discovery Server" "" ""

write_service "api-gateway" \
    "$INSTALL_DIR/Backend/API-Gateway/target/API-Gateway-0.0.1-SNAPSHOT.jar" \
    "API Gateway (port 9005)" "had-discovery.service" ""

write_service "account" \
    "$INSTALL_DIR/Backend/AccountService/target/AccountService-0.0.1-SNAPSHOT-exec.jar" \
    "Account Service" "had-api-gateway.service" \
    "jdbc:mysql://${TIDB_HOST}/Account?${TIDB_OPTS}"

write_service "patient" \
    "$INSTALL_DIR/Backend/PatientService/target/PatientService-0.0.1-SNAPSHOT.jar" \
    "Patient Service" "had-api-gateway.service" \
    "jdbc:mysql://${TIDB_HOST}/Patient?${TIDB_OPTS}"

write_service "consent" \
    "$INSTALL_DIR/Backend/ConsentService/target/ConsentService-0.0.1-SNAPSHOT.jar" \
    "Consent Service" "had-api-gateway.service" \
    "jdbc:mysql://${TIDB_HOST}/Consent?${TIDB_OPTS}"

write_service "abdm" \
    "$INSTALL_DIR/ABDM_Backend/target/ABDM_Backend-0.0.1-SNAPSHOT.jar" \
    "ABDM Backend (port 9009)" "had-api-gateway.service" \
    "jdbc:mysql://${TIDB_HOST}/Abdm?${TIDB_OPTS}"

# Meta-service to start/stop everything at once
sudo tee /etc/systemd/system/had-all.service > /dev/null <<'TARGET'
[Unit]
Description=HAD MediSync — all microservices
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/systemctl start had-discovery had-api-gateway had-account had-patient had-consent had-abdm
ExecStop=/bin/systemctl  stop had-abdm had-consent had-patient had-account had-api-gateway had-discovery

[Install]
WantedBy=multi-user.target
TARGET

sudo systemctl daemon-reload
sudo systemctl enable had-all.service
success "Systemd units registered."

# ── 6. Build React frontend ───────────────────────────────────────────────────
log "Detecting public IP..."
PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me \
    || curl -s --max-time 5 ipinfo.io/ip \
    || echo "UNKNOWN")
log "Public IP: $PUBLIC_IP"

log "Building React frontend..."
cd "$INSTALL_DIR/frontend"
npm install --legacy-peer-deps --silent
VITE_API_BASE_URL="http://${PUBLIC_IP}:9005" npm run build
success "Frontend built."

# ── 7. Configure nginx ────────────────────────────────────────────────────────
log "Configuring nginx..."
sudo tee /etc/nginx/sites-available/medisync > /dev/null <<NGINX
server {
    listen 80;
    root ${INSTALL_DIR}/frontend/dist;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/medisync /etc/nginx/sites-enabled/medisync
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
success "nginx configured."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
success "Build complete! Services are NOT started yet."
echo ""
echo "  Next step — inject credentials and start services:"
echo "    bash ~/deploy-secrets.sh"
echo ""
echo "  After that, app will be live at:"
echo "    Frontend  →  http://${PUBLIC_IP}"
echo "    API GW    →  http://${PUBLIC_IP}:9005"
echo "    Eureka    →  http://${PUBLIC_IP}:8761"
echo "════════════════════════════════════════════════════"
