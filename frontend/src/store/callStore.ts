import { create } from 'zustand'
import type { IntelCard, TranscriptLine, VitalsState, CallPhase } from '../types'

const DEFAULT_VITALS: VitalsState = {
  anxiety: 30,
  interest: 40,
  technical_curiosity: 35,
  urgency: 25,
  price_sensitivity: 40,
  conversion_score: 5.0,
  satisfaction_score: 5.0,
  tech_intent: 4.0,
  admissions_alignment: 5.0,
  agent_wpm: 0,
  talk_ratio_agent: 50,
  question_count: 0,
  silence_count: 0,
  phase: 'Opening' as CallPhase,
}

interface CallStore {
  isLive: boolean
  callSeconds: number
  sessionId: string | null
  transcript: TranscriptLine[]
  intelCards: IntelCard[]
  vitals: VitalsState

  setLive: (v: boolean) => void
  setSessionId: (id: string) => void
  tickSecond: () => void
  upsertLine: (line: TranscriptLine) => void
  setVitals: (v: VitalsState) => void
  prependCard: (card: IntelCard) => void
  markCardSeen: (id: string) => void
  resetCall: () => void
}

export const useCallStore = create<CallStore>((set) => ({
  isLive: false,
  callSeconds: 0,
  sessionId: null,
  transcript: [],
  intelCards: [],
  vitals: DEFAULT_VITALS,

  setLive: (v) => set({ isLive: v }),
  setSessionId: (id) => set({ sessionId: id }),
  tickSecond: () => set((s) => ({ callSeconds: s.callSeconds + 1 })),

  upsertLine: (line) =>
    set((s) => {
      const exists = s.transcript.some((l) => l.id === line.id)
      return {
        transcript: exists
          ? s.transcript.map((l) => (l.id === line.id ? line : l))
          : [...s.transcript, line],
      }
    }),

  setVitals: (v) => set({ vitals: v }),

  prependCard: (card) =>
    set((s) => ({ intelCards: [card, ...s.intelCards].slice(0, 60) })),

  markCardSeen: (id) =>
    set((s) => ({
      intelCards: s.intelCards.map((c) =>
        c.id === id ? { ...c, is_new: false } : c
      ),
    })),

  resetCall: () =>
    set({
      isLive: false,
      callSeconds: 0,
      sessionId: null,
      transcript: [],
      intelCards: [],
      vitals: DEFAULT_VITALS,
    }),
}))