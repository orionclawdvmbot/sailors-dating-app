# Sailors Dating App - Setup Instructions

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start the stack:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Database: localhost:5432

## Services

- **Database:** PostgreSQL 15 (sailors_db)
- **Backend:** Node.js/Express API (sailors_backend)
- **Frontend:** React app (sailors_frontend)

## Health Check

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-09T19:51:26.894Z"}
```

## Stack Status

```bash
docker compose ps
```

All services should be "Up" and database should be "healthy".

---

**Last validated:** 2026-02-09
