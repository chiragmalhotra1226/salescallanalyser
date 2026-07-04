import { useState, useRef, useCallback } from 'react'
import { useStore } from '../store/appStore'
import { api } from '../lib/api'

// While the product is in pre-launch, uploading is gated behind a plan:
// clicking the drop zone (or dropping files) sends visitors to the pricing
// page instead of starting an analysis. Set to false to re-enable uploads
// once the backend is live.
const REDIRECT_TO_PRICING = true

const ALLOWED = ['.mp3','.wav','.m4a','.mp4','.ogg','.flac','.webm','.aac', ".xlsx", ".csv"]
const MAX     = 30

function fmt(bytes: number) {
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

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
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding: 32, animation:'fade-up .4s ease both' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, textAlign:'center' }}>
        <div style={{ fontFamily:'var(--sans)', fontSize:28, fontWeight:700, color:'var(--text)', letterSpacing:'-.01em' }}>
        Call Analyser
        </div>
        <div style={{ fontSize:11, color:'var(--sec)', marginTop:6, letterSpacing:'.08em' }}>
          UPLOAD 1–30 CALL RECORDINGS · EDTECH SALES INTELLIGENCE
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={browse}
        style={{
          width: '100%', maxWidth: 600,
          border: `1.5px dashed ${dragging ? 'var(--blue)' : 'var(--b-mid)'}`,
          borderRadius: 10,
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'var(--blue-d)' : 'var(--surface)',
          transition: 'all .2s',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize:32, marginBottom:12 }}>📁</div>
        <div style={{ fontFamily:'var(--sans)', fontSize:15, fontWeight:500, marginBottom:6 }}>
          Drop audio files here or click to browse
        </div>
        <div style={{ fontSize:10, color:'var(--sec)', letterSpacing:'.06em' }}>
          {ALLOWED.join('  ·  ')} · MAX {MAX} FILES
        </div>
        <input ref={inputRef} type="file" multiple accept={ALLOWED.join(', ')}
          style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ width:'100%', maxWidth:600, marginBottom:16, maxHeight:220, overflowY:'auto' }}>
          {files.map((f,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'7px 12px', borderBottom:'1px solid var(--b-sub)',
              background: i%2===0 ? 'var(--surface)' : 'transparent',
              borderRadius: 4,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:9, padding:'2px 6px', borderRadius:3, background:'var(--blue-d)', color:'var(--blue)', border:'1px solid var(--blue-b)' }}>
                  {f.name.split('.').pop()?.toUpperCase()}
                </span>
                <span style={{ fontSize:11, color:'var(--text)' }}>{f.name}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:10, color:'var(--sec)' }}>{fmt(f.size)}</span>
                <button onClick={e => { e.stopPropagation(); remove(i) }} style={{
                  background:'none', border:'none', color:'var(--red)',
                  cursor:'pointer', fontSize:14, padding:'0 2px',
                }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ color:'var(--red)', fontSize:11, marginBottom:12, maxWidth:600 }}>{error}</div>
      )}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={!files.length || uploading}
        style={{
          fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.08em',
          padding:'12px 36px', borderRadius:6,
          border:`1px solid ${files.length ? 'var(--green-b)' : 'var(--b-sub)'}`,
          background: files.length ? 'var(--green-d)' : 'transparent',
          color: files.length ? 'var(--green)' : 'var(--mute)',
          cursor: files.length && !uploading ? 'pointer' : 'not-allowed',
          transition:'all .2s',
        }}
      >
        {uploading ? 'Uploading…' : `Analyse ${files.length || ''} ${files.length === 1 ? 'Call' : 'Calls'}`}
      </button>

      <div style={{ marginTop:16, fontSize:10, color:'var(--mute)', textAlign:'center', lineHeight:1.7, maxWidth:460 }}>
        Calls are transcribed by ApexVoice AI with automatic speaker detection<br/>
        Gemini-powered analysis · All results saved to your workspace
      </div>
    </div>
  )
}