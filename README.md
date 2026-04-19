# MediSync — Healthcare Management System

MediSync is a hospital-facing healthcare management platform integrated with **ABDM (Ayushman Bharat Digital Mission)** — India's national digital health infrastructure. It allows hospitals to manage patient records, handle doctor/staff accounts, schedule appointments, and exchange health information using FHIR R4 standards with patient consent.

---

## Demo Access

> Login with any of the accounts below to explore the portal.

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Head Doctor** | `dr.mehta` | `Demo@1234` | Full access — doctors, patients, consents, logs |
| **Doctor** | `dr.sharma` | `Demo@1234` | View & update assigned patients |
| **Doctor** | `dr.patel` | `Demo@1234` | View & update assigned patients |
| **Staff** | `staff.anita` | `Demo@1234` | Patient registration & scheduling |

**Pre-loaded patients:** Ravi Kumar · Sunita Rao · Mohammed Ikhlas · Preethi Nair · Sanjay Gupta

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│               React Frontend (Vite)                 │
│                  localhost:5173                     │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────┐
│              API Gateway (Spring Cloud)             │
│                  localhost:9005                     │
└───┬───────────────┬───────────────┬─────────────────┘
    │               │               │
┌───▼───┐     ┌─────▼─────┐  ┌─────▼──────┐
│Account│     │  Patient  │  │  Consent   │
│Service│     │  Service  │  │  Service   │
└───────┘     └─────┬─────┘  └─────┬──────┘
                    │               │
              ┌─────▼───────────────▼──────┐
              │       RabbitMQ (AMQP)      │
              └─────────────┬──────────────┘
                            │
                   ┌────────▼────────┐
                   │  ABDM Backend   │
                   │  localhost:9009 │
                   └─────────────────┘

All services register with Eureka (localhost:8761)
Each service has its own MySQL database
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS, MUI, Ant Design |
| Backend | Java 21, Spring Boot 3.2.2, Spring Cloud 2023.0.x |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Database | MySQL 8.x (separate DB per service) |
| Message Queue | RabbitMQ (AMQP) with virtual host `had` |
| Healthcare Standards | FHIR R4 (HAPI FHIR 6.4.3) |
| Auth | JWT (JJWT 0.12.5), Spring Security |
| Build Tools | Maven (backend), npm (frontend) |

---

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| DiscoveryServer | 8761 | Eureka service registry |
| API-Gateway | 9005 | Single entry point, JWT filter, CORS |
| AccountService | dynamic | Doctor/staff auth, registration, email OTP |
| PatientService | dynamic | Patient records, file uploads, PDF generation |
| ConsentService | dynamic | ABDM consent management |
| ABDM_Backend | 9009 | ABDM webhook handler, FHIR data exchange |
| Frontend | 5173 | React dev server |

---

## Local Setup

### Prerequisites

- **Java 21** — [Download](https://adoptium.net/)
- **Apache Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+ & npm** — [Download](https://nodejs.org/)
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/)
- **RabbitMQ 3.x** — [Download](https://www.rabbitmq.com/download.html)

### 1. Clone the repository

```bash
git clone https://github.com/Shubhamzanzad/HAD.git
cd HAD
```

### 2. MySQL setup

```sql
CREATE USER 'HAD'@'localhost' IDENTIFIED BY 'Medisync.123';
GRANT ALL PRIVILEGES ON *.* TO 'HAD'@'localhost';
FLUSH PRIVILEGES;
```

Databases (`Account`, `Patient`, `Consent`, `Abdm`) are created automatically on first run.

### 3. RabbitMQ setup

```bash
# macOS
brew install rabbitmq && brew services start rabbitmq

# Linux
sudo apt install rabbitmq-server && sudo systemctl start rabbitmq-server
```

```bash
rabbitmqctl add_vhost had
rabbitmqctl set_permissions -p had guest ".*" ".*" ".*"
```

### 4. PDF directory

```bash
mkdir -p /tmp/medisync/pdfs   # macOS / Linux
```

### 5. Set environment variables

All sensitive config is read from environment variables. Export these before starting any service:

```bash
# Database (each service uses its own DB name in DB_URL)
export DB_USERNAME="HAD"
export DB_PASSWORD="Medisync.123"

# RabbitMQ
export RABBITMQ_HOST="localhost"
export RABBITMQ_PORT="5672"
export RABBITMQ_USERNAME="guest"
export RABBITMQ_PASSWORD="guest"
export RABBITMQ_VHOST="had"

# Gmail SMTP (for OTP emails — AccountService only)
export GMAIL_USER="your-gmail@gmail.com"
export GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# Hospital identity
export HOSPITAL_NAME="Fledlucifers Eye care Hospital"
export HOSPITAL_ID="IN2210000259"

# ABDM Backend URL (public URL of ABDM_Backend — use localhost for local dev)
export ABDM_URL="http://localhost:9009"

# AES encryption key for DB columns
export DATABASE_ENCRYPTION_KEY="392d07a0b283c84cafb19e8efbacd43760c2dc4b2416320a084b0c56670f73f8"
```

> **Tip:** Put these in a `.env.local` file and run `source .env.local` before starting services.

Each service also needs its own `DB_URL`. Set it per-terminal before running:

```bash
# AccountService terminal
export DB_URL="jdbc:mysql://localhost:3306/Account?createDatabaseIfNotExist=true"

# PatientService terminal
export DB_URL="jdbc:mysql://localhost:3306/Patient?createDatabaseIfNotExist=true"

# ConsentService terminal
export DB_URL="jdbc:mysql://localhost:3306/Consent?createDatabaseIfNotExist=true"

# ABDM_Backend terminal
export DB_URL="jdbc:mysql://localhost:3306/Abdm?createDatabaseIfNotExist=true"
```

### 6. Start backend services

Start each in a separate terminal **in this order** (Eureka must be up before others):

```bash
# Terminal 1 — Eureka Discovery Server
cd Backend/DiscoveryServer && mvn spring-boot:run

# Terminal 2 — API Gateway (wait for Eureka to be ready)
cd Backend/API-Gateway && mvn spring-boot:run

# Terminal 3 — Account Service
export DB_URL="jdbc:mysql://localhost:3306/Account?createDatabaseIfNotExist=true"
cd Backend/AccountService && mvn spring-boot:run

# Terminal 4 — Patient Service
export DB_URL="jdbc:mysql://localhost:3306/Patient?createDatabaseIfNotExist=true"
cd Backend/PatientService && mvn spring-boot:run

# Terminal 5 — Consent Service
export DB_URL="jdbc:mysql://localhost:3306/Consent?createDatabaseIfNotExist=true"
cd Backend/ConsentService && mvn spring-boot:run

# Terminal 6 — ABDM Backend
export DB_URL="jdbc:mysql://localhost:3306/Abdm?createDatabaseIfNotExist=true"
cd ABDM_Backend && mvn spring-boot:run
```

Verify all 6 services are registered at: **http://localhost:8761**

### 7. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 8. Seed demo data

Once all services are running, populate the database with demo users and patients:

```bash
bash seed.sh
```

This creates all 4 demo accounts and 5 patients. You can then log in with the credentials in the [Demo Access](#demo-access) section above.

For a deployed instance:

```bash
MEDISYNC_API_URL=https://your-api-gateway.onrender.com bash seed.sh
```

---

## Role-Based Access

| Role | Capabilities |
|------|-------------|
| `HEAD_DOCTOR` | Full access — manage doctors, patients, consents, view all logs |
| `DOCTOR` | View & update assigned patients, manage records and prescriptions |
| `STAFF` | Patient registration, appointment scheduling |

---

## Environment Configuration

All sensitive values are passed via environment variables — nothing is hardcoded in source.

| Variable | Used by | Description |
|----------|---------|-------------|
| `DB_URL` | All DB services | JDBC connection URL (differs per service) |
| `DB_USERNAME` | All DB services | Database username |
| `DB_PASSWORD` | All DB services | Database password |
| `RABBITMQ_HOST/PORT/USERNAME/PASSWORD/VHOST` | Patient, Consent, ABDM | RabbitMQ connection |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | AccountService | Gmail SMTP for OTP emails |
| `ABDM_URL` | Account, Patient, Consent | Public URL of ABDM_Backend |
| `HOSPITAL_NAME` / `HOSPITAL_ID` | All services | Hospital identity for ABDM |
| `DATABASE_ENCRYPTION_KEY` | Account, Patient, Consent | AES key for column-level encryption |

---

## ABDM Integration

ABDM requires the ABDM_Backend to be **publicly accessible** so it can deliver webhook callbacks. When deployed (Render, GCP, etc.) the service's public URL is used directly — no tunnel needed.

For local development only, expose the ABDM_Backend with ngrok:

```bash
ngrok http 9009
```

Then set `ABDM_URL` to the generated HTTPS URL.
