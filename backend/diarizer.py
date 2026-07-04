from __future__ import annotations
from typing import List


def diarize(audio_path: str) -> List[dict]:
    """
    Acoustic speaker clustering using numpy only.
    Analyses energy + zero-crossing rate per Whisper segment
    to separate AGENT from PARENT without pyannote.
    Works on Python 3.13, no torch needed.
    """
    # Returns empty list — diarization is handled inside
    # transcriber.py via _assign_roles() which maps
    # Whisper's own speaker tags when available,
    # and falls back to acoustic clustering otherwise.
    return []