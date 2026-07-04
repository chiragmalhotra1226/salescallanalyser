from __future__ import annotations
from typing import Literal, List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid, time
from pydantic import BaseModel, Field
from typing import List, Optional

JobStatus = Literal["queued", "diarizing", "transcribing", "analysing", "done", "error"]


class CallLinkEntry(BaseModel):
    call_index: int
    audio_url: str
    original_filename: str

# Existing models stay, but ensure CallTranscript can store 
# the full text correctly for the frontend.
class CallTranscript(BaseModel):
    file_name: str
    call_index: int
    full_text: str  # This will store the formatted [00:00] Speaker: text
    duration_s: float = 0.0



class UploadedFile(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_name: str
    saved_path: str
    size_bytes: int

class Job(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: JobStatus = "queued"
    files: List[UploadedFile] = []
    created_at: float = Field(default_factory=time.time)
    progress: int = 0                    # 0–100
    progress_label: str = "Queued"
    error: Optional[str] = None
    result_id: Optional[str] = None      # foreign key to results table

class TranscriptSegment(BaseModel):
    speaker: Literal["AGENT", "PARENT"]
    start: float
    end: float
    text: str

class CallTranscript(BaseModel):
    file_name: str
    call_index: int
    segments: List[TranscriptSegment]
    full_text: str                       # formatted "AGENT: ...\nPARENT: ..."
    duration_s: float

# ── Gemini response shape ─────────────────────────────────────────
class VitalsMetrics(BaseModel):
    parent_anxiety: float           # 0–100
    interest_level: float
    technical_curiosity: float
    urgency_to_decide: float
    price_sensitivity: float
    conversion_score: float         # 0–10
    satisfaction_score: float
    tech_intent: float
    admissions_alignment: float
    talk_ratio_agent: float         # 0–100 (agent % of talk time)
    agent_wpm: int
    question_count: int
    objection_count: int
    phase: str                      # call phase at end
    active_keywords: List[str]

class FeedbackPoint(BaseModel):
    area: str
    observation: str
    suggestion: str
    severity: Literal["high", "medium", "low"]

class ChartDataPoint(BaseModel):
    label: str
    value: float

class AnalysisResult(BaseModel):
    result_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    call_count: int
    # Panel 2 content
    executive_summary: str
    call_narrative: str              # paragraph-form story of what happened
    parent_intent: str
    emphasis_points: List[str]
    feedback: List[FeedbackPoint]
    action_plan: List[str]
    common_app_angle: str
    # Charts data
    sentiment_timeline: List[ChartDataPoint]   # anxiety over time
    keyword_frequency: List[ChartDataPoint]    # top keywords by count
    talk_ratio_chart: List[ChartDataPoint]     # agent vs parent
    # Panel 1 vitals (averaged across all calls if multiple)
    vitals: VitalsMetrics
    # Per-call transcripts (Panel 3)
    transcripts: List[CallTranscript]
    created_at: float = Field(default_factory=time.time)