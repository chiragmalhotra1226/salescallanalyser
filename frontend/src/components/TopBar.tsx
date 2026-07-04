import  { useCallStore } from '../store/callStore'
























function fmtTime(s: number) {
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${m}:${sec}`
}

interface Props {
  onStart: () => void
  onStop: () => void
  onDownload: () => void
}

export default function TopBar({ onStart, onStop, onDownload }: Props) {
  const { isLive, callSeconds, vitals } = useCallStore()

  return (
    <div style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border-sub)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-pri)',
          letterSpacing: '0.04em',
        }}>
          APEX EDTECH
        </span>
        <span style={{
          fontSize: 9,
          color: 'var(--text-sec)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Command Center
        </span>
        {isLive && (
          <span style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 3,
            background: 'var(--green-d)',
            color: 'var(--green)',
            border: '1px solid var(--green-b)',
            letterSpacing: '0.08em',
          }}>
            {vitals.phase}
          </span>
        )}
      </div>

      {/* Centre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isLive && (
          <>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse-dot 1.6s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>
              LIVE
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 500 }}>
              {fmtTime(callSeconds)}
            </span>
          </>
        )}
      </div>

      {/* Right — controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isLive ? (
          <button onClick={onStart} style={btnStyle('var(--green)', 'var(--green-b)')}>
            ● Start Call
          </button>
        ) : (
          <button onClick={onStop} style={btnStyle('var(--red)', 'var(--red-b)')}>
            ■ End Call
          </button>
        )}
        <button
          onClick={onDownload}
          disabled={!callSeconds}
          style={btnStyle('var(--blue)', 'var(--blue-b)', !callSeconds)}
        >
          ↓ Export PDF
        </button>
      </div>
    </div>
  )
}

function btnStyle(color: string, border: string, disabled = false): React.CSSProperties {
  return {
    fontSize: 10,
    padding: '4px 12px',
    borderRadius: 4,
    border: `1px solid ${border}`,
    background: 'transparent',
    color: disabled ? 'var(--text-mute)' : color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-ui)',
    letterSpacing: '0.06em',
    opacity: disabled ? 0.4 : 1,
    transition: 'opacity 0.15s',
  }
}