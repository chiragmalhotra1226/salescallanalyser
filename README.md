# Call Analyser — AI Sales Call Intelligence

AI-powered sales call analysis for edtech teams, by **BetterMind Labs**.
Upload batches of sales calls → ApexVoice AI transcribes them with speaker
detection → Gemini-powered analysis returns call vitals, summaries, objections
and coaching action plans.

## Structure

| Path | What it is |
|---|---|
| `frontend/` | React + Vite marketing site & app UI (landing, pricing, checkout, upload, processing, analysis HUD) |
| `backend/` | FastAPI analysis pipeline (dormant for now — deployable when needed) |
| `render.yaml` | One-click Render blueprint for both services |

## Run locally

```bash
# Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173

# Backend (optional — only needed for real analyses)
pip install -r requirements.txt
cp backend/.env.example backend/.env   # fill in your API keys
uvicorn backend.main:app --reload      # http://localhost:8000
```

## Deploy the frontend

### Render (recommended — supports the backend too)
1. Push this repo to GitHub.
2. On Render: **New → Blueprint**, pick the repo. `render.yaml` sets up:
   - `call-analyser-frontend` — static site built from `frontend/`
   - `call-analyser-api` — FastAPI service (you can delete/suspend this until you need it)
3. For the API service, set `GEMINI_API_KEY`, `FIREFLIES_API_KEY` and
   `PUBLIC_BASE_URL` (the service's own URL) in the dashboard.

Or manually: **New → Static Site**, root directory `frontend`,
build `npm install && npm run build`, publish directory `dist`,
and add a rewrite rule `/* → /index.html`.

### Vercel (frontend only)
1. Import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Defaults work; `frontend/vercel.json` handles SPA routing.
3. When the backend goes live, add env var `VITE_API_URL=https://call-analyser-api.onrender.com`.

## Turning the backend on later

1. Deploy `call-analyser-api` on Render and set its env vars.
2. Set `VITE_API_URL` on the frontend service to the API URL and redeploy.
3. In `frontend/src/pages/UploadPage.tsx`, set `REDIRECT_TO_PRICING = false`
   so the upload flow runs real analyses again.
