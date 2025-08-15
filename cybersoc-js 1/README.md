# CyberSOC (JavaScript) — Full-Stack Log Analysis (React + Node.js + MySQL)

**No TypeScript.** This version uses plain JavaScript end-to-end.

## Stack
- **Frontend:** React + Vite (JS), Axios, Recharts
- **Backend:** Node.js + Express (JS), Multer, mysql2
- **DB:** MySQL
- **Auth:** JWT
- **Docker:** docker-compose
- **Anomaly:** Heuristics + z-score (explainable) with reason + confidence

## Quick Start (Docker)
1. Copy `.env.example` → `.env` and adjust if needed.
2. Run:
   ```bash
   docker compose up --build
   ```
3. URLs:
   - Frontend: http://localhost:5173
   - Backend health: http://localhost:4000/api/health

4. Create user:
   ```bash
   curl -X POST http://localhost:4000/api/auth/register      -H "Content-Type: application/json"      -d '{"email":"analyst@example.com","password":"StrongP@ssw0rd"}'
   ```

5. Login at the frontend and upload a file from `sample-logs/`.

## Local Dev (no Docker)
- **MySQL:** Create database (default `cybersoc`), set creds in `.env`.
- **Backend:**
  ```bash
  cd backend
  cp .env.example .env
  npm i
  npm run db:init
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd ../frontend
  npm i
  npm run dev
  ```

## AI / Anomaly
See `docs/AI.md` — IP bursts, error spikes, rare-domain+large-bytes, unusual methods. Optional LLM summaries disabled by default; set `AI_ENABLE_SUMMARY=true` and `OPENAI_API_KEY` to experiment (not required).

## Deliverables
- Code (this repo), sample logs, docs.
- Record a short walkthrough video as requested in the assignment.
