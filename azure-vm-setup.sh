#!/usr/bin/env bash
# HAD (MediSync) — Azure VM setup script
# Run this ONCE inside the Azure B2s VM after SSH-ing in.
# It installs all prerequisites, clones the HAD repo, builds every service,
# and registers all 6 microservices as systemd units.
#
# Usage (from your local machine):
#   scp -i ~/key.pem azure-vm-setup.sh ubuntu@<VM_IP>:~/
#   ssh -i ~/key.pem ubuntu@<VM_IP> 'bash ~/azure-vm-setup.sh'

set -euo pipefail

HAD_REPO="https://github.com/Shubhamzanzad/HAD.git"   # ← update if your remote URL differs
INSTALL_DIR="/opt/had"
JAVA_HOME_PATH="/opt/homebrew/opt/openjdk@21"           # overridden below after apt install

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()     { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[DONE]${NC}  $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()     { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── 1. System packages ────────────────────────────────────────────────────────
log "Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y \
    build-essential git curl wget gnupg \
    openjdk-21-jdk maven \
    nginx \
    nodejs npm

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
java -version
mvn -version
success "System packages installed."

# ── 2. PDF output directory ───────────────────────────────────────────────────
log "Creating PDF output directory..."
mkdir -p /tmp/medisync/pdfs
success "PDF directory ready at /tmp/medisync/pdfs."

# ── 3. Clone HAD repo ─────────────────────────────────────────────────────────
log "Cloning HAD repository to $INSTALL_DIR..."
sudo mkdir -p "$INSTALL_DIR"
sudo chown ubuntu:ubuntu "$INSTALL_DIR"
if [ -d "$INSTALL_DIR/.git" ]; then
    warn "Repo already cloned — pulling latest..."
    git -C "$INSTALL_DIR" pull
else
    git clone "$HAD_REPO" "$INSTALL_DIR"
fi
success "Repository ready at $INSTALL_DIR."

# ── 5. Environment config file (secrets) ─────────────────────────────────────
log "Creating environment config at /opt/had/config/env.conf..."
sudo mkdir -p /opt/had/config

# Auto-detect the VM's public IP — this becomes the ABDM callback URL
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "UNKNOWN")
log "Detected public IP: $PUBLIC_IP"

sudo tee /opt/had/config/env.conf > /dev/null <<ENVCONF
# ── Gmail (AccountService OTP emails) ─────────────────────────────────────────
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# ── Hospital identity (ABDM) ──────────────────────────────────────────────────
HOSPITAL_NAME=Your Hospital Name
HOSPITAL_ID=IN2210000259

# ABDM_Backend public URL (auto-detected from VM IP)
ABDM_URL=http://${PUBLIC_IP}:9009

# ── DB encryption ─────────────────────────────────────────────────────────────
DATABASE_ENCRYPTION_KEY=your-encryption-key

# ── TiDB Serverless credentials ───────────────────────────────────────────────
DB_USERNAME=your-tidb-username
DB_PASSWORD=your-tidb-password

# ── CloudAMQP (RabbitMQ) ──────────────────────────────────────────────────────
RABBITMQ_HOST=your-cloudamqp-host
RABBITMQ_PORT=5672
RABBITMQ_VHOST=your-vhost
RABBITMQ_USERNAME=your-username
RABBITMQ_PASSWORD=your-password
ENVCONF
sudo chmod 600 /opt/had/config/env.conf
warn "ACTION REQUIRED: fill in GMAIL_USER, GMAIL_APP_PASSWORD, HOSPITAL_NAME in /opt/had/config/env.conf"

# ── 7. Build all services ─────────────────────────────────────────────────────
log "Building all 6 Java services (this takes ~10 minutes on first run)..."
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"

# AccountService must be installed first (PatientService depends on it)
log "  Building AccountService (1/6)..."
cd "$INSTALL_DIR/Backend/AccountService"
mvn clean install -DskipTests -q

log "  Building DiscoveryServer (2/6)..."
cd "$INSTALL_DIR/Backend/DiscoveryServer"
mvn clean package -DskipTests -q

log "  Building API-Gateway (3/6)..."
cd "$INSTALL_DIR/Backend/API-Gateway"
mvn clean package -DskipTests -q

log "  Building PatientService (4/6)..."
cd "$INSTALL_DIR/Backend/PatientService"
mvn clean package -DskipTests -q

log "  Building ConsentService (5/6)..."
cd "$INSTALL_DIR/Backend/ConsentService"
mvn clean package -DskipTests -q

log "  Building ABDM_Backend (6/6)..."
cd "$INSTALL_DIR/ABDM_Backend"
mvn clean package -DskipTests -q

success "All services built."

# ── 8. systemd service files ──────────────────────────────────────────────────
log "Registering systemd services..."

# Helper: write a systemd unit for a Spring Boot JAR
# Args: name  jar_path  description  after  db_url (empty string for services with no DB)
write_service() {
    local name="$1"
    local jar_path="$2"
    local description="$3"
    local after="${4:-had-discovery.service}"
    local db_url="${5:-}"

    local db_url_line=""
    if [ -n "$db_url" ]; then
        db_url_line="Environment=\"DB_URL=${db_url}\""
    fi

    sudo tee "/etc/systemd/system/had-${name}.service" > /dev/null <<UNIT
[Unit]
Description=HAD $description
After=network.target $after

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$(dirname "$jar_path")
EnvironmentFile=/opt/had/config/env.conf
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
${db_url_line}
ExecStart=/usr/lib/jvm/java-21-openjdk-amd64/bin/java -jar $jar_path
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT
}

TIDB_HOST="gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000"
TIDB_OPTS="sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true"

write_service "discovery"   "$INSTALL_DIR/Backend/DiscoveryServer/target/DiscoveryServer-0.0.1-SNAPSHOT.jar"    "Eureka Discovery Server"  ""                      ""
write_service "api-gateway" "$INSTALL_DIR/Backend/API-Gateway/target/API-Gateway-0.0.1-SNAPSHOT.jar"            "API Gateway (port 9005)"  "had-discovery.service" ""
write_service "account"     "$INSTALL_DIR/Backend/AccountService/target/AccountService-0.0.1-SNAPSHOT-exec.jar" "Account Service"          "had-api-gateway.service" "jdbc:mysql://${TIDB_HOST}/Account?${TIDB_OPTS}"
write_service "patient"     "$INSTALL_DIR/Backend/PatientService/target/PatientService-0.0.1-SNAPSHOT.jar"      "Patient Service (FHIR)"   "had-api-gateway.service" "jdbc:mysql://${TIDB_HOST}/Patient?${TIDB_OPTS}"
write_service "consent"     "$INSTALL_DIR/Backend/ConsentService/target/ConsentService-0.0.1-SNAPSHOT.jar"      "Consent Service"          "had-api-gateway.service" "jdbc:mysql://${TIDB_HOST}/Consent?${TIDB_OPTS}"
write_service "abdm"        "$INSTALL_DIR/ABDM_Backend/target/ABDM_Backend-0.0.1-SNAPSHOT.jar"                  "ABDM Backend (port 9009)" "had-api-gateway.service" "jdbc:mysql://${TIDB_HOST}/Abdm?${TIDB_OPTS}"

# Target unit that starts/stops all HAD services together
sudo tee /etc/systemd/system/had-all.service > /dev/null <<'TARGET'
[Unit]
Description=HAD MediSync — all microservices
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/systemctl start had-discovery had-api-gateway had-account had-patient had-consent had-abdm
ExecStop=/bin/systemctl stop had-abdm had-consent had-patient had-account had-api-gateway had-discovery

[Install]
WantedBy=multi-user.target
TARGET

sudo systemctl daemon-reload
sudo systemctl enable had-all.service

# Start in order: Discovery must be up before others try to register
log "Starting services (discovery first, then the rest)..."
sudo systemctl start had-discovery.service
sleep 15    # wait for Eureka to be ready
sudo systemctl start had-api-gateway.service
sleep 10
sudo systemctl start had-account.service had-patient.service had-consent.service
sleep 10
sudo systemctl start had-abdm.service

success "All HAD services started."

# ── 9. Health check ───────────────────────────────────────────────────────────
log "Running health check..."
sleep 10
curl -sf http://localhost:8761/actuator/health \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('  Eureka:', d.get('status','?'))" \
    2>/dev/null || warn "Eureka health check failed — check 'journalctl -u had-discovery -n 50'"

# ── 10. Build React frontend ──────────────────────────────────────────────────
log "Building React frontend (VITE_API_BASE_URL=http://${PUBLIC_IP}:9005)..."
cd "$INSTALL_DIR/frontend"
npm install --legacy-peer-deps -q
VITE_API_BASE_URL="http://${PUBLIC_IP}:9005" npm run build
success "Frontend built."

# Update FRONTEND_URL in env.conf so API Gateway allows CORS from this VM
sed -i '/^FRONTEND_URL=/d' /opt/had/config/env.conf
echo "FRONTEND_URL=http://${PUBLIC_IP}" >> /opt/had/config/env.conf

# ── 11. Configure nginx to serve the frontend ─────────────────────────────────
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
sudo nginx -t && sudo systemctl restart nginx
success "nginx serving frontend on port 80."

# Restart gateway to pick up the updated FRONTEND_URL for CORS
sudo systemctl restart had-api-gateway.service

echo ""
echo "════════════════════════════════════════════════════"
success "HAD MediSync setup complete!"
echo ""
echo "  Frontend  →  http://${PUBLIC_IP}"
echo "  API GW    →  http://${PUBLIC_IP}:9005"
echo "  Eureka    →  http://${PUBLIC_IP}:8761"
echo "  ABDM      →  http://${PUBLIC_IP}:9009"
echo ""
echo "  ACTION REQUIRED:"
echo "  Fill in Gmail credentials then restart:"
echo "    sudo nano /opt/had/config/env.conf"
echo "    sudo systemctl restart had-all.service"
echo ""
echo "  Useful commands:"
echo "    sudo systemctl status had-discovery had-api-gateway had-account had-patient"
echo "    sudo journalctl -u had-account -f"
echo "    sudo systemctl restart had-all.service"
echo "════════════════════════════════════════════════════"
