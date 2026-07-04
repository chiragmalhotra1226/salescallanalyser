import { useStore } from '../store/appStore'
import Panel1Vitals from '../components/Panel1Vitals'
import Panel2Intelligence from '../components/Panel2Intelligence'
import Panel3Transcript from '../components/Panel3Transcript'

export default function AnalysisPage() {
  const { result, clearAll } = useStore()

  if (!result) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        height: 40, background: 'var(--elevated)',
        borderBottom: '1px solid var(--b-sub)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily:'var(--sans)', fontSize:20, fontWeight:600, letterSpacing:'.04em' }}>
            SALES CALL ANALYSER
          </span>
          <span style={{ fontSize:9, color:'var(--sec)', letterSpacing:'.1em' }}>
            {result.call_count} {result.call_count === 1 ? 'CALL' : 'CALLS'} ANALYSED
          </span>
          <span style={{
            fontSize:9, padding:'2px 8px', borderRadius:3,
            background:'var(--green-d)', color:'var(--green)',
            border:'1px solid var(--green-b)', letterSpacing:'.08em',
          }}>
            {result.vitals.phase}
          </span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:9, color:'var(--mute)' }}>
            {new Date(result.created_at * 1000).toLocaleString()}
          </span>
          {/* clearAll wipes localStorage too so a fresh analysis starts clean */}
          <button onClick={clearAll} style={{
            fontFamily:'var(--mono)', fontSize:10,
            padding:'4px 14px', borderRadius:4,
            border:'1px solid var(--b-mid)', background:'transparent',
            color:'var(--sec)', cursor:'pointer', letterSpacing:'.06em',
          }}>
            ← New Analysis
          </button>
        </div>
      </div>

      {/* 3-panel grid */}
      <div style={{
        flex:1, display:'grid',
        gridTemplateColumns:'330px 1fr 550px',
        overflow:'hidden', minHeight:0,
      }}>
        <Panel1Vitals vitals={result.vitals} />
        <Panel2Intelligence result={result} />
        <Panel3Transcript transcripts={result.transcripts} />
      </div>
    </div>
  )
}