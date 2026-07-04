import { useStore } from '../store/appStore'

/** Full site footer with contact details, shared by the marketing pages. */
export default function SiteFooter() {
  const { setPage } = useStore()

  const col = (title: string, items: React.ReactNode) => (
    <div style={{ minWidth: 150 }}>
      <div style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--mute)', marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{items}</div>
    </div>
  )

  return (
    <footer style={{ borderTop: '1px solid var(--b-sub)', background: 'var(--surface)', marginTop: 20 }}>
      <div style={{
        maxWidth: 1060, margin: '0 auto', padding: '54px 24px 40px',
        display: 'flex', flexWrap: 'wrap', gap: 44, justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center',
              background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
              color: 'var(--accent-ink)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16,
            }}>C</span>
            <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 17 }}>Call Analyser</span>
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.8, color: 'var(--sec)' }}>
            AI-powered sales call intelligence for edtech teams. Transcribe, score
            and coach every call — automatically.
          </p>
          <p style={{ fontSize: 10.5, color: 'var(--mute)', marginTop: 12 }}>
            Powered by ApexVoice AI & Gemini intelligence
          </p>
        </div>

        {col('PRODUCT', <>
          <button className="footer-link" onClick={() => { setPage('landing'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 80) }}>Features</button>
          <button className="footer-link" onClick={() => { setPage('landing'); setTimeout(() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' }), 80) }}>Roadmap</button>
          <button className="footer-link" onClick={() => setPage('pricing')}>Pricing</button>
          <button className="footer-link" onClick={() => setPage('upload')}>Get Started</button>
        </>)}

        {col('COMPANY', <>
          <span className="footer-link" style={{ cursor: 'default' }}>BetterMind Labs</span>
          <a className="footer-link" href="https://bettermindlabs.com" target="_blank" rel="noreferrer">About Us</a>
          <a className="footer-link" href="#" onClick={e => e.preventDefault()}>Careers</a>
          <a className="footer-link" href="#" onClick={e => e.preventDefault()}>Blog</a>
        </>)}

        {col('CONTACT', <>
          <a className="footer-link" href="mailto:instructor.bettermindlabs@gmail.com">
            ✉ instructor.bettermindlabs@gmail.com
          </a>
          <span className="footer-link" style={{ cursor: 'default' }}>🕘 Mon–Sat · 9 AM – 7 PM IST</span>
          <span className="footer-link" style={{ cursor: 'default' }}>💬 Replies within one business day</span>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {['𝕏', 'in', '▶'].map(s => (
              <a key={s} href="#" onClick={e => e.preventDefault()} aria-label="social link" style={{
                width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center',
                border: '1px solid var(--b-mid)', color: 'var(--sec)', fontSize: 11,
                textDecoration: 'none', transition: 'all .2s',
              }}>{s}</a>
            ))}
          </div>
        </>)}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--b-sub)',
        padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: 10,
        justifyContent: 'space-between', maxWidth: 1060, margin: '0 auto',
      }}>
        <span style={{ fontSize: 10.5, color: 'var(--mute)' }}>
          © {new Date().getFullYear()} BetterMind Labs · All rights reserved
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--mute)' }}>
          Terms of Service · Privacy Policy
        </span>
      </div>
    </footer>
  )
}
