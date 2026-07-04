import type { CSSProperties } from 'react'
import { useStore } from '../store/appStore'
import { useReveal } from '../hooks/useReveal'
import SiteNav from '../components/SiteNav'

const TITLE = 'Call Analyser'

const CURRENT_FEATURES = [
  { icon: '📤', title: 'Batch Call Upload',        desc: 'Analyse up to 30 sales call recordings in one go — drop a sheet of call links or audio files and let the engine run.' },
  { icon: '🎙️', title: 'ApexVoice AI Transcription', desc: 'Every call is transcribed with timestamps and automatic speaker detection, so you always know who said what, and when.' },
  { icon: '🧠', title: 'AI Call Intelligence',      desc: 'Gemini-powered analysis turns raw conversations into executive summaries, call narratives and parent-intent readouts.' },
  { icon: '📊', title: 'Call Vitals Dashboard',     desc: 'Interest level, anxiety, urgency, price sensitivity, talk ratio, WPM, objection counts — every call scored 0–100 at a glance.' },
  { icon: '🚩', title: 'Objection & Signal Detection', desc: 'Automatically surfaces objections, buying signals and emphasis points so your team knows exactly what to address next.' },
  { icon: '📜', title: 'Transcript Explorer',       desc: 'A full three-panel HUD to read every transcript side-by-side with its metrics, keywords and coaching feedback.' },
]

const UPCOMING_FEATURES = [
  { icon: '💗', title: 'Sentiment Timeline',        desc: 'Watch emotion shift minute-by-minute inside each call and pinpoint the exact moment a deal turned.' },
  { icon: '⚖️', title: 'Talk-Ratio Coaching',       desc: 'Personalised nudges when reps talk too much and listen too little, benchmarked against your best closers.' },
  { icon: '✉️', title: 'AI Follow-Up Emails',       desc: 'One click turns a finished call into a ready-to-send, personalised follow-up email for the parent.' },
  { icon: '🔗', title: 'CRM Sync',                  desc: 'Push scores, summaries and next steps straight into HubSpot or Salesforce — no copy-paste.' },
  { icon: '🏆', title: 'Team Leaderboards',         desc: 'Rank reps by conversion score, objection handling and coaching progress across the whole team.' },
  { icon: '🌐', title: 'Multilingual Calls',        desc: 'Transcribe and analyse calls in Hindi, Spanish, Arabic and 40+ more languages.' },
  { icon: '⚡', title: 'Live Call Copilot',         desc: 'Real-time hints during the call itself — objection responses and talking points as the conversation happens.' },
  { icon: '🔮', title: 'Deal-Risk Prediction',      desc: 'A model trained on your call history flags at-risk deals days before they go cold.' },
]

const STEPS = [
  { n: '01', title: 'Upload your calls',   desc: 'Drop a spreadsheet of recording links or upload audio files directly — up to 30 calls per batch.' },
  { n: '02', title: 'AI does the work',    desc: 'ApexVoice AI transcribes and labels every speaker, then our intelligence layer scores and dissects each conversation.' },
  { n: '03', title: 'Act on the insights', desc: 'Get vitals, summaries, objections and a concrete action plan — everything a sales leader needs to coach and close.' },
]

const orb = (size: number, color: string, top: string, left: string, dur: number, delay = 0): CSSProperties => ({
  position: 'absolute', width: size, height: size, top, left,
  borderRadius: '50%', filter: 'blur(70px)', opacity: .5, background: color,
  animation: `orb-drift ${dur}s ease-in-out ${delay}s infinite`,
  pointerEvents: 'none',
})

export default function LandingPage() {
  const { setPage } = useStore()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
      <SiteNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header style={{ position: 'relative', padding: '110px 24px 90px', textAlign: 'center', overflow: 'hidden' }}>
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
            EDTECH SALES INTELLIGENCE · BY BETTERMIND LABS
          </div>

          {/* letter-by-letter animated title */}
          <h1 aria-label={TITLE} style={{
            fontFamily: 'var(--sans)', fontWeight: 700,
            fontSize: 'clamp(44px, 8vw, 92px)', lineHeight: 1.05,
            letterSpacing: '-.02em', marginBottom: 26,
          }}>
            <span className="hero-gradient">
              {TITLE.split('').map((ch, i) => (
                <span key={i} className="hero-letter" style={{ animationDelay: `${.25 + i * .06}s` }}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
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
            maxWidth: 560, margin: '0 auto 40px', fontSize: 12, lineHeight: 1.8,
            color: 'var(--mute)', animation: 'fade-up .7s ease 1.05s both',
          }}>
            Built for edtech admissions and counselling teams who run hundreds of parent
            calls a week and can't afford to lose a single insight.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fade-up .7s ease 1.2s both' }}>
            <button className="btn-accent" style={{ fontSize: 13, padding: '14px 34px' }} onClick={() => setPage('pricing')}>
              Get Started →
            </button>
            <button className="btn-ghost" style={{ fontSize: 13, padding: '14px 30px' }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>
        </div>
      </header>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '40px 24px 70px', maxWidth: 1060, margin: '0 auto' }}>
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
      <section id="features" style={{ padding: '60px 24px', background: 'var(--surface)', borderTop: '1px solid var(--b-sub)', borderBottom: '1px solid var(--b-sub)' }}>
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
      <section style={{ padding: '60px 24px', maxWidth: 1060, margin: '0 auto' }}>
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
      <section style={{ padding: '30px 24px 90px' }}>
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

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--b-sub)', padding: '26px 28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--mute)' }}>© {new Date().getFullYear()} BetterMind Labs · Call Analyser</span>
        <span style={{ fontSize: 11, color: 'var(--mute)' }}>Powered by ApexVoice AI & Gemini intelligence</span>
      </footer>
    </div>
  )
}
