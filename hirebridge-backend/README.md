# HireBridge AI – Backend (Phase 1)

Pan-India Intelligent Placement & Recruitment Management Platform

---

## Requirements

| Tool | Version |
|------|---------|
| Java | 21 |
| Maven | 3.9+ (or use the included wrapper) |
| PostgreSQL | 18 |

---

## PostgreSQL Configuration

The application connects to an **existing** database. Do **not** create a new one.

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | `hirebridge_db` |
| Username | `hirebridge_user` |
| Password | set via `DB_PASSWORD` environment variable |

---

## Setting DB_PASSWORD

### Windows PowerShell
```powershell
$env:DB_PASSWORD="YOUR_ACTUAL_PASSWORD"
```

### Windows Command Prompt (cmd)
```cmd
set DB_PASSWORD=YOUR_ACTUAL_PASSWORD
```

### Linux / macOS
```bash
export DB_PASSWORD="YOUR_ACTUAL_PASSWORD"
```

> The password is **never** hardcoded. The app will refuse to start if `DB_PASSWORD` is not set.

---

## Build & Run

### Using the Maven Wrapper (recommended)

**Windows PowerShell / cmd**
```powershell
# 1. Set the DB password (PowerShell)
$env:DB_PASSWORD="YOUR_ACTUAL_PASSWORD"

# 2. Start the server
.\mvnw.cmd spring-boot:run
```

### Using system Maven
```bash
mvn spring-boot:run
```

The server starts at **http://localhost:8080**

---

## Maven Commands

| Command | Description |
|---------|-------------|
| `.\mvnw.cmd spring-boot:run` | Start the application |
| `.\mvnw.cmd clean package` | Build a runnable JAR |
| `.\mvnw.cmd test` | Run unit tests |
| `.\mvnw.cmd clean` | Remove build artifacts |

---

## Testing the Health Endpoint

```powershell
# PowerShell
Invoke-WebRequest -Uri http://localhost:8080/api/health | Select-Object -ExpandProperty Content
```

```bash
# curl
curl http://localhost:8080/api/health
```

**Expected response (200 OK)**
```json
{
  "application": "HireBridge AI",
  "backend": "Running",
  "database": "Connected"
}
```

**If the database is unreachable (503 Service Unavailable)**
```json
{
  "application": "HireBridge AI",
  "backend": "Running",
  "database": "Unavailable",
  "error": "<error details>"
}
```

---

## Project Structure

```
hirebridge-backend/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/hirebridge/
    │   │   ├── HirebridgeApplication.java      # Main entry point
    │   │   └── controller/
    │   │       └── HealthController.java        # GET /api/health
    │   └── resources/
    │       └── application.properties           # App & DB config
    └── test/
        └── java/com/hirebridge/
            └── HirebridgeApplicationTests.java  # Context smoke test
```

---

## Phases

- **Phase 1** ✅ – Project setup, PostgreSQL connectivity, health endpoint
- Phase 2 – Authentication & Authorization (JWT + Spring Security)
- Phase 3 – Student, Recruiter, Admin modules
