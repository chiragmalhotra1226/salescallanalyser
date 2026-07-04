import { create } from 'zustand'
import type { AnalysisResult, JobStatus } from '../types'

// ── localStorage helpers ──────────────────────────────────────────
const RESULT_KEY = 'apex_last_result'
const JOB_KEY    = 'apex_last_job'
const THEME_KEY  = 'apex_theme'
const ACCENT_KEY = 'apex_accent'

function saveToStorage(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}
function clearStorage(...keys: string[]) {
  keys.forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

export type Page   = 'landing' | 'pricing' | 'checkout' | 'upload' | 'processing' | 'analysis'
export type Theme  = 'dark' | 'light'
export type Accent = 'mint' | 'lavender' | 'peach' | 'sky' | 'rose'

export const ACCENTS: { id: Accent; color: string; label: string }[] = [
  { id: 'mint',     color: '#7be3b0', label: 'Mint'     },
  { id: 'lavender', color: '#b9a7f2', label: 'Lavender' },
  { id: 'peach',    color: '#ffb59e', label: 'Peach'    },
  { id: 'sky',      color: '#8fd0f5', label: 'Sky'      },
  { id: 'rose',     color: '#f7a8c4', label: 'Rose'     },
]

export interface Plan {
  id: string
  name: string
  price: string
}

// ── Browser history integration ───────────────────────────────────
// Each page maps to a URL path so the browser back/forward buttons work
// (e.g. pricing → back → landing) and deep links like /pricing load directly.
const PAGE_PATHS: Record<Page, string> = {
  landing: '/', pricing: '/pricing', checkout: '/checkout',
  upload: '/upload', processing: '/processing', analysis: '/analysis',
}

function pageFromPath(path: string): Page {
  const clean = path.replace(/\/+$/, '') || '/'
  const hit = (Object.entries(PAGE_PATHS) as [Page, string][]).find(([, v]) => v === clean)
  return hit ? hit[0] : 'landing'
}

function syncHistory(p: Page, replace = false) {
  try {
    if (window.location.pathname === PAGE_PATHS[p]) return
    if (replace) window.history.replaceState({ page: p }, '', PAGE_PATHS[p])
    else         window.history.pushState({ page: p }, '', PAGE_PATHS[p])
  } catch {}
}

// ── Determine initial state from persisted values + URL ───────────
function getInitialState(): { page: Page; result: AnalysisResult | null; currentJob: JobStatus | null } {
  const result = loadFromStorage<AnalysisResult>(RESULT_KEY)

  // A job that was mid-flight when the tab closed resumes on the processing page
  const job = loadFromStorage<JobStatus>(JOB_KEY)
  if (job && job.status !== 'done' && job.status !== 'error') {
    return { page: 'processing', result, currentJob: job }
  }

  // Deep link: respect the URL path (guard pages that need data)
  let page = pageFromPath(window.location.pathname)
  if (page === 'analysis' && !result) page = 'landing'
  if (page === 'processing') page = 'landing'

  return { page, result, currentJob: null }
}

function applyThemeToDOM(theme: Theme, accent: Accent) {
  document.documentElement.dataset.theme  = theme
  document.documentElement.dataset.accent = accent
}

interface AppStore {
  page: Page
  currentJob: JobStatus | null
  result: AnalysisResult | null
  activeCallIndex: number
  selectedPlan: Plan | null
  theme: Theme
  accent: Accent

  setPage: (p: Page) => void
  setJob:  (j: JobStatus | null) => void
  setResult: (r: AnalysisResult) => void
  setActiveCallIndex: (i: number) => void
  setPlan: (p: Plan | null) => void
  setTheme: (t: Theme) => void
  setAccent: (a: Accent) => void
  clearAll: () => void
}

const initial       = getInitialState()
const initialTheme  = loadFromStorage<Theme>(THEME_KEY)   ?? 'dark'
const initialAccent = loadFromStorage<Accent>(ACCENT_KEY) ?? 'mint'
applyThemeToDOM(initialTheme, initialAccent)

export const useStore = create<AppStore>((set, get) => ({
  page:            initial.page,
  currentJob:      initial.currentJob,
  result:          initial.result,
  activeCallIndex: 0,
  selectedPlan:    null,
  theme:           initialTheme,
  accent:          initialAccent,

  setPage: (p) => {
    syncHistory(p)
    set({ page: p })
  },

  setJob: (j) => {
    if (j) saveToStorage(JOB_KEY, j)
    else clearStorage(JOB_KEY)
    set({ currentJob: j })
  },

  setResult: (r) => {
    saveToStorage(RESULT_KEY, r)
    clearStorage(JOB_KEY)
    syncHistory('analysis')
    set({ result: r, page: 'analysis' })
  },

  setActiveCallIndex: (i) => set({ activeCallIndex: i }),

  setPlan: (p) => set({ selectedPlan: p }),

  setTheme: (t) => {
    saveToStorage(THEME_KEY, t)
    applyThemeToDOM(t, get().accent)
    set({ theme: t })
  },

  setAccent: (a) => {
    saveToStorage(ACCENT_KEY, a)
    applyThemeToDOM(get().theme, a)
    set({ accent: a })
  },

  clearAll: () => {
    clearStorage(RESULT_KEY, JOB_KEY)
    syncHistory('landing')
    set({ page: 'landing', currentJob: null, result: null, activeCallIndex: 0 })
  },
}))

// Normalise the URL on first load, then keep the store in sync when the
// user presses the browser back / forward buttons.
syncHistory(initial.page, true)
window.addEventListener('popstate', () => {
  useStore.setState({ page: pageFromPath(window.location.pathname) })
})
