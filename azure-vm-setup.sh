#!/usr/bin/env bash
# MediSync — GCP/VM Setup Script (optimized for small VMs)
#
# Installs prerequisites, clones the repo, builds Java services at low priority,
# extracts a pre-built React frontend, registers systemd units, and configures nginx.
#
# The React frontend is built LOCALLY on your Mac and uploaded as ~/dist.tar.gz.
# This avoids npm/vite on the VM entirely (saves ~1.5 GB RAM + heavy CPU).
#
# Usage (from your Mac):
#   bash deploy.sh              # recommended: handles everything
#
# Or manually:
#   gcloud compute scp azure-vm-setup.sh dist.tar.gz ubuntu@<VM>:~/ --zone=<zone>
#   gcloud compute ssh ubuntu@<VM> --zone=<zone> --command="bash ~/azure-vm-setup.sh"

set -euo pipefail

INSTALL_DIR="/opt/had"
HAD_REPO="https://github.com/Shubhamzanzad/HAD.git"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()     { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[DONE]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }

PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me \
    || curl -s --max-time 5 ipinfo.io/ip \
    || echo "UNKNOWN")

# ── 0. Swap (prevents OOM on small VMs) ─────────────────────────────────────
if ! swapon --show | grep -q "/swapfile"; then
    log "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    success "Swap enabled."
fi

# ── 1. System packages (no nodejs/npm — frontend is pre-built) ──────────────
log "Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y -q git curl wget gnupg maven nginx

# Java 21 via Eclipse Temurin
if java -version 2>&1 | grep -q "21\."; then
    warn "Java 21 already installed — skipping."
else
    log "Installing Java 21..."
    . /etc/os-release
    sudo rm -f /etc/apt/trusted.gpg.d/adoptium.gpg
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public \
        | sudo gpg --batch --no-tty --dearmour -o /etc/apt/trusted.gpg.d/adoptium.gpg
    echo "deb https://packages.adoptium.net/artifactory/deb ${VERSION_CODENAME} main" \
        | sudo tee /etc/apt/sources.list.d/adoptium.list > /dev/null
    sudo apt-get update -q
    sudo apt-get install -y temurin-21-jdk
fi

JAVA_HOME=$(dirname "$(dirname "$(readlink -f "$(which java)")")")
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"
success "Java ready. JAVA_HOME=$JAVA_HOME"

# ── 2. PDF output directory ─────────────────────────────────────────────────
mkdir -p /tmp/medisync/pdfs

# ── 3. Clone / update repo ──────────────────────────────────────────────────
log "Preparing repository..."
if [ -d "$INSTALL_DIR" ] && [ ! -d "$INSTALL_DIR/.git" ]; then
    sudo rm -rf "$INSTALL_DIR"
fi
sudo mkdir -p "$INSTALL_DIR"
sudo chown ubuntu:ubuntu "$INSTALL_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
    warn "Repo exists — pulling latest..."
    git -C "$INSTALL_DIR" pull
else
    git clone "$HAD_REPO" "$INSTALL_DIR"
fi
success "Repository ready."

# ── 4. Build Java services (low priority, memory-limited) ───────────────────
#
# Key optimizations for small VMs:
#   nice -n 19       → lowest CPU scheduling priority
#   ionice -c 3      → idle-only I/O priority
#   -Xmx512m         → cap Maven JVM heap at 512 MB
#   No -T flag       → single-threaded builds (less RAM pressure)
#   -q               → quiet output (less I/O)
#   Sequential builds with gc hints between them

log "Building Java services (low priority — VM stays responsive)..."
export MAVEN_OPTS="-Xmx512m -XX:+UseSerialGC"

build_service() {
    local name="$1"
    local dir="$2"
    local goal="${3:-package}"
    log "  Building $name..."
    nice -n 19 ionice -c 3 mvn -f "$dir/pom.xml" clean $goal -DskipTests -q
}

build_service "AccountService (install)" "$INSTALL_DIR/Backend/AccountService" "install"
build_service "DiscoveryServer"          "$INSTALL_DIR/Backend/DiscoveryServer"
build_service "API-Gateway"              "$INSTALL_DIR/Backend/API-Gateway"
build_service "PatientService"           "$INSTALL_DIR/Backend/PatientService"
build_service "ConsentService"           "$INSTALL_DIR/Backend/ConsentService"
build_service "ABDM_Backend"             "$INSTALL_DIR/ABDM_Backend"

success "All services built."

# ── 5. Systemd units ────────────────────────────────────────────────────────
log "Registering systemd services..."

TIDB_HOST="gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000"
TIDB_OPTS="sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true"

write_service() {
    local name="$1" jar_path="$2" description="$3"
    local after="${4:-had-discovery.service}"
    local db_url="${5:-}"
    local db_line=""
    [ -n "$db_url" ] && db_line="Environment=\"DB_URL=${db_url}\""

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
ExecStart=${JAVA_HOME}/bin/java -Xmx384m -jar ${jar_path}
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT
}

write_service "discovery" \
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

# ── 6. Extract pre-built frontend ────────────────────────────────────────────
if [ -f "$HOME/dist.tar.gz" ]; then
    log "Extracting pre-built frontend..."
    mkdir -p "$INSTALL_DIR/frontend"
    tar -xzf "$HOME/dist.tar.gz" -C "$INSTALL_DIR/frontend/"
    success "Frontend extracted."
else
    warn "~/dist.tar.gz not found — skipping frontend."
    warn "Build locally: cd frontend && VITE_API_BASE_URL=http://${PUBLIC_IP}:9005 npx vite build"
    warn "Then: tar -czf dist.tar.gz -C frontend dist && scp to VM"
fi

# ── 7. Configure nginx ──────────────────────────────────────────────────────
log "Configuring nginx..."
sudo tee /etc/nginx/sites-available/medisync > /dev/null <<NGINX
server {
    listen 80;
    root ${INSTALL_DIR}/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:9005/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

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

# ── Done ─────────────────────────────────────────────────────────────────────
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
