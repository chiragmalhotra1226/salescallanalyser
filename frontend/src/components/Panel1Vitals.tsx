import type { VitalsMetrics } from '../types'

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--sec)', letterSpacing: '.07em', textTransform:'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex:1, height:4, background:'var(--b-sub)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:`${Math.round(value)}%`, height:'100%', background:color, borderRadius:3, transition:'width 1.2s ease' }} />
        </div>
        <span style={{ fontSize:14, color, minWidth:30, textAlign:'right' }}>{Math.round(value)}%</span>
      </div>
    </div>
  )
}

function ScoreCard({ label, value, sub, color }: { label:string; value:number; sub:string; color:string }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--b-sub)', borderRadius:5, padding:'7px 9px' }}>
      <div style={{ fontSize:12, color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:23, fontWeight:600, fontFamily:'var(--sans)', lineHeight:1.2 }}>{value.toFixed(1)}</div>
      <div style={{ fontSize:12, color:'var(--mute)', marginBottom:5 }}>{sub}</div>
      <div style={{ height:3, background:'var(--b-sub)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:2, background:color, width:`${value*10}%`, transition:'width 1.2s ease' }} />
      </div>
    </div>
  )
}

function Divider() { return <div style={{ borderTop:'1px solid var(--b-sub)', margin:'10px 0' }} /> }
function SLabel({ children }: { children: string }) {
  return <div style={{ fontSize:13, color:'white', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>{children}</div>
}

const KW_STYLE: Record<string, { bg:string; border:string; color:string }> = {
  admissions: { bg:'#1d1010', border:'#7a2020', color:'var(--red)'    },
  academic:   { bg:'#1d1010', border:'#7a2020', color:'var(--red)'    },
  financial:  { bg:'#1a150a', border:'#7a5510', color:'var(--amber)'  },
  program:    { bg:'#1a150a', border:'#7a5510', color:'var(--amber)'  },
  technical:  { bg:'#0d1520', border:'#1a4a7a', color:'var(--blue)'   },
  positive:   { bg:'#0e1a0e', border:'#1a5a1a', color:'var(--green)'  },
  default:    { bg:'#12121a', border:'#2a2a4a', color:'var(--sec)'    },
}
function kwStyle(kw: string) {
  const lower = kw.toLowerCase()
  if (['ivy league','gpa','college','common app','admissions'].some(k => lower.includes(k))) return KW_STYLE.admissions
  if (['price','cost','scholarship','fee','afford'].some(k => lower.includes(k))) return KW_STYLE.financial
  if (['python','ai','ml','code','model','algorithm'].some(k => lower.includes(k))) return KW_STYLE.technical
  if (['capstone','mentor','enroll','1-on-1'].some(k => lower.includes(k))) return KW_STYLE.positive
  return KW_STYLE.default
}

export default function Panel1Vitals({ vitals }: { vitals: VitalsMetrics }) {
  const agPct = Math.round(vitals.talk_ratio_agent)
  const paPct = 100 - agPct

  return (
    <div style={{ borderRight:'1px solid var(--b-sub)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={headerStyle}>
        
        <span style={{ color: 'white' }}>1. VITALS</span>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>

        <Gauge label="Parent Anxiety"       value={vitals.parent_anxiety}        color="var(--red)"    />
        <Gauge label="Interest Level"       value={vitals.interest_level}        color="var(--green)"  />
        <Gauge label="Technical Curiosity"  value={vitals.technical_curiosity}   color="var(--blue)"   />
        <Gauge label="Urgency to Decide"    value={vitals.urgency_to_decide}     color="var(--amber)"  />
        <Gauge label="Price Sensitivity"    value={vitals.price_sensitivity}     color="var(--purple)" />

        <Divider />
        <SLabel>Score Cards</SLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
          <ScoreCard label="Conversion"     value={vitals.conversion_score}     sub="/ 10 follow-up" color="var(--green)"  />
          <ScoreCard label="Satisfaction"   value={vitals.satisfaction_score}   sub="/ 10 heard"     color="var(--blue)"   />
          <ScoreCard label="Tech Intent"    value={vitals.tech_intent}          sub="/ 10 depth"     color="var(--purple)" />
          <ScoreCard label="Adm. Alignment" value={vitals.admissions_alignment} sub="/ 10 spike fit" color="var(--amber)"  />
        </div>

        <Divider />
        <SLabel>Talk Ratio</SLabel>
        <div style={{ height:6, display:'flex', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
          <div style={{ width:`${agPct}%`, background:'var(--blue)', transition:'width 1.2s ease' }} />
          <div style={{ width:`${paPct}%`, background:'var(--amber)', transition:'width 1.2s ease' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
          <span style={{ color:'var(--blue)' }}>AG {agPct}%</span>
          <span style={{ color:'var(--amber)' }}>PA {paPct}%</span>
        </div>

        <Divider />
        <SLabel>Pacing</SLabel>
        <div style={{ display:'flex', gap:5, marginBottom:8 }}>
          {[
            { val: vitals.agent_wpm,      lbl:'WPM'        },
            { val: vitals.question_count, lbl:'Questions'  },
            { val: vitals.objection_count,lbl:'Objections' },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--b-sub)', borderRadius:4, padding:'9px 11px', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:500 }}>{val}</div>
              <div style={{ fontSize:12, color:'var(--mute)', marginTop:1 }}>{lbl}</div>
            </div>
          ))}
        </div>

        <Divider />
        <SLabel>Active Keywords</SLabel>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {vitals.active_keywords.map(kw => {
            const s = kwStyle(kw)
            return (
              <span key={kw} style={{ fontSize:13, padding:'2px 7px', borderRadius:3, border:`1px solid ${s.border}`, background:s.bg, color:s.color }}>
                {kw}
              </span>
            )
          })}
        </div>

      </div>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  height:33, borderBottom:'1px solid var(--b-sub)',
  display:'flex', alignItems:'center', gap:6, padding:'0 11px',
  fontSize:13, color:'var(--mute)', letterSpacing:'.1em',
  textTransform:'uppercase', flexShrink:0,
}
const numBadge: React.CSSProperties = {
  background:'var(--elevated)', color:'var(--mute)',
  width:13, height:13, borderRadius:2, fontSize:12,
  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
}