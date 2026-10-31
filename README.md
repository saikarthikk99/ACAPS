# ACAPS — Adaptive Context-Aware Packet Scheduling

A simulation platform for understanding how adaptive packet scheduling behaves
under changing network conditions, comparing FIFO, Static Priority, and ACAPS
schedulers on the same generated workload.

## Project layout

- `backend/` — Python simulation engine and FastAPI service (see `backend/README.md`)
- `frontend/` — React + TypeScript web UI (see `frontend/docs/` for details)

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # On Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn acaps.api.app:app --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (typically http://localhost:5173).

## Tests

```bash
cd backend
pytest
```
