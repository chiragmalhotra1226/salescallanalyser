import { useState, useRef, useCallback } from 'react'
import type { CSSProperties } from 'react'
import { useStore } from '../store/appStore'
import { api } from '../lib/api'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

// While the product is in pre-launch, uploading is gated behind a plan:
// clicking the drop zone / browse / analyse (or dropping files) sends
// visitors to the pricing page instead of starting an analysis.
// Set to false to re-enable real uploads once the backend is live.
const REDIRECT_TO_PRICING = true

const ALLOWED = ['.mp3','.wav','.m4a','.mp4','.ogg','.flac','.webm','.aac', '.xlsx', '.csv']
const MAX     = 30

const INFO_CARDS = [
  { icon: '🗂️', title: 'Up to 30 calls per batch', desc: 'Upload a whole week of calls at once — audio files or a sheet of recording links.' },
  { icon: '⚡', title: '~2 minutes per call',       desc: 'Transcription, speaker detection and full AI analysis run automatically.' },
  { icon: '🔒', title: 'Private & secure',          desc: 'Your recordings are processed in your own workspace and never shared.' },
]

const NEXT_STEPS = [
  { n: '1', label: 'Transcribe', desc: 'ApexVoice AI converts every call to text with timestamps and speakers' },
  { n: '2', label: 'Analyse',    desc: 'Gemini intelligence scores vitals, objections and buying signals' },
  { n: '3', label: 'Review',     desc: 'Explore the three-panel HUD with coaching feedback per call' },
]

function fmt(bytes: number) {
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

const orb = (size: number, color: string, top: string, left: string, dur: number): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', filter: 'blur(70px)', opacity: .4, background: color,
  animation: `orb-drift ${dur}s ease-in-out infinite`, pointerEvents: 'none',
})

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setPage, setJob } = useStore()

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming)
    const valid = arr.filter(f => ALLOWED.some(ext => f.name.toLowerCase().endsWith(ext)))
    if (valid.length !== arr.length) setError(`Some files ignored — use: ${ALLOWED.join(' ')}`)
    else setError('')
    setFiles(prev => {
      const merged = [...prev, ...valid]
      if (merged.length > MAX) { setError(`Max ${MAX} files`); return prev }
      return merged
    })
  }, [])

  const remove = (i: number) => setFiles(f => f.filter((_,idx) => idx !== i))

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (REDIRECT_TO_PRICING) { setPage('pricing'); return }
    addFiles(e.dataTransfer.files)
  }

  const browse = () => {
    if (REDIRECT_TO_PRICING) { setPage('pricing'); return }
    inputRef.current?.click()
  }

  const submit = async () => {
    if (REDIRECT_TO_PRICING) { setPage('pricing'); return }
    if (!files.length) return
    setUploading(true)
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    try {
      const r = await fetch(api('/api/jobs'), { method: 'POST', body: fd })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Upload failed') }
      const { job_id } = await r.json()
      setJob({ job_id, status: 'queued', progress: 0, progress_label: 'Queued', error: null, result_id: null, file_count: files.length })
      setPage('processing')
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <SiteNav />

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* floating orbs */}
        <div style={orb(300, 'var(--accent)',   '-6%', '4%',  18)} />
        <div style={orb(240, 'var(--accent-2)', '38%', '76%', 22)} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', padding: '64px 24px 40px', textAlign: 'center' }}>
          {/* Header */}
          <div style={{ marginBottom: 40, animation: 'fade-up .5s ease both' }}>
            <div style={{
              display: 'inline-block', fontSize: 10, letterSpacing: '.16em', color: 'var(--accent)',
              border: '1px solid var(--accent-b)', background: 'var(--accent-d)',
              padding: '5px 14px', borderRadius: 16, marginBottom: 20,
            }}>
              STEP 1 OF 3 · UPLOAD
            </div>
            <h1 style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 700, letterSpacing: '-.01em', marginBottom: 12 }}>
              Upload your <span className="hero-gradient">calls</span>
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--sec)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
              Drop up to {MAX} sales call recordings — or a spreadsheet of recording
              links — and let the analysis engine take it from there.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={browse}
            style={{
              border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--accent-b)'}`,
              borderRadius: 16,
              padding: '44px 24px',
              cursor: 'pointer',
              background: dragging ? 'var(--accent-d)' : 'var(--surface)',
              transition: 'all .25s',
              marginBottom: 18,
              animation: 'fade-up .5s ease .15s both, zone-pulse 3s ease-in-out infinite',
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 14, animation: 'float-y 3.5s ease-in-out infinite' }}>📁</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
              Drop files here or click to browse
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              {ALLOWED.map(ext => (
                <span key={ext} style={{
                  fontSize: 9, padding: '3px 9px', borderRadius: 4, letterSpacing: '.06em',
                  background: 'var(--accent-d)', color: 'var(--accent)', border: '1px solid var(--accent-b)',
                }}>
                  {ext.replace('.', '').toUpperCase()}
                </span>
              ))}
            </div>
            <input ref={inputRef} type="file" multiple accept={ALLOWED.join(', ')}
              style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
          </div>

          {/* File list (used once real uploads are enabled) */}
          {files.length > 0 && (
            <div style={{ marginBottom: 16, maxHeight: 220, overflowY: 'auto', textAlign: 'left' }}>
              {files.map((f,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'7px 12px', borderBottom:'1px solid var(--b-sub)',
                  background: i%2===0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:9, padding:'2px 6px', borderRadius:3, background:'var(--accent-d)', color:'var(--accent)', border:'1px solid var(--accent-b)' }}>
                      {f.name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span style={{ fontSize:11 }}>{f.name}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:10, color:'var(--sec)' }}>{fmt(f.size)}</span>
                    <button onClick={e => { e.stopPropagation(); remove(i) }} style={{
                      background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:14,
                    }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <div style={{ color:'var(--red)', fontSize:11, marginBottom:12 }}>{error}</div>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fade-up .5s ease .3s both' }}>
            <button className="btn-accent" style={{ fontSize: 13, padding: '13px 36px' }} onClick={submit} disabled={uploading}>
              {uploading ? 'Uploading…' : files.length ? `Analyse ${files.length} ${files.length === 1 ? 'Call' : 'Calls'}` : 'Upload Files →'}
            </button>
            <button className="btn-ghost" style={{ fontSize: 13, padding: '13px 28px' }} onClick={browse}>
              Browse Files
            </button>
          </div>

          <div style={{ marginTop: 18, fontSize: 10, color: 'var(--mute)', lineHeight: 1.7 }}>
            Calls are transcribed by ApexVoice AI with automatic speaker detection<br/>
            Gemini-powered analysis · All results saved to your workspace
          </div>
        </div>
      </div>

      {/* Info cards */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '30px 24px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {INFO_CARDS.map((c, i) => (
            <div key={c.title} className="feature-card" style={{ padding: '22px 20px', animation: `fade-up .5s ease ${.35 + i * .12}s both` }}>
              <div style={{ fontSize: 22, marginBottom: 10, animation: `float-y ${3 + i}s ease-in-out infinite` }}>{c.icon}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 11, lineHeight: 1.75, color: 'var(--sec)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What happens next */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26, animation: 'fade-up .5s ease .5s both' }}>
          <span style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--sec)' }}>WHAT HAPPENS AFTER YOU UPLOAD</span>
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {NEXT_STEPS.map((s, i) => (
            <div key={s.n} style={{
              flex: '1 1 220px', maxWidth: 280, display: 'flex', gap: 14, alignItems: 'flex-start',
              border: '1px solid var(--b-sub)', borderRadius: 12, padding: '18px 18px',
              background: 'var(--surface)', animation: `fade-up .5s ease ${.6 + i * .12}s both`,
            }}>
              <span style={{
                width: 26, height: 26, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
                color: 'var(--accent-ink)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--sans)',
              }}>{s.n}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontSize: 10.5, lineHeight: 1.7, color: 'var(--sec)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
