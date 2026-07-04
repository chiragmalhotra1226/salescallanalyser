import { useState } from 'react'
import { useStore } from '../store/appStore'
import SiteNav from '../components/SiteNav'

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada',
  'Australia', 'Singapore', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy',
  'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Pakistan', 'Bangladesh',
  'Sri Lanka', 'Nepal', 'Indonesia', 'Malaysia', 'Philippines', 'Thailand',
  'Vietnam', 'Japan', 'South Korea', 'China', 'Hong Kong', 'New Zealand',
  'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Brazil', 'Mexico', 'Other',
]

interface FormState {
  name: string
  email: string
  phone: string
  country: string
}

export default function CheckoutPage() {
  const { selectedPlan, setPage } = useStore()
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', country: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const errs: Partial<FormState> = {}
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address'
    if (!/^[+]?[\d\s\-()]{7,16}$/.test(form.phone.trim())) errs.phone = 'Please enter a valid phone number'
    if (!form.country) errs.country = 'Please select your country'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
  }

  const field = (label: string, key: keyof FormState, input: React.ReactNode) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '.1em', color: 'var(--sec)', marginBottom: 8 }}>
        {label}
      </label>
      {input}
      {errors[key] && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 6 }}>{errors[key]}</div>}
    </div>
  )

  // ── success state ────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <SiteNav />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '110px 24px', textAlign: 'center' }}>
          <div style={{
            width: 92, height: 92, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
            animation: 'success-pop .6s cubic-bezier(.2,.9,.3,1.4) both', marginBottom: 34,
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M10 23 L19 32 L34 13" stroke="var(--accent-ink)" strokeWidth="4.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="48" strokeDashoffset="48"
                style={{ animation: 'draw-check .5s ease .45s forwards' }} />
            </svg>
          </div>

          <h1 style={{ fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 700, marginBottom: 16, animation: 'fade-up .6s ease .3s both' }}>
            You're all set, {form.name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sec)', lineHeight: 1.9, maxWidth: 480, marginBottom: 10, animation: 'fade-up .6s ease .45s both' }}>
            Thanks for choosing the <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selectedPlan?.name ?? 'Pro'}</span> plan.
            <br />
            <strong style={{ color: 'var(--text)' }}>Someone from our team will contact you shortly</strong>{' '}
            at {form.email} to activate your account.
          </p>
          <p style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 40, animation: 'fade-up .6s ease .55s both' }}>
            Usually within one business day.
          </p>
          <button className="btn-accent" style={{ fontSize: 12, padding: '12px 32px', animation: 'fade-up .6s ease .65s both' }}
            onClick={() => setPage('landing')}>
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  // ── form state ───────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <SiteNav />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 24px 90px', animation: 'fade-up .5s ease both' }}>
        <button onClick={() => setPage('pricing')} style={{
          background: 'none', border: 'none', color: 'var(--sec)', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 26, padding: 0,
        }}>
          ← Back to pricing
        </button>

        <h1 style={{ fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 700, marginBottom: 10 }}>
          Almost there
        </h1>
        <p style={{ fontSize: 12, color: 'var(--sec)', lineHeight: 1.8, marginBottom: 28 }}>
          Tell us where to reach you and our team will set up your account.
        </p>

        {/* Selected plan summary */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--accent-b)', background: 'var(--accent-d)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 30,
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--sec)', marginBottom: 4 }}>SELECTED PLAN</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
              {selectedPlan?.name ?? 'Pro'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700 }}>
            {selectedPlan?.price ?? '$79/month'}
          </div>
        </div>

        <form onSubmit={submit} noValidate>
          {field('FULL NAME', 'name',
            <input className="form-input" type="text" placeholder="e.g. John Doe"
              value={form.name} onChange={set('name')} />
          )}
          {field('EMAIL ADDRESS', 'email',
            <input className="form-input" type="email" placeholder="you@company.com"
              value={form.email} onChange={set('email')} />
          )}
          {field('PHONE NUMBER', 'phone',
            <input className="form-input" type="tel" placeholder="+1 (129) 555-1234"
              value={form.phone} onChange={set('phone')} />
          )}
          {field('COUNTRY', 'country',
            <select className="form-input" value={form.country} onChange={set('country')}
              style={{ appearance: 'none', cursor: 'pointer', color: form.country ? 'var(--text)' : 'var(--mute)' }}>
              <option value="" disabled>Select your country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <button type="submit" className="btn-accent" style={{ width: '100%', fontSize: 13, padding: '14px 0', marginTop: 10 }}>
            Submit →
          </button>

          <p style={{ fontSize: 10, color: 'var(--mute)', textAlign: 'center', marginTop: 18, lineHeight: 1.8 }}>
            No payment is taken now. Our team will contact you to complete the setup.
          </p>
        </form>
      </div>
    </div>
  )
}
