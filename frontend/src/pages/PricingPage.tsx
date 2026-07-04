import { useStore } from '../store/appStore'
import { useReveal } from '../hooks/useReveal'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    tagline: 'For solo counsellors getting started',
    popular: false,
    features: [
      '30 call analyses / month',
      'ApexVoice AI transcription',
      'Speaker detection & timestamps',
      'Call vitals dashboard',
      'Executive summaries',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/month',
    tagline: 'For growing admissions teams',
    popular: true,
    features: [
      '150 call analyses / month',
      'Everything in Starter',
      'Objection & buying-signal detection',
      'Coaching feedback per rep',
      'Sentiment timeline (early access)',
      'AI follow-up emails (early access)',
      'Priority support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$199',
    period: '/month',
    tagline: 'For sales orgs that run on calls',
    popular: false,
    features: [
      'Unlimited call analyses',
      'Everything in Pro',
      'CRM sync (HubSpot / Salesforce)',
      'Team leaderboards & reporting',
      'Multilingual transcription',
      'Deal-risk prediction (early access)',
      'Dedicated success manager',
    ],
  },
]

export default function PricingPage() {
  const { setPage, setPlan } = useStore()
  const ref = useReveal<HTMLDivElement>()

  const buy = (t: typeof TIERS[number]) => {
    setPlan({ id: t.id, name: t.name, price: `${t.price}${t.period}` })
    setPage('checkout')
  }

  return (
    <div ref={ref} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <SiteNav />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px 90px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 54, animation: 'fade-up .6s ease both' }}>
          <div style={{
            display: 'inline-block', fontSize: 10, letterSpacing: '.16em', color: 'var(--accent)',
            border: '1px solid var(--accent-b)', background: 'var(--accent-d)',
            padding: '5px 14px', borderRadius: 16, marginBottom: 20,
          }}>
            SIMPLE PRICING · CANCEL ANYTIME
          </div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, marginBottom: 14 }}>
            Pick your <span className="hero-gradient">plan</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sec)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Every plan includes the full analysis engine. Choose based on how many
            calls your team runs — upgrade or downgrade whenever you like.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, alignItems: 'stretch' }}>
          {TIERS.map((t, i) => (
            <div
              key={t.id}
              className="price-card reveal"
              style={{
                padding: '34px 28px',
                display: 'flex', flexDirection: 'column',
                transitionDelay: `${i * .12}s`,
                ...(t.popular ? { border: '1px solid var(--accent-b)', boxShadow: '0 20px 55px -22px var(--accent-b)' } : {}),
              }}
            >
              {t.popular && (
                <div style={{
                  alignSelf: 'center', marginTop: -48, marginBottom: 20,
                  fontSize: 9, letterSpacing: '.14em', fontWeight: 600,
                  background: 'linear-gradient(100deg, var(--accent), var(--accent-2))',
                  color: 'var(--accent-ink)', padding: '6px 16px', borderRadius: 14,
                }}>
                  ★ MOST POPULAR
                </div>
              )}

              <div style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--sec)', marginBottom: 22 }}>{t.tagline}</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 26 }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 44, fontWeight: 700, color: 'var(--accent)' }}>{t.price}</span>
                <span style={{ fontSize: 12, color: 'var(--mute)' }}>{t.period}</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30, flex: 1 }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 12, lineHeight: 1.6, color: 'var(--sec)' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                className={t.popular ? 'btn-accent' : 'btn-ghost'}
                style={{ fontSize: 13, padding: '13px 0', width: '100%' }}
                onClick={() => buy(t)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 46, fontSize: 11, color: 'var(--mute)', lineHeight: 1.9 }}>
          Need a custom volume, on-premise deployment or an annual contract?{' '}
          <button
            onClick={() => { setPlan({ id: 'custom', name: 'Custom / Enterprise', price: 'Custom' }); setPage('checkout') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}
          >
            Talk to our team →
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
