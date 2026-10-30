/**
 * AuthCard – full-page centred layout used by every auth page.
 *
 * Props:
 *   gradient  – CSS gradient string for the left panel
 *   accent    – hex colour for highlights
 *   logo      – JSX icon shown on left panel
 *   title     – left panel headline
 *   subtitle  – left panel sub-text
 *   children  – the form content on the right panel
 */
export default function AuthCard({ gradient, accent, logo, title, subtitle, children }) {
  return (
    <div style={{ ...styles.page }}>
      {/* Left decorative panel */}
      <div style={{ ...styles.left, background: gradient }}>
        <div style={styles.leftInner}>
          <div style={styles.logoWrap}>{logo}</div>
          <h1 style={styles.leftTitle}>{title}</h1>
          <p style={styles.leftSub}>{subtitle}</p>
          <div style={styles.dots}>
            {[0,1,2].map(i => (
              <span key={i} style={{ ...styles.dot, opacity: i === 0 ? 1 : 0.4 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={styles.right}>
        <div style={styles.rightInner}>
          {/* HireBridge brand on mobile */}
          <div style={styles.mobileBrand}>
            <span style={{ color: accent, fontWeight: 800, fontSize: '1.25rem' }}>
              HireBridge AI
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  left: {
    flex: '0 0 42%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    maxWidth: 340,
    color: '#fff',
    zIndex: 1,
  },
  logoWrap: {
    marginBottom: '2rem',
  },
  leftTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '1rem',
    letterSpacing: '-0.02em',
  },
  leftSub: {
    fontSize: '1.0625rem',
    opacity: 0.85,
    lineHeight: 1.6,
    marginBottom: '2.5rem',
  },
  dots: {
    display: 'flex',
    gap: '0.5rem',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#fff',
    display: 'inline-block',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    background: '#fff',
    overflowY: 'auto',
  },
  rightInner: {
    width: '100%',
    maxWidth: 420,
  },
  mobileBrand: {
    display: 'none',
    marginBottom: '1.5rem',
  },
};

/* Responsive tweak via a style tag injected once */
const css = `
  @media (max-width: 768px) {
    /* hide left panel on mobile */
    [data-left] { display: none !important; }
    [data-mobile-brand] { display: block !important; }
  }
`;
if (!document.getElementById('auth-card-css')) {
  const s = document.createElement('style');
  s.id = 'auth-card-css';
  s.textContent = css;
  document.head.appendChild(s);
}
