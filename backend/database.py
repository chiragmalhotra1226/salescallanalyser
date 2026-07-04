from __future__ import annotations
import json, os
from pathlib import Path
import aiosqlite
from backend.models import Job, AnalysisResult

DB_PATH = os.getenv("DB_PATH", "data/apex.db")
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id      TEXT PRIMARY KEY,
                status      TEXT NOT NULL,
                progress    INTEGER DEFAULT 0,
                progress_label TEXT DEFAULT 'Queued',
                error       TEXT,
                result_id   TEXT,
                created_at  REAL,
                data        TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS results (
                result_id   TEXT PRIMARY KEY,
                job_id      TEXT NOT NULL,
                data        TEXT NOT NULL,
                created_at  REAL
            )
        """)
        await db.commit()


async def upsert_job(job: Job):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO jobs (job_id, status, progress, progress_label, error, result_id, created_at, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(job_id) DO UPDATE SET
                status         = excluded.status,
                progress       = excluded.progress,
                progress_label = excluded.progress_label,
                error          = excluded.error,
                result_id      = excluded.result_id,
                data           = excluded.data
        """, (
            job.job_id, job.status, job.progress, job.progress_label,
            job.error, job.result_id, job.created_at,
            job.model_dump_json(),
        ))
        await db.commit()


async def get_job(job_id: str) -> Job | None:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM jobs WHERE job_id = ?", (job_id,)) as cur:
            row = await cur.fetchone()
            return Job.model_validate_json(row[0]) if row else None


async def save_result(result: AnalysisResult):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR REPLACE INTO results (result_id, job_id, data, created_at)
            VALUES (?, ?, ?, ?)
        """, (result.result_id, result.job_id, result.model_dump_json(), result.created_at))
        await db.commit()


async def get_result(result_id: str) -> AnalysisResult | None:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM results WHERE result_id = ?", (result_id,)) as cur:
            row = await cur.fetchone()
            return AnalysisResult.model_validate_json(row[0]) if row else None


async def list_jobs(limit: int = 20) -> list[Job]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT data FROM jobs ORDER BY created_at DESC LIMIT ?", (limit,)
        ) as cur:
            rows = await cur.fetchall()
            return [Job.model_validate_json(r[0]) for r in rows]