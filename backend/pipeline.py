import asyncio, os
import pandas as pd
from pathlib import Path
from backend.fireflies import upload_audio, wait_for_transcript
from backend.database import upsert_job, save_result
from backend.analyser import analyse_calls

def format_time(sec):
    """Converts seconds to MM:SS format."""
    try:
        s = float(sec)
        return f"{int(s//60):02}:{int(s%60):02}"
    except: 
        return "00:00"

async def _update(job, progress, label):
    """Helper to update job status in the database."""
    job.progress = progress
    job.progress_label = label
    await upsert_job(job)

async def process_url(url):
    """Handles the Fireflies transcription lifecycle for a single URL."""
    # Ensure variables here are distinct and defined
    transcript_id = await asyncio.to_thread(upload_audio, url)
    data = await asyncio.to_thread(wait_for_transcript, transcript_id)
    
    # Extract sentences from the Fireflies response
    sentences = data.get('sentences', [])
    lines = [
        f"[{format_time(s['start_time'])}] {s.get('speaker_name','Speaker')}: {s['text']}" 
        for s in sentences
    ]
    return "\n".join(lines)

# Public URL of this server — Fireflies must be able to reach it to fetch
# uploaded audio. Set PUBLIC_BASE_URL on Render (e.g. https://your-api.onrender.com).
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000").rstrip("/")

async def run_pipeline(job):
    """Pipeline for direct audio file uploads."""
    try:
        all_transcripts = []
        for i, f in enumerate(job.files):
            url = f"{PUBLIC_BASE_URL}/uploads/{job.job_id}/{Path(f.saved_path).name}"
            txt = await process_url(url)
            all_transcripts.append({
                "index": i + 1, 
                "name": f.original_name, 
                "text": txt
            })
        
        await finalize_and_analyze(job, all_transcripts)
    except Exception as e:
        job.status = "error"
        job.error = f"Pipeline Error: {str(e)}"
        await upsert_job(job)

async def run_pipeline_from_sheet(job, sheet_path: str):
    """Pipeline for CSV/Excel sheets containing audio_urls."""
    try:
        await _update(job, 10, "Reading Sheet...")
        
        ext = Path(sheet_path).suffix.lower()
        if ext in ['.xlsx', '.xls']:
            df = pd.read_excel(sheet_path)
        else:
            df = pd.read_csv(sheet_path)
            
        df.columns = [c.lower().strip() for c in df.columns]
        
        if 'audio_url' not in df.columns:
            raise ValueError("Sheet must contain an 'audio_url' column.")

        all_transcripts = []
        rows = df.to_dict('records')
        
        for i, row in enumerate(rows):
            url = row.get('audio_url')
            if not url or (isinstance(url, float) and pd.isna(url)): 
                continue
                
            await _update(job, 20 + int((i/len(rows))*50), f"Transcribing Call {i+1} of {len(rows)}...")
            
            # --- THE FIX IS HERE ---
            # We wrap the individual call in a try/except so a single failure doesn't kill the batch
            try:
                # Adding a tiny delay to prevent hammering the Fireflies API rate limit
                await asyncio.sleep(1) 
                transcript_text = await process_url(url)
            except Exception as call_err:
                print(f"[Warning] Call {i+1} failed: {call_err}")
                transcript_text = f"[ERROR] Could not transcribe this call. Reason: {str(call_err)}"
            # -----------------------

            all_transcripts.append({
                "index": i + 1, 
                "name": row.get('filename', f"Call_{i+1}"), 
                "text": transcript_text
            })
        
        await finalize_and_analyze(job, all_transcripts)
        
    except Exception as e:
        job.status = "error"
        job.error = f"Sheet Error: {str(e)}"
        await upsert_job(job)
                
   
async def finalize_and_analyze(job, transcript_data):
    """Combines all transcripts, saves the file, and runs Gemini analysis."""
    try:
        # 1. Combine all text
        combined_text = ""
        for t in transcript_data:
            # We add a check here: if the transcript is an error message, we still include it
            combined_text += f"\n=== CALL {t['index']}: {t['name']} ===\n\n{t['text']}\n"
        
        # 2. Save the transcript to the data folder
        path = Path(f"data/transcripts/{job.job_id}.txt")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(combined_text, encoding="utf-8")
        
        # 3. Analyze with Gemini
        await _update(job, 85, "Gemini Analysis...")
        
        # Running the blocking Gemini call in a separate thread
        res = await asyncio.to_thread(analyse_calls, combined_text, job.job_id)
        
        # 4. THE CRITICAL FIX: Handle the dictionary correctly
        if res and isinstance(res, dict):
            # Save the full JSON to the database
            await save_result(res)
            
            # USE BRACKETS OR .GET(), NEVER DOT NOTATION ON DICTS
            job.result_id = res.get("result_id")
            
            job.status = "done"
            job.progress = 100
            job.progress_label = "Complete"
        else:
            raise ValueError("Gemini returned an invalid response format.")
            
        await upsert_job(job)
        
    except Exception as e:
        print(f"Finalize Error: {str(e)}")
        job.status = "error"
        job.error = f"Analysis Error: {str(e)}"
        await upsert_job(job)