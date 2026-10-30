import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { user, logout } = useAuth();

  return (
    <div style={s.page}>
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <div style={s.logoMark}>H</div>
          <span style={s.brandName}>HireBridge <span style={{ color: '#2563eb' }}>AI</span></span>
        </div>
        <div style={s.navLinks}>
          {user ? (
            <>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {user.fullName} ({user.role})
              </span>
              <button onClick={logout} style={s.navBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/student/login"  style={s.navLink}>Student Login</Link>
              <Link to="/company/login"  style={s.navLink}>Company Login</Link>
              <Link to="/admin/login"    style={{ ...s.navLink, color: '#7c3aed' }}>Admin</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.badge}>🇮🇳 Pan-India Intelligent Placement Platform</div>
          <h1 style={s.heroTitle}>
            Bridge the Gap Between<br />
            <span style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Talent &amp; Opportunity
            </span>
          </h1>
          <p style={s.heroSub}>
            HireBridge AI connects students with top recruiters across India using intelligent matching,
            verified company profiles, and AI-powered placement assistance.
          </p>
          <div style={s.heroBtns}>
            <Link to="/student/register" style={{ ...s.ctaBtn, background: '#2563eb' }}>
              I'm a Student →
            </Link>
            <Link to="/company/register" style={{ ...s.ctaBtn, background: '#059669' }}>
              I'm a Company →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three portals ─────────────────────────────────────────────── */}
      <section style={s.portals}>
        <h2 style={s.sectionTitle}>Choose Your Portal</h2>
        <p style={s.sectionSub}>Three dedicated experiences, one powerful platform</p>

        <div style={s.portalGrid}>
          {/* Student */}
          <PortalCard
            gradient="linear-gradient(135deg,#1e40af,#3b82f6)"
            icon={<GradCapIcon />}
            title="Student Portal"
            desc="Find jobs, get AI resume feedback, track applications and receive placement guidance."
            registerTo="/student/register"
            loginTo="/student/login"
            registerLabel="Register as Student"
            loginLabel="Student Login"
            accentBorder="#bfdbfe"
            accentBg="#eff6ff"
            accentText="#1d4ed8"
          />

          {/* Company */}
          <PortalCard
            gradient="linear-gradient(135deg,#064e3b,#10b981)"
            icon={<BuildingIcon />}
            title="Company Portal"
            desc="Post jobs, browse AI-ranked candidates, manage applications and build your talent pipeline."
            registerTo="/company/register"
            loginTo="/company/login"
            registerLabel="Register Company"
            loginLabel="Company Login"
            accentBorder="#a7f3d0"
            accentBg="#ecfdf5"
            accentText="#065f46"
          />

          {/* Admin */}
          <PortalCard
            gradient="linear-gradient(135deg,#4c1d95,#7c3aed)"
            icon={<ShieldIcon />}
            title="Admin Portal"
            desc="Manage platform users, verify companies, monitor activity and configure system settings."
            loginTo="/admin/login"
            loginLabel="Admin Login"
            adminOnly
            accentBorder="#ddd6fe"
            accentBg="#f5f3ff"
            accentText="#5b21b6"
          />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section style={s.stats}>
        {[
          { n: '50,000+', l: 'Students Placed' },
          { n: '3,000+',  l: 'Partner Companies' },
          { n: '500+',    l: 'Colleges' },
          { n: '28',      l: 'States Covered' },
        ].map(({ n, l }) => (
          <div key={l} style={s.statCard}>
            <div style={s.statNum}>{n}</div>
            <div style={s.statLbl}>{l}</div>
          </div>
        ))}
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <p>© 2026 HireBridge AI · Pan-India Intelligent Placement Platform</p>
      </footer>
    </div>
  );
}

function PortalCard({ gradient, icon, title, desc, registerTo, loginTo, registerLabel, loginLabel, adminOnly, accentBorder, accentBg, accentText }) {
  return (
    <div style={{ ...s.card, borderColor: accentBorder }}>
      <div style={{ ...s.cardIcon, background: gradient }}>{icon}</div>
      <h3 style={s.cardTitle}>{title}</h3>
      <p style={s.cardDesc}>{desc}</p>
      <div style={s.cardBtns}>
        {!adminOnly && (
          <Link to={registerTo} style={{ ...s.cardBtnPrimary, background: gradient }}>
            {registerLabel}
          </Link>
        )}
        <Link to={loginTo} style={{ ...s.cardBtnSecondary, borderColor: accentBorder, color: accentText, background: accentBg }}>
          {loginLabel}
        </Link>
      </div>
    </div>
  );
}

function GradCapIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

const s = {
  page:       { minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', background: '#f9fafb' },
  nav:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 },
  navBrand:   { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  logoMark:   { width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' },
  brandName:  { fontWeight: 800, fontSize: '1.125rem', color: '#111827' },
  navLinks:   { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink:    { fontSize: '0.9rem', fontWeight: 500, color: '#374151', transition: 'color .15s' },
  navBtn:     { padding: '0.375rem 0.875rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' },
  hero:       { background: 'linear-gradient(180deg,#fff 0%,#f0f9ff 100%)', padding: '5rem 2rem 4rem', textAlign: 'center' },
  heroInner:  { maxWidth: 720, margin: '0 auto' },
  badge:      { display: 'inline-block', padding: '0.375rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '1.5rem' },
  heroTitle:  { fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: 900, color: '#111827', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em' },
  heroSub:    { fontSize: '1.125rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 580, margin: '0 auto 2.5rem' },
  heroBtns:   { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn:     { padding: '0.875rem 2rem', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', transition: 'opacity .15s', display: 'inline-block' },
  portals:    { padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '-0.02em' },
  sectionSub: { textAlign: 'center', color: '#6b7280', marginBottom: '3rem', fontSize: '1.0625rem' },
  portalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: '1.5rem' },
  card:       { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.06)', transition: 'transform .2s,box-shadow .2s' },
  cardIcon:   { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' },
  cardTitle:  { fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '0.625rem' },
  cardDesc:   { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.5rem' },
  cardBtns:   { display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  cardBtnPrimary:   { padding: '0.625rem 1rem', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', display: 'block' },
  cardBtnSecondary: { padding: '0.625rem 1rem', border: '1.5px solid', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', display: 'block' },
  stats:      { background: '#111827', padding: '3.5rem 2rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' },
  statCard:   { textAlign: 'center' },
  statNum:    { fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' },
  statLbl:    { fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.25rem' },
  footer:     { background: '#111827', borderTop: '1px solid #374151', padding: '1.25rem 2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' },
};
