export interface TranscriptSegment {
  speaker: 'AGENT' | 'PARENT'
  start: number
  end: number
  text: string
}

export interface CallTranscript {
  file_name: string
  call_index: number
  segments: TranscriptSegment[]
  full_text: string
  duration_s: number
}

export interface VitalsMetrics {
  parent_anxiety: number
  interest_level: number
  technical_curiosity: number
  urgency_to_decide: number
  price_sensitivity: number
  conversion_score: number
  satisfaction_score: number
  tech_intent: number
  admissions_alignment: number
  talk_ratio_agent: number
  agent_wpm: number
  question_count: number
  objection_count: number
  phase: string
  active_keywords: string[]
}

export interface FeedbackPoint {
  area: string
  observation: string
  suggestion: string
  severity: 'high' | 'medium' | 'low'
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface AnalysisResult {
  result_id: string
  job_id: string
  call_count: number
  executive_summary: string
  call_narrative: string
  parent_intent: string
  emphasis_points: string[]
  feedback: FeedbackPoint[]
  action_plan: string[]
  common_app_angle: string
  sentiment_timeline: ChartDataPoint[]
  keyword_frequency: ChartDataPoint[]
  talk_ratio_chart: ChartDataPoint[]
  vitals: VitalsMetrics
  transcripts: CallTranscript[]
  created_at: number
}

export interface JobStatus {
  job_id: string
  status: 'queued' | 'diarizing' | 'transcribing' | 'analysing' | 'done' | 'error'
  progress: number
  progress_label: string
  error: string | null
  result_id: string | null
  file_count: number
}