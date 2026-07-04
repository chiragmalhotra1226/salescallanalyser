import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useStore } from '../store/appStore'
import { useReveal } from '../hooks/useReveal'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const TITLE = 'Call Analyser'

const CURRENT_FEATURES = [
  { icon: '📤', title: 'Batch Call Upload',          desc: 'Analyse up to 30 sales call recordings in one go — drop a sheet of call links or audio files and let the engine run.' },
  { icon: '🎙️', title: 'ApexVoice AI Transcription', desc: 'Every call is transcribed with timestamps and automatic speaker detection, so you always know who said what, and when.' },
  { icon: '🧠', title: 'AI Call Intelligence',        desc: 'NLP-powered analysis turns raw conversations into executive summaries, call narratives and customer-intent readouts.' },
  { icon: '📊', title: 'Call Vitals Dashboard',       desc: 'Interest level, sentiment, urgency, price sensitivity, talk ratio, WPM, objection counts — every call scored 0–100 at a glance.' },
  { icon: '🚩', title: 'Objection & Signal Detection', desc: 'Automatically surfaces objections, buying signals and emphasis points so your team knows exactly what to address next.' },
  { icon: '📜', title: 'Transcript Explorer',         desc: 'A full three-panel HUD to read every transcript side-by-side with its metrics, keywords and coaching feedback.' },
  { icon: '💗', title: 'Sentiment Timeline',          desc: 'Watch customer sentiment shift across every phase of the call — opening, discovery, pricing, closing — and see exactly where the mood turned.' },
  { icon: '⚖️', title: 'Talk-Ratio Coaching',         desc: 'Agent vs customer talk time, words-per-minute pacing and question counts on every call — instant nudges when reps talk too much and listen too little.' },
  { icon: '🎯', title: 'Salesperson Feedback',        desc: 'Every call generates call-by-call strengths, mistakes and better-phrasing suggestions for the rep — coaching notes that write themselves.' },
]

const UPCOMING_FEATURES = [
  { icon: '✉️', title: 'AI Follow-Up Emails',    desc: 'One click turns a finished call into a ready-to-send, personalised follow-up email for the prospect.' },
  { icon: '🔗', title: 'CRM Sync',               desc: 'Push scores, summaries and next steps straight into HubSpot or Salesforce — no copy-paste.' },
  { icon: '🏆', title: 'Team Leaderboards',      desc: 'Rank reps by conversion score, objection handling and coaching progress across the whole team.' },
  { icon: '🌐', title: 'Multilingual Calls',     desc: 'Transcribe and analyse calls in Hindi, Spanish, Arabic and 40+ more languages.' },
  { icon: '⚡', title: 'Live Call Copilot',      desc: 'Real-time hints during the call itself — objection responses and talking points as the conversation happens.' },
  { icon: '🔮', title: 'Deal-Risk Prediction',   desc: 'A model trained on your call history flags at-risk deals days before they go cold.' },
  { icon: '📋', title: 'Custom Scorecards',      desc: 'Define your own scoring criteria — pitch adherence, compliance phrases, discovery depth — and grade every call against them.' },
  { icon: '📬', title: 'Weekly Digest Reports',  desc: 'A Monday-morning email that summarises the week: top calls, biggest risks, team trends and coaching priorities.' },
  { icon: '🔎', title: 'Smart Call Search',      desc: 'Search every call you have ever analysed by meaning, not keywords — "calls where price was the blocker" just works.' },
]

const STEPS = [
  { n: '01', title: 'Upload your calls',   desc: 'Drop a spreadsheet of recording links or upload audio files directly — up to 30 calls per batch.' },
  { n: '02', title: 'AI does the work',    desc: 'ApexVoice AI transcribes and labels every speaker, then our intelligence layer scores and dissects each conversation.' },
  { n: '03', title: 'Act on the insights', desc: 'Get vitals, summaries, objections and a concrete action plan — everything a sales leader needs to coach and close.' },
]

const TICKER = [
  'SENTIMENT TIMELINE', 'TALK RATIO', 'OBJECTION DETECTION', 'CALL VITALS',
  'AGENT FEEDBACK', 'TRANSCRIPTS', 'KEYWORD FREQUENCY', 'CONVERSION SCORE',
  'CUSTOMER INTENT', 'ACTION PLANS',
]

const INDUSTRIES = ['EDTECH', 'SAAS', 'REAL ESTATE', 'INSURANCE', 'RECRUITING', 'D2C', 'FINANCE']

const STATS = [
  { to: 30,  suffix: '',    label: 'calls per batch' },
  { to: 15,  suffix: '+',   label: 'metrics per call' },
  { to: 2,   suffix: ' min', label: 'avg analysis time' },
  { to: 100, suffix: '%',   label: 'of calls reviewed' },
]

const orb = (size: number, color: string, top: string, left: string, dur: number, delay = 0): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', filter: 'blur(70px)', opacity: .5, background: color,
  animation: `orb-drift ${dur}s ease-in-out ${delay}s infinite`,
  pointerEvents: 'none',
})

/* count-up number that starts when it scrolls into view */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const dur = 1400
      const tick = (t: number) => {
        const p = Math.min((t - start) / dur, 1)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: .4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

/* CSS-only mock of the analysis dashboard, used as the product preview */
function DashboardMock() {
  const bar = (label: string, pct: number, color: string, delay: number) => (
    <div key={label} style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, letterSpacing: '.08em', color: 'var(--sec)', marginBottom: 4 }}>
        <span>{label}</span><span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--b-sub)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, animation: `bar-grow 1.2s cubic-bezier(.2,.7,.3,1) ${delay}s both` }} />
      </div>
    </div>
  )
  const chartBars = [82, 58, 44, 40, 38, 62, 35, 30, 28, 24]
  const lines = [
    ['1', 'Hello, this is Christina from BetterMind Labs.'],
    ['2', "Yes, we received the request for Nandini."],
    ['1', 'Nandini opted for the AI + Healthcare track?'],
    ['2', 'The AI + Healthcare track fits her interests.'],
    ['2', 'We can flexibly schedule around July 6th.'],
  ]
  return (
    <div style={{
      borderRadius: 16, border: '1px solid var(--b-mid)', background: 'var(--elevated)',
      boxShadow: 'var(--card-shadow)', overflow: 'hidden', textAlign: 'left',
      animation: 'float-y 6s ease-in-out infinite',
    }}>
      {/* window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--b-sub)', background: 'var(--surface)' }}>
        {['var(--red)', 'var(--amber)', 'var(--green)'].map(c => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: .8 }} />
        ))}
        <span style={{ marginLeft: 10, fontSize: 9, letterSpacing: '.12em', color: 'var(--sec)' }}>SALES CALL ANALYSER · 1 CALL ANALYSED</span>
        <span style={{ marginLeft: 'auto', fontSize: 8, padding: '2px 8px', borderRadius: 3, color: 'var(--accent)', background: 'var(--accent-d)', border: '1px solid var(--accent-b)' }}>Consideration</span>
      </div>

      <div className="mock-grid">
        {/* Vitals */}
        <div className="mock-col">
          <div style={{ fontSize: 8.5, letterSpacing: '.12em', color: 'var(--mute)', marginBottom: 12 }}>1. VITALS</div>
          {bar('INTEREST LEVEL', 90, 'var(--green)', .2)}
          {bar('CUSTOMER ANXIETY', 34, 'var(--red)', .35)}
          {bar('TECH CURIOSITY', 85, 'var(--blue)', .5)}
          {bar('URGENCY', 70, 'var(--amber)', .65)}
          {bar('PRICE SENSITIVITY', 30, 'var(--purple)', .8)}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['9.0', 'CONVERSION'], ['8.0', 'TECH INTENT']].map(([v, l]) => (
              <div key={l} style={{ flex: 1, border: '1px solid var(--b-sub)', borderRadius: 6, padding: '8px 9px' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>{v}</div>
                <div style={{ fontSize: 7, letterSpacing: '.1em', color: 'var(--mute)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence / chart */}
        <div className="mock-col">
          <div style={{ fontSize: 8.5, letterSpacing: '.12em', color: 'var(--mute)', marginBottom: 12 }}>2. INTELLIGENCE</div>
          <div style={{ fontSize: 8.5, color: 'var(--sec)', marginBottom: 8 }}>KEYWORD FREQUENCY</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 74, marginBottom: 16 }}>
            {chartBars.map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0',
                background: i === 0 ? 'var(--accent)' : 'var(--accent-d)',
                border: '1px solid var(--accent-b)',
                animation: `rise 1s cubic-bezier(.2,.7,.3,1) ${.3 + i * .07}s both`,
              }} />
            ))}
          </div>
          <div style={{ border: '1px solid var(--green-b)', background: 'var(--green-d)', borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: 'var(--green)', letterSpacing: '.08em', marginBottom: 3 }}>✓ STRENGTH</div>
            <div style={{ fontSize: 8.5, lineHeight: 1.6, color: 'var(--sec)' }}>Agent guided the customer to live product demos, making the value tangible.</div>
          </div>
          <div style={{ border: '1px solid var(--red-b)', background: 'var(--red-d)', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 8, color: 'var(--red)', letterSpacing: '.08em', marginBottom: 3 }}>✕ MISTAKE</div>
            <div style={{ fontSize: 8.5, lineHeight: 1.6, color: 'var(--sec)' }}>Framing the error as 'rejected' put the customer on the defensive early.</div>
          </div>
        </div>

        {/* Transcript */}
        <div className="mock-col">
          <div style={{ fontSize: 8.5, letterSpacing: '.12em', color: 'var(--mute)', marginBottom: 12 }}>3. TRANSCRIPT ENGINE</div>
          {lines.map(([sp, txt], i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 9, animation: `fade-up .5s ease ${.4 + i * .15}s both` }}>
              <span style={{ fontSize: 8.5, flexShrink: 0, color: sp === '1' ? 'var(--blue)' : 'var(--accent)' }}>Speaker {sp}</span>
              <span style={{ fontSize: 8.5, lineHeight: 1.6, color: 'var(--sec)' }}>{txt}</span>
            </div>
          ))}
          <div style={{ fontSize: 8, color: 'var(--mute)', marginTop: 10 }}>
            <span style={{ animation: 'pulse-dot 1.4s infinite' }}>●</span> Call 1 active
          </div>
        </div>
      </div>
    </div>
  )
}

/* Deep-dive analytics visuals: sentiment line, talk-ratio donut, pacing tiles */
function AnalyticsShowcase() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
      {/* Sentiment timeline line chart */}
      <div className="feature-card reveal" style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--sec)', marginBottom: 16 }}>CUSTOMER SENTIMENT OVER CALL</div>
        <svg viewBox="0 0 240 100" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="var(--b-sub)" strokeWidth="1" />
          ))}
          <polyline
            fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
            points="0,28 40,36 80,46 120,50 160,60 200,70 240,80"
            strokeDasharray="600"
            style={{ animation: 'draw-line 2.4s ease both' }}
          />
          {[[0,28],[80,46],[160,60],[240,80]].map(([x,y]) => (
            <circle key={x} cx={x} cy={y} r="3.5" fill="var(--accent)" />
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'var(--mute)', marginTop: 10, letterSpacing: '.06em' }}>
          <span>OPENING</span><span>DISCOVERY</span><span>PRICING</span><span>CLOSING</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--sec)', lineHeight: 1.7, marginTop: 14 }}>
          Anxiety dropping steadily from open to close — exactly what a great call looks like.
        </div>
      </div>

      {/* Talk ratio donut */}
      <div className="feature-card reveal" style={{ textAlign: 'center', transitionDelay: '.12s' }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--sec)', marginBottom: 18, textAlign: 'left' }}>TALK RATIO</div>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '6px auto 18px',
          background: 'conic-gradient(var(--accent) 0 51%, var(--blue) 51% 100%)',
          display: 'grid', placeItems: 'center',
          animation: 'success-pop .8s cubic-bezier(.2,.9,.3,1.2) both',
        }}>
          <div style={{
            width: 74, height: 74, borderRadius: '50%', background: 'var(--surface)',
            display: 'grid', placeItems: 'center', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700,
          }}>
            51<span style={{ fontSize: 10, color: 'var(--mute)' }}>/49</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, fontSize: 10.5 }}>
          <span style={{ color: 'var(--sec)' }}><span style={{ color: 'var(--accent)' }}>■</span> Agent 51%</span>
          <span style={{ color: 'var(--sec)' }}><span style={{ color: 'var(--blue)' }}>■</span> Customer 49%</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--sec)', lineHeight: 1.7, marginTop: 14 }}>
          Balanced conversations close more — we measure it on every call.
        </div>
      </div>

      {/* Pacing tiles */}
      <div className="feature-card reveal" style={{ textAlign: 'left', transitionDelay: '.24s' }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--sec)', marginBottom: 18 }}>PACING & DELIVERY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['150', 'WPM'], ['25', 'QUESTIONS'], ['1', 'OBJECTIONS'], ['9.0', 'CONVERSION']].map(([v, l], i) => (
            <div key={l} style={{
              border: '1px solid var(--b-sub)', borderRadius: 10, padding: '14px 14px',
              background: 'var(--elevated)', animation: `fade-up .5s ease ${.2 + i * .12}s both`,
            }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{v}</div>
              <div style={{ fontSize: 8.5, letterSpacing: '.12em', color: 'var(--mute)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sec)', lineHeight: 1.7, marginTop: 16 }}>
          Speed, questions asked and objections faced — benchmarked against your best reps.
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { setPage } = useStore()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
      <SiteNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="hero-header" style={{ position: 'relative', padding: '100px 24px 70px', textAlign: 'center', overflow: 'hidden' }}>
        <div className="hero-grid" />
        {/* floating orbs */}
        <div style={orb(340, 'var(--accent)',   '-8%',  '6%',  16)} />
        <div style={orb(280, 'var(--accent-2)', '30%',  '72%', 20, 2)} />
        <div style={orb(220, 'var(--accent)',   '62%',  '18%', 24, 4)} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '.18em', color: 'var(--accent)',
            border: '1px solid var(--accent-b)', background: 'var(--accent-d)',
            padding: '6px 16px', borderRadius: 20, marginBottom: 28,
            animation: 'fade-up .6s ease both',
          }}>
            AI SALES CALL INTELLIGENCE · BETTERMIND LABS
          </div>

          {/* title: zooms in oversized, settles, then a reflection sweeps across.
              The gradient is applied per-letter — applying background-clip:text to
              a parent of animated children renders invisible text on iOS Safari. */}
          <h1 aria-label={TITLE} style={{
            fontFamily: 'var(--sans)', fontWeight: 700,
            fontSize: 'clamp(40px, 8vw, 92px)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: 26,
          }}>
            <span className="hero-title-wrap" style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              {TITLE.split('').map((ch, i) => (
                <span key={i} className="hero-letter hero-gradient" style={{ animationDelay: `${.25 + i * .06}s, 0s` }}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
              <span className="hero-shine" aria-hidden="true">{TITLE}</span>
            </span>
          </h1>

          <p style={{
            maxWidth: 640, margin: '0 auto 18px', fontSize: 15, lineHeight: 1.8,
            color: 'var(--sec)', animation: 'fade-up .7s ease .9s both',
          }}>
            Stop guessing why deals stall. Call Analyser listens to every sales call,
            transcribes it, scores it, and tells your team exactly what to do next —
            objections, buying signals, coaching feedback and action plans, all in minutes.
          </p>
          <p style={{
            maxWidth: 560, margin: '0 auto 26px', fontSize: 12, lineHeight: 1.8,
            color: 'var(--mute)', animation: 'fade-up .7s ease 1.05s both',
          }}>
            Built for every team that sells on calls — if your revenue happens on the
            phone, Call Analyser turns those conversations into coaching and pipeline.
          </p>

          {/* industries */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36, animation: 'fade-up .7s ease 1.15s both' }}>
            {INDUSTRIES.map(ind => <span key={ind} className="industry-chip">{ind}</span>)}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fade-up .7s ease 1.25s both' }}>
            <button className="btn-accent" style={{ fontSize: 13, padding: '14px 34px' }} onClick={() => setPage('upload')}>
              Get Started →
            </button>
            <button className="btn-ghost" style={{ fontSize: 13, padding: '14px 30px' }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>
        </div>
      </header>

      {/* ── KEYWORD TICKER ───────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--b-sub)', borderBottom: '1px solid var(--b-sub)', padding: '13px 0', overflow: 'hidden' }}>
        <div className="marquee-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--mute)', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--accent)', marginRight: 12 }}>✦</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="section-pad" style={{ padding: '54px 24px 10px', maxWidth: 900, margin: '0 auto' }}>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 18, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 700, color: 'var(--accent)' }}>
                <CountUp to={s.to} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--sec)', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ──────────────────────────────────── */}
      <section className="section-pad" style={{ padding: '60px 24px 30px', maxWidth: 980, margin: '0 auto', textAlign: 'center' }}>
        <div className="reveal" style={{ marginBottom: 34 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>
            See it <span className="hero-gradient" style={{ animation: 'none' }}>in action</span>
          </h2>
          <p style={{ fontSize: 12, color: 'var(--sec)', letterSpacing: '.06em' }}>THE THREE-PANEL ANALYSIS HUD YOUR TEAM LIVES IN</p>
        </div>
        <div className="reveal">
          <DashboardMock />
        </div>
      </section>

      {/* ── ANALYTICS SHOWCASE ───────────────────────────────── */}
      <section className="section-pad" style={{ padding: '50px 24px 30px', maxWidth: 1060, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 34 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>
            Analytics that <span className="hero-gradient" style={{ animation: 'none' }}>coach</span>
          </h2>
          <p style={{ fontSize: 12, color: 'var(--sec)', letterSpacing: '.06em' }}>EVERY CALL BECOMES A CHART YOUR TEAM CAN LEARN FROM</p>
        </div>
        <AnalyticsShowcase />
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="section-pad" style={{ padding: '60px 24px 70px', maxWidth: 1060, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>
            From raw recordings to <span className="hero-gradient" style={{ animation: 'none' }}>revenue insight</span>
          </h2>
          <p style={{ fontSize: 12, color: 'var(--sec)', letterSpacing: '.06em' }}>THREE STEPS. NO MANUAL NOTE-TAKING. EVER.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className="feature-card reveal" style={{ transitionDelay: `${i * .12}s` }}>
              <div style={{
                fontFamily: 'var(--sans)', fontSize: 34, fontWeight: 700,
                color: 'var(--accent)', opacity: .9, marginBottom: 14,
              }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--sec)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURRENT FEATURES ─────────────────────────────────── */}
      <section id="features" className="section-pad" style={{ padding: '60px 24px', background: 'var(--surface)', borderTop: '1px solid var(--b-sub)', borderBottom: '1px solid var(--b-sub)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>Everything it does today</h2>
            <p style={{ fontSize: 12, color: 'var(--sec)', letterSpacing: '.06em' }}>LIVE IN THE PRODUCT RIGHT NOW</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {CURRENT_FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card reveal" style={{ background: 'var(--elevated)', transitionDelay: `${(i % 3) * .1}s` }}>
                <div style={{ fontSize: 26, marginBottom: 14, animation: `float-y ${3 + (i % 3)}s ease-in-out infinite` }}>{f.icon}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--sec)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING FEATURES ────────────────────────────────── */}
      <section id="roadmap" className="section-pad" style={{ padding: '60px 24px', maxWidth: 1060, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>On the roadmap</h2>
          <p style={{ fontSize: 12, color: 'var(--sec)', letterSpacing: '.06em' }}>SHIPPING TO PRO & PREMIUM PLANS FIRST</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {UPCOMING_FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card reveal" style={{ position: 'relative', transitionDelay: `${(i % 4) * .08}s` }}>
              <span style={{
                position: 'absolute', top: 14, right: 14, fontSize: 8, letterSpacing: '.12em',
                color: 'var(--accent)', border: '1px solid var(--accent-b)', background: 'var(--accent-d)',
                padding: '3px 8px', borderRadius: 10,
              }}>COMING SOON</span>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, marginBottom: 9 }}>{f.title}</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.75, color: 'var(--sec)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="section-pad" style={{ padding: '30px 24px 70px' }}>
        <div className="reveal" style={{
          maxWidth: 860, margin: '0 auto', textAlign: 'center',
          borderRadius: 22, padding: '54px 30px',
          border: '1px solid var(--accent-b)',
          background: 'linear-gradient(140deg, var(--accent-d), transparent 60%), var(--surface)',
          position: 'relative', overflow: 'hidden',
        }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 700, marginBottom: 14 }}>
            Ready to hear what your calls are telling you?
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--sec)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 30px' }}>
            Pick a plan, tell us where to reach you, and our team will get you set up.
          </p>
          <button className="btn-accent" style={{ fontSize: 13, padding: '14px 38px' }} onClick={() => setPage('pricing')}>
            See Pricing →
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
