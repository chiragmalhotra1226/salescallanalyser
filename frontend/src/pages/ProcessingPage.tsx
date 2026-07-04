import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/appStore'
import { api } from '../lib/api'
import type { JobStatus } from '../types'

const STEPS = [
  { label: 'Queued',       pct: 0   },
  { label: 'Transcribing', pct: 8   },
  { label: 'Analysing',    pct: 78  },
  { label: 'Complete',     pct: 100 },
]

const MAX_POLLS = 900   // 900 × 2s = 30 min max

export default function ProcessingPage() {
  const { currentJob, setJob, setResult, clearAll } = useStore()
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentJob) { clearAll(); return }

    if (currentJob.status === 'error') {
      setLocalError(currentJob.error ?? 'Job failed'); return
    }
    if (currentJob.status === 'done' && currentJob.result_id) {
      fetch(api(`/api/results/${currentJob.result_id}`))
        .then(r => r.json()).then(setResult)
        .catch(() => setLocalError('Failed to load result'))
      return
    }

    pollCountRef.current = 0

    const poll = async () => {
      pollCountRef.current++
      if (pollCountRef.current > MAX_POLLS) {
        clearInterval(intervalRef.current!)
        setLocalError('Timed out after 30 minutes. Please try again.')
        return
      }
      try {
        const r = await fetch(api(`/api/jobs/${currentJob.job_id}`))
        if (r.status === 404) {
          clearInterval(intervalRef.current!)
          setLocalError('Job not found — please upload again.')
          return
        }
        const job: JobStatus = await r.json()
        setJob(job)
        if (job.status === 'done' && job.result_id) {
          clearInterval(intervalRef.current!)
          const rr = await fetch(api(`/api/results/${job.result_id}`))
          setResult(await rr.json())
        } else if (job.status === 'error') {
          clearInterval(intervalRef.current!)
          setLocalError(job.error ?? 'Pipeline error')
        }
      } catch (e) {
        console.error('Poll error', e)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 2000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [currentJob?.job_id])

  if (!currentJob) return null

  const pct    = currentJob.progress
  const label  = currentJob.progress_label
  const isErr  = currentJob.status === 'error' || !!localError
  const errMsg = localError ?? currentJob.error ?? 'Unknown error'
  const n      = currentJob.file_count

  // Change 4: parse "~X min left" from label if present
  const timeLeft = label.match(/~(\d+) min left/)
  const etaText  = timeLeft ? `~${timeLeft[1]} min remaining` : null

  // Determine active step
  const activeStep = STEPS.reduce((acc, s) => pct >= s.pct ? s : acc, STEPS[0])

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40,
    }}>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 600, marginBottom: 6,
        color: isErr ? 'var(--red)' : 'var(--text)',
      }}>
        {isErr ? '⚠ Failed' : pct === 100 ? '✓ Complete' : 'Analysing Calls…'}
      </div>

      {/* Subtitle */}
      <div style={{ fontSize: 11, color: 'var(--sec)', marginBottom: 48, letterSpacing: '.07em' }}>
        {n} {n === 1 ? 'CALL' : 'CALLS'}
        {!isErr && activeStep && ` · ${activeStep.label.toUpperCase()}`}
      </div>

      {/* Progress bar */}
      {!isErr && (
        <div style={{ width: '100%', maxWidth: 540 }}>
          {/* Bar */}
          <div style={{
            height: 6, background: 'var(--b-sub)',
            borderRadius: 4, overflow: 'hidden', marginBottom: 24,
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${pct}%`, background: 'var(--green)',
              transition: 'width 1s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
            {STEPS.map(step => {
              const done = pct >= step.pct
              return (
                <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: done ? 'var(--green)' : 'var(--b-mid)',
                    boxShadow: done ? '0 0 6px var(--green)' : 'none',
                    transition: 'all .5s',
                  }} />
                  <span style={{
                    fontSize: 8, letterSpacing: '.09em', textTransform: 'uppercase',
                    color: done ? 'var(--green)' : 'var(--mute)',
                  }}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Change 4: live label from Whisper + ETA */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, lineHeight: 1.6 }}>
              {label}
            </div>
            {etaText && (
              <div style={{
                fontSize: 11, color: 'var(--amber)',
                background: 'var(--amber-d)', border: '1px solid var(--amber-b)',
                borderRadius: 4, padding: '3px 12px', display: 'inline-block',
              }}>
                {etaText}
              </div>
            )}
          </div>

          {!isErr && pct < 100 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 32 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '2px solid var(--b-mid)', borderTopColor: 'var(--green)',
              animation: 'spin .8s linear infinite',
            }} />
            <button
              onClick={async () => {
                if (!currentJob) return
                await fetch(api(`/api/jobs/${currentJob.job_id}/cancel`), { method: 'POST' })
                clearAll()
              }}
              style={{
                fontFamily: 'var(--mono)', fontSize: 10,
                padding: '6px 20px', borderRadius: 4,
                border: '1px solid var(--red-b)',
                background: 'var(--red-d)',
                color: 'var(--red)', cursor: 'pointer',
                letterSpacing: '.06em',
              }}
            >
              Cancel Analysis
            </button>
          </div>
        )}
        </div>
      )}

      {/* Error state */}
      {isErr && (
        <>
          <div style={{
            fontSize: 12, color: 'var(--red)', textAlign: 'center',
            maxWidth: 480, lineHeight: 1.7, marginBottom: 24,
          }}>
            {errMsg}
          </div>
          <button onClick={clearAll} style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            padding: '9px 28px', borderRadius: 5,
            border: '1px solid var(--b-mid)', background: 'transparent',
            color: 'var(--text)', cursor: 'pointer', letterSpacing: '.06em',
          }}>
            ← Upload Again
          </button>
        </>
      )}
    </div>
  )
}