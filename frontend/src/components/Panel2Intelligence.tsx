import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type { AnalysisResult, FeedbackPoint } from '../types'

const SEV_COLOR = { high:'var(--red)', medium:'var(--amber)', low:'var(--green)' }
const SEV_BG    = { high:'var(--red-d)', medium:'var(--amber-d)', low:'var(--green-d)' }
const SEV_BORDER = { high:'var(--red-b)', medium:'var(--amber-b)', low:'var(--green-b)' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, color:'var(--green)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function FeedbackCard({ fb }: { fb: FeedbackPoint }) {
  return (
    <div style={{
      border:`1px solid ${SEV_BORDER[fb.severity]}`,
      background: SEV_BG[fb.severity],
      borderRadius:6, padding:'9px 11px', marginBottom:7,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:14, fontWeight:600, fontFamily:'var(--sans)', color:'var(--text)' }}>{fb.area}</span>
        <span style={{ fontSize:4, padding:'1px 6px', borderRadius:3, border:`1px solid ${SEV_BORDER[fb.severity]}`, color:SEV_COLOR[fb.severity], textTransform:'uppercase', letterSpacing:'.08em' }}>
          {fb.severity}
        </span>
      </div>
      <p style={{ fontSize:15, color:'var(--sec)', lineHeight:1.55, marginBottom:6, fontFamily:'var(--sans)' }}>{fb.observation}</p>
      <div style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
        <span style={{ fontSize:13, color:SEV_COLOR[fb.severity], flexShrink:0, marginTop:1 }}>→</span>
        <p style={{ fontSize:15, color:'var(--text)', lineHeight:1.55, fontFamily:'var(--sans)' }}>{fb.suggestion}</p>
      </div>
    </div>
  )
}

const chartTooltipStyle = {
  contentStyle: { background:'var(--elevated)', border:'1px solid var(--b-mid)', borderRadius:6, fontSize:14 },
  labelStyle:   { color:'var(--sec)' },
  itemStyle:    { color:'var(--text)' },
}

export default function Panel2Intelligence({ result }: { result: AnalysisResult }) {
  const talkData = [
    { name:'Agent', value: result.vitals.talk_ratio_agent,       fill:'var(--blue)'  },
    { name:'Parent', value: 100 - result.vitals.talk_ratio_agent, fill:'var(--amber)' },
  ]

  return (
    <div style={{ borderRight:'1px solid var(--b-sub)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={headerStyle}>
        
        <span style={{ color: 'white' }}>2. INTELLIGENCE</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:'white', background:'var(--elevated)', padding:'1px 7px', borderRadius:3 }}>
          {result.call_count} {result.call_count === 1 ? 'CALL' : 'CALLS'}
        </span>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>

        {/* Executive summary */}
        <Section title="Executive Summary">
          <p style={{ fontSize:16, color:'var(--text)', lineHeight:1.7, fontFamily:'var(--sans)' }}>
            {result.executive_summary}
          </p>
        </Section>

        {/* Narrative */}
        <Section title="Call Narrative">
          <p style={{ fontSize:15, color:'var(--sec)', lineHeight:1.7, fontFamily:'var(--sans)' }}>
            {result.call_narrative}
          </p>
        </Section>

        {/* Parent intent */}
        <Section title="Parent Intent">
          <div style={{ background:'var(--elevated)', border:'1px solid var(--blue-b)', borderRadius:6, padding:'9px 12px' }}>
            <p style={{ fontSize:15, color:'var(--text)', fontFamily:'var(--sans)', lineHeight:1.6 }}>{result.parent_intent}</p>
          </div>
        </Section>

        {/* Key points */}
        <Section title="Key Emphasis Points">
          {result.emphasis_points.map((pt, i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
              <span style={{ color:'var(--green)', fontSize:14, flexShrink:0, marginTop:1 }}>◆</span>
              <p style={{ fontSize:15, color:'var(--text)', fontFamily:'var(--sans)', lineHeight:1.55 }}>{pt}</p>
            </div>
          ))}
        </Section>

        {/* Charts row */}
        <Section title="Analytics">
          {/* Sentiment over time */}
          {result.sentiment_timeline.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:'white', marginBottom:8, letterSpacing:'.06em' }}>PARENT ANXIETY OVER CALL</div>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={result.sentiment_timeline} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                  <defs>
                    <linearGradient id="anxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e2534a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e2534a" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize:12, fill:'var(--mute)' }} />
                  <YAxis domain={[0,100]} tick={{ fontSize:12, fill:'var(--mute)' }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="var(--red)" fill="url(#anxGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Keyword frequency */}
          {result.keyword_frequency.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, color:'white', marginBottom:8, letterSpacing:'.06em' }}>KEYWORD FREQUENCY</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={result.keyword_frequency} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                  <XAxis dataKey="label" tick={{ fontSize:12, fill:'var(--mute)' }} />
                  <YAxis tick={{ fontSize:12, fill:'var(--mute)' }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="value" fill="var(--blue)" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Talk ratio pie */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, color:'white', marginBottom:8, letterSpacing:'.06em' }}>TALK RATIO</div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <PieChart width={90} height={120}>
                <Pie data={talkData} dataKey="value" cx={40} cy={40} innerRadius={22} outerRadius={38} strokeWidth={0}>
                  {talkData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
              </PieChart>
              <div>
                {talkData.map(d => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:d.fill }} />
                    <span style={{ fontSize:14, color:'var(--sec)' }}>{d.name}</span>
                    <span style={{ fontSize:15, fontWeight:500, color:'var(--text)' }}>{d.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Feedback */}
        <Section title="Agent Feedback">
          {result.feedback.map((fb, i) => <FeedbackCard key={i} fb={fb} />)}
        </Section>

        {/* Action plan */}
        <Section title="Action Plan">
          {result.action_plan.map((step, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:15, color:'var(--green)', fontWeight:600, flexShrink:0, minWidth:16 }}>{i+1}.</span>
              <p style={{ fontSize:15, color:'var(--text)', fontFamily:'var(--sans)', lineHeight:1.55 }}>{step}</p>
            </div>
          ))}
        </Section>

        {/* Common App angle */}
        {result.common_app_angle && (
          <Section title="Common App Angle">
            <div style={{ background:'var(--elevated)', border:'1px solid var(--green-b)', borderRadius:6, padding:'9px 12px' }}>
              <p style={{ fontSize:15, color:'var(--green)', fontFamily:'var(--sans)', lineHeight:1.6, fontStyle:'italic' }}>
                "{result.common_app_angle}"
              </p>
            </div>
          </Section>
        )}

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