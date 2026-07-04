from __future__ import annotations
import asyncio, os, shutil, sys, uuid
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv


from fastapi import FastAPI, UploadFile, File, HTTPException

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.database import init_db, upsert_job, get_job, get_result, list_jobs
from backend.models import Job, UploadedFile
from backend.pipeline import run_pipeline, run_pipeline_from_sheet
from fastapi.staticfiles import StaticFiles


env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)



UPLOAD_DIR   = Path(os.getenv("UPLOAD_DIR", str(PROJECT_ROOT / "data" / "uploads")))
ALLOWED_EXTS = [".csv", ".xlsx", ".xls"]
MAX_FILES    = 30


UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("Database initialised")
    yield


app = FastAPI(title="Apex Call Analyser", lifespan=lifespan)

# Comma-separated list of allowed frontend origins. Defaults cover local dev;
# on Render set CORS_ORIGINS to the deployed frontend URL(s), or "*" for any.
_origins = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in _origins else _origins,
    allow_credentials="*" not in _origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Apex Call Analyser API is running. Visit /docs for documentation."}


@app.post("/api/jobs")
async def create_job(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(400, "No files provided")
    
    job_id = str(uuid.uuid4())
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    first_file = files[0]
    ext = Path(first_file.filename).suffix.lower()
    
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, f"Unsupported format. Use CSV or Excel.")

    dest = job_dir / f"sheet{ext}"
    with open(dest, "wb") as out:
        shutil.copyfileobj(first_file.file, out)

    # --- FIX START ---
    # We must read the sheet count NOW so the UI shows the correct number
    import pandas as pd
    df = pd.read_excel(dest) if ext.startswith('.xl') else pd.read_csv(dest)
    call_count = len(df)
    
    # Create dummy file objects so len(job.files) works in the UI
    dummy_files = [UploadedFile(original_name=f"Call {i+1}", saved_path="", size_bytes=0) for i in range(call_count)]
    
    job = Job(job_id=job_id, status="queued", files=dummy_files)
    # --- FIX END ---
    
    await upsert_job(job)
    asyncio.create_task(run_pipeline_from_sheet(job, str(dest)))

    return {"job_id": job_id}


@app.get("/api/jobs/{job_id}")
async def poll_job(job_id: str):
    """Poll for job status and progress."""
    job = await get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "job_id":         job.job_id,
        "status":         job.status,
        "progress":       job.progress,
        "progress_label": job.progress_label,
        "error":          job.error,
        "result_id":      job.result_id,
        "file_count":     len(job.files),
    }


@app.get("/api/results/{result_id}")
async def get_analysis(result_id: str):
    """Fetch full analysis result."""
    result = await get_result(result_id)
    if not result:
        raise HTTPException(404, "Result not found")
    return result.model_dump()


@app.get("/api/jobs")
async def get_all_jobs():
    """List recent jobs (for history sidebar)."""
    jobs = await list_jobs(limit=20)
    return [
        {
            "job_id":     j.job_id,
            "status":     j.status,
            "progress":   j.progress,
            "file_count": len(j.files),
            "created_at": j.created_at,
            "result_id":  j.result_id,
        }
        for j in jobs
    ]


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    job.status = "error"
    job.error  = "Cancelled by user"
    job.progress_label = "Cancelled"
    await upsert_job(job)
    return {"cancelled": True}

@app.post("/api/jobs/csv")
async def create_job_from_csv(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    temp_csv = UPLOAD_DIR / f"{job_id}_links.csv"
    
    with open(temp_csv, "wb") as out:
        shutil.copyfileobj(file.file, out)
    
    job = Job(job_id=job_id, status="queued")
    await upsert_job(job)
    
    # Run the sheet-based pipeline
    asyncio.create_task(run_pipeline_from_sheet(job, str(temp_csv)))
    return {"job_id": job_id}

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")