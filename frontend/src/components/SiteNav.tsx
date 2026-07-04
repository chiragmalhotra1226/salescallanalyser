import { useStore, ACCENTS } from '../store/appStore'

/**
 * Sticky top navigation shared by the landing / pricing / checkout / upload
 * pages. Holds the logo, page links, the 5-colour accent picker and the
 * dark / light theme toggle. Wraps onto two rows on narrow screens.
 */
export default function SiteNav() {
  const { page, setPage, theme, setTheme, accent, setAccent } = useStore()

  const link = (label: string, target: 'landing' | 'pricing') => (
    <button
      onClick={() => setPage(target)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em',
        color: page === target ? 'var(--accent)' : 'var(--sec)',
        padding: '6px 4px', transition: 'color .25s',
      }}
    >
      {label}
    </button>
  )

  return (
    <nav className="site-nav">
      {/* Logo */}
      <button
        onClick={() => setPage('landing')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
          color: 'var(--accent-ink)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15,
        }}>C</span>
        <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
          Call Analyser
        </span>
      </button>

      {/* Links + controls */}
      <div className="nav-controls">
        {link('HOME', 'landing')}
        {link('PRICING', 'pricing')}

        {/* Accent colour picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 20, border: '1px solid var(--b-sub)' }}>
          {ACCENTS.map(a => (
            <button
              key={a.id}
              title={a.label}
              aria-label={`Accent colour ${a.label}`}
              className={`swatch ${accent === a.id ? 'active' : ''}`}
              onClick={() => setAccent(a.id)}
              style={{ background: a.color }}
            />
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark / light theme"
          style={{
            width: 52, height: 28, borderRadius: 16, position: 'relative', flexShrink: 0,
            border: '1px solid var(--b-mid)', background: 'var(--elevated)',
            cursor: 'pointer', transition: 'background .3s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3,
            left: theme === 'dark' ? 3 : 25,
            width: 20, height: 20, borderRadius: '50%',
            display: 'grid', placeItems: 'center', fontSize: 11,
            background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
            transition: 'left .3s cubic-bezier(.4,0,.2,1)',
          }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
        </button>
      </div>
    </nav>
  )
}
