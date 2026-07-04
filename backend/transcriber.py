from __future__ import annotations
import os, subprocess, tempfile
from pathlib import Path
from typing import List, Optional, Callable

from faster_whisper import WhisperModel
from backend.models import TranscriptSegment, CallTranscript

_whisper: Optional[WhisperModel] = None


def _ffmpeg() -> str:
    env = os.getenv("FFMPEG_PATH", "").strip()
    if env and Path(env).exists():
        return env
    for p in [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
        r"C:\tools\ffmpeg\bin\ffmpeg.exe",
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
    ]:
        if Path(p).exists():
            return p
    return "ffmpeg"


def _ffprobe() -> str:
    env = os.getenv("FFMPEG_PATH", "").strip()
    if env:
        for name in ["ffprobe.exe", "ffprobe"]:
            p = str(Path(env).parent / name)
            if Path(p).exists():
                return p
    for p in [
        r"C:\ffmpeg\bin\ffprobe.exe",
        r"C:\Program Files\ffmpeg\bin\ffprobe.exe",
        r"C:\tools\ffmpeg\bin\ffprobe.exe",
        r"C:\ProgramData\chocolatey\bin\ffprobe.exe",
    ]:
        if Path(p).exists():
            return p
    return "ffprobe"


def _get_model() -> WhisperModel:
    global _whisper
    if _whisper is not None:
        return _whisper
    size = os.getenv("WHISPER_MODEL", "base")
    print(f"[Whisper] Loading '{size}' model...")
    _whisper = WhisperModel(size, device="cpu", compute_type="int8", num_workers=2)
    print(f"[Whisper] Model ready.")
    return _whisper


def _probe_duration(path: str) -> float:
    try:
        r = subprocess.run(
            [_ffprobe(), "-v", "error",
             "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            capture_output=True, text=True, timeout=30)
        return float(r.stdout.strip())
    except Exception:
        return 0.0


def _enhance(audio_path: str) -> str:
    """
    Change 1: Convert to 8kHz mono WAV instead of 16kHz.
    8kHz = phone call quality, perfectly sufficient for speech.
    Halves the WAV size and Whisper processing time vs 16kHz.
    41.6MB at 16kHz → ~20MB at 8kHz.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()

    cmd = [
        _ffmpeg(), "-y",
        "-i", audio_path,
        "-af", (
            "highpass=f=80,"
            "lowpass=f=3400,"       # 3.4kHz Nyquist for 8kHz sample rate
            "volume=2.0,"
            "loudnorm=I=-16:LRA=11:TP=-1.5"
        ),
        "-ar", "8000",              # Change 1: 8kHz not 16kHz
        "-ac", "1",
        "-acodec", "pcm_s16le",
        tmp.name,
    ]

    r = subprocess.run(cmd, capture_output=True, timeout=600)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {r.stderr.decode(errors='replace')[:300]}")

    size_mb  = Path(tmp.name).stat().st_size / 1024 / 1024
    duration = _probe_duration(tmp.name)
    mins     = int(duration // 60)
    secs     = int(duration % 60)
    print(f"[Transcriber] Enhanced WAV: {size_mb:.1f} MB | Audio length: {mins}m {secs}s")
    return tmp.name

def _transcribe_chunk(args):
    """Runs in a separate process — must be top-level for pickling."""
    chunk_path, model_size = args
    from faster_whisper import WhisperModel
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segs, _ = model.transcribe(
        chunk_path, language="en", word_timestamps=True,
        vad_filter=True, beam_size=3, best_of=3, temperature=0.0,
    )
    words = []
    for seg in segs:
        for w in (getattr(seg, "words", None) or []):
            word = getattr(w, "word", "").strip()
            if word:
                words.append({
                    "word": word,
                    "start": round(float(w.start), 3),
                    "end":   round(float(w.end),   3),
                    "speaker": None,
                })
    return words

def transcribe_file(audio_path, progress_cb=None):
    import concurrent.futures, math
    
    enhanced = _enhance(audio_path)
    duration = _probe_duration(enhanced)
    model_size = os.getenv("WHISPER_MODEL", "tiny")
    
    CHUNK_SECS = 300   # 5 minutes per chunk
    n_chunks = max(1, math.ceil(duration / CHUNK_SECS))
    
    # Split into chunks with 2-second overlap to avoid cutting words
    chunks = []
    for i in range(n_chunks):
        start = max(0, i * CHUNK_SECS - 2)
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp.close()
        subprocess.run([
            _ffmpeg(), "-y", "-ss", str(start),
            "-i", enhanced, "-t", str(CHUNK_SECS + 2),
            "-ar", "8000", "-ac", "1", tmp.name
        ], capture_output=True, timeout=120)
        chunks.append((tmp.name, i, start))
    
    Path(enhanced).unlink(missing_ok=True)
    
    if progress_cb:
        progress_cb(5, f"Transcribing {int(duration//60)}m audio in {n_chunks} chunks…")
    
    # Transcribe all chunks in parallel using separate processes
    n_workers = min(n_chunks, os.cpu_count() or 4)
    args = [(c[0], model_size) for c in chunks]
    
    all_words = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=n_workers) as ex:
        futures = {ex.submit(_transcribe_chunk, a): chunks[i] for i, a in enumerate(args)}
        done = 0
        for fut in concurrent.futures.as_completed(futures):
            chunk_path, chunk_idx, time_offset = futures[fut]
            chunk_words = fut.result()
            # Adjust timestamps by chunk start offset
            for w in chunk_words:
                w["start"] = round(w["start"] + time_offset, 3)
                w["end"]   = round(w["end"]   + time_offset, 3)
            all_words.extend(chunk_words)
            Path(chunk_path).unlink(missing_ok=True)
            done += 1
            if progress_cb:
                pct = int(done / n_chunks * 80) + 5
                progress_cb(pct, f"Transcribed {done}/{n_chunks} chunks…")
    
    # Sort by start time (parallel execution returns out of order)
    all_words.sort(key=lambda w: w["start"])
    
    # Deduplicate words in overlap zones (within 0.1s of each other)
    deduped = []
    for w in all_words:
        if not deduped or w["start"] - deduped[-1]["start"] > 0.1:
            deduped.append(w)
    
    print(f"[Whisper] Done — {len(deduped)} words from {n_chunks} chunks")
    return deduped

def _assign_roles(words: List[dict]) -> List[dict]:
    """Map speaker IDs from diarization to AGENT/PARENT.
    First speaker detected = AGENT."""
    result = []
    first_speaker = None
    for w in words:
        sp = w.get("speaker")
        if sp is not None and first_speaker is None:
            first_speaker = sp
        if sp is None or first_speaker is None:
            role = "AGENT"
        else:
            role = "AGENT" if sp == first_speaker else "PARENT"
        result.append({**w, "role": role})
    return result

def build_segments(words: List[dict]) -> List[TranscriptSegment]:
    if not words:
        return []
    tagged = _assign_roles(words)

    segs: List[TranscriptSegment] = []
    cur_role  = tagged[0]["role"]
    cur_words = [tagged[0]["word"]]
    cur_start = tagged[0]["start"]
    cur_end   = tagged[0]["end"]

    for w in tagged[1:]:
        if w["role"] == cur_role:
            cur_words.append(w["word"])
            cur_end = w["end"]
        else:
            text = " ".join(cur_words).strip()
            if text:
                segs.append(TranscriptSegment(
                    speaker=cur_role, start=cur_start, end=cur_end, text=text))
            cur_role  = w["role"]
            cur_words = [w["word"]]
            cur_start = w["start"]
            cur_end   = w["end"]

    text = " ".join(cur_words).strip()
    if text:
        segs.append(TranscriptSegment(
            speaker=cur_role, start=cur_start, end=cur_end, text=text))

    # Merge very short segments (< 3 words) into previous
    merged: List[TranscriptSegment] = []
    for seg in segs:
        if merged and len(seg.text.split()) < 3:
            p = merged[-1]
            merged[-1] = TranscriptSegment(
                speaker=p.speaker, start=p.start,
                end=seg.end, text=p.text + " " + seg.text)
        else:
            merged.append(seg)
    return merged


def apply_diarization(words, diar_segments):
    for w in words:
        for seg in diar_segments:
            if seg["start"] <= w["start"] <= seg["end"]:
                w["speaker"] = seg["speaker"]
                break
    return words


def build_call_transcript(
    file_name: str, call_index: int,
    segments: List[TranscriptSegment], duration_s: float,
) -> CallTranscript:
    lines = [
        f"[{int(s.start//60):02d}:{int(s.start%60):02d}] {s.speaker}: {s.text}"
        for s in segments
    ]
    return CallTranscript(
        file_name=file_name, call_index=call_index,
        segments=segments, full_text="\n".join(lines), duration_s=duration_s)
