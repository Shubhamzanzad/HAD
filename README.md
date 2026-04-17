# MediSync — Healthcare Management System

MediSync is a hospital-facing healthcare management platform integrated with **ABDM (Ayushman Bharat Digital Mission)** — India's national digital health infrastructure. It allows hospitals to manage patient records, handle doctor/staff accounts, schedule appointments, and exchange health information using FHIR R4 standards with patient consent.

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
                   │  localhost:9008  │
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
| ABDM_Backend | 9008 | ABDM webhook handler, FHIR data exchange |
| Frontend | 5173 | React dev server |

---

## Prerequisites

- **Java 21** — [Download](https://adoptium.net/)
- **Apache Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+ & npm** — [Download](https://nodejs.org/)
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/)
- **RabbitMQ 3.x** — [Download](https://www.rabbitmq.com/download.html)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Shubhamzanzad/HAD.git
cd HAD
```

### 2. MySQL Setup

Log in to MySQL and create a dedicated user:

```sql
CREATE USER 'HAD'@'localhost' IDENTIFIED BY 'Medisync.123';
GRANT ALL PRIVILEGES ON *.* TO 'HAD'@'localhost';
FLUSH PRIVILEGES;
```

The databases (`Account`, `Patient`, `Consent`, `Abdm`) are created automatically on first run via `createDatabaseIfNotExist=true`.

### 3. RabbitMQ Setup

Install and start RabbitMQ, then create the virtual host:

**macOS (Homebrew):**
```bash
brew install rabbitmq
brew services start rabbitmq
```

**Linux (apt):**
```bash
sudo apt install rabbitmq-server
sudo systemctl start rabbitmq-server
```

**Windows:** Download the installer from [rabbitmq.com](https://www.rabbitmq.com/download.html) and run it.

After RabbitMQ is running, create the virtual host:
```bash
# macOS/Linux
rabbitmqctl add_vhost had
rabbitmqctl set_permissions -p had guest ".*" ".*" ".*"

# Windows (from RabbitMQ install directory)
rabbitmqctl.bat add_vhost had
rabbitmqctl.bat set_permissions -p had guest ".*" ".*" ".*"
```

Then update `PatientService`, `ConsentService`, and `ABDM_Backend` `application.properties` to point to `localhost`:

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
spring.rabbitmq.virtual-host=had
```

### 4. Fix PDF directory (PatientService)

Open `Backend/PatientService/src/main/resources/application.properties` and update `pdf.directory` to a path that exists on your machine:

**macOS/Linux:**
```properties
pdf.directory=/tmp/medisync/pdfs/
```

**Windows:**
```properties
pdf.directory=C:/medisync/pdfs/
```

Create the directory manually:
```bash
# macOS/Linux
mkdir -p /tmp/medisync/pdfs

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path C:\medisync\pdfs
```

### 5. Start Backend Services

Each service has its own `pom.xml`. Run them in separate terminals **in this order**:

```bash
# Terminal 1 — Eureka Discovery Server (must start first)
cd Backend/DiscoveryServer
mvn spring-boot:run

# Terminal 2 — API Gateway (after Eureka is up)
cd Backend/API-Gateway
mvn spring-boot:run

# Terminal 3 — Account Service
cd Backend/AccountService
mvn spring-boot:run

# Terminal 4 — Patient Service
cd Backend/PatientService
mvn spring-boot:run

# Terminal 5 — Consent Service
cd Backend/ConsentService
mvn spring-boot:run

# Terminal 6 — ABDM Backend
cd ABDM_Backend
mvn spring-boot:run
```

Verify all services registered at: http://localhost:8761

### 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Environment Configuration

All configuration lives in `application.properties` files inside each service's `src/main/resources/` directory. Key values to customize:

| Property | File | Description |
|----------|------|-------------|
| `spring.datasource.username/password` | All services | MySQL credentials |
| `spring.mail.username/password` | AccountService | Gmail SMTP for OTP emails |
| `spring.rabbitmq.host` | PatientService, ConsentService, ABDM_Backend | RabbitMQ host |
| `pdf.directory` | PatientService | Local path for generated PDFs |
| `abdm.url` | AccountService, PatientService | ABDM backend public URL (ngrok in dev) |
| `hospital.name` / `hospital.Id` | All services | Hospital details for ABDM registration |
| `database.encryption.key` | All services | AES key for column-level DB encryption |

---

## ABDM Integration Notes

ABDM (Ayushman Bharat Digital Mission) requires your backend to be **publicly accessible** for webhooks. During local development, use [ngrok](https://ngrok.com/) to expose your ABDM_Backend:

```bash
ngrok http 9008
```

Copy the generated HTTPS URL and update `abdm.url` in all `application.properties` files.

---

## Role-Based Access

| Role | Capabilities |
|------|-------------|
| `HEAD_DOCTOR` | Full access — manage doctors, patients, consents |
| `DOCTOR` | View/update assigned patients, manage records |
| `STAFF` | Patient registration, appointment scheduling |
