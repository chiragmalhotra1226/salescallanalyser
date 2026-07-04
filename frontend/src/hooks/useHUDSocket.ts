import { useRef, useCallback } from 'react'
import { useCallStore } from '../store/callStore'
import type { IntelCard, TranscriptLine, VitalsState, WSEvent } from '../types'

const WS_URL = 'ws://localhost:8000'
const SESSION_ID = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function useHUDSocket() {
  const audioWsRef = useRef<WebSocket | null>(null)
  const hudWsRef   = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    setLive, setSessionId, tickSecond,
    upsertLine, setVitals, prependCard, resetCall,
  } = useCallStore()

  // ── HUD event handler (dispatches incoming WS events to store) ──
  const handleEvent = useCallback((event: MessageEvent) => {
    const msg: WSEvent = JSON.parse(event.data)

    switch (msg.type) {
      case 'transcript':
        upsertLine(msg.data as unknown as TranscriptLine)
        break
      case 'vitals':
        setVitals(msg.data as unknown as VitalsState)
        break
      case 'intel_card':
        prependCard(msg.data as unknown as IntelCard)
        break
      case 'call_status':
        if ((msg.data as { status: string }).status === 'started') {
          setLive(true)
        }
        break
      case 'error':
        console.error('[HUD WS] server error:', msg.data)
        break
    }
  }, [upsertLine, setVitals, prependCard, setLive])

  const connect = useCallback(async () => {
    resetCall()
    const sessionId = SESSION_ID()
    setSessionId(sessionId)

    // ── HUD listener WS (receives broadcast events) ──────────────
    const hudWs = new WebSocket(`${WS_URL}/ws/hud`)
    hudWsRef.current = hudWs
    hudWs.onmessage = handleEvent
    hudWs.onerror   = (e) => console.error('[HUD WS] error', e)

    // Wait for HUD WS to open before starting audio
    await new Promise<void>((res) => {
      hudWs.onopen = () => res()
    })

    // ── Audio WS (sends raw mic bytes) ────────────────────────────
    const audioWs = new WebSocket(`${WS_URL}/ws/audio/${sessionId}`)
    audioWsRef.current = audioWs

    audioWs.onopen = async () => {
      // Capture mic
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (audioWs.readyState === WebSocket.OPEN && e.data.size > 0) {
          audioWs.send(e.data)
        }
      }

      recorder.start(100) // 100ms chunks → low latency
    }

    audioWs.onerror = (e) => console.error('[Audio WS] error', e)

    // ── Call timer ────────────────────────────────────────────────
    timerRef.current = setInterval(tickSecond, 1000)
  }, [resetCall, setSessionId, handleEvent, tickSecond])

  const disconnect = useCallback(async () => {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioWsRef.current?.close()
    hudWsRef.current?.close()
    if (timerRef.current) clearInterval(timerRef.current)
    setLive(false)
  }, [setLive])

  const downloadArtifact = useCallback(async () => {
    const { transcript, callSeconds } = useCallStore.getState()
    const resp = await fetch('/api/post-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        call_duration: callSeconds,
      }),
    })
    if (!resp.ok) {
      console.error('PDF generation failed')
      return
    }
    const blob = await resp.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `apex-artifact-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return { connect, disconnect, downloadArtifact }
}