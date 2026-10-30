import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard.jsx';
import FormInput from '../../components/FormInput.jsx';
import AlertBanner from '../../components/AlertBanner.jsx';
import { login } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ACCENT   = '#059669';
const GRADIENT = 'linear-gradient(135deg, #064e3b 0%, #10b981 60%, #34d399 100%)';

export default function CompanyLogin() {
  const navigate     = useNavigate();
  const { saveAuth } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert]   = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  function validate() {
    const e = {};
    if (!form.email.trim())  e.email    = 'Official email is required';
    if (!form.password)      e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert({ type: '', msg: '' });

    try {
      const { data } = await login({ email: form.email, password: form.password });

      if (data.role !== 'RECRUITER') {
        setAlert({ type: 'error', msg: 'This account is not a company account. Please use the correct portal.' });
        setLoading(false);
        return;
      }

      saveAuth(
        { userId: data.userId, fullName: data.fullName, email: data.email, role: data.role },
        data.token
      );

      navigate('/company/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      gradient={GRADIENT}
      accent={ACCENT}
      logo={<CompanyLogo />}
      title="Welcome Back, Recruiter"
      subtitle="Access your hiring dashboard, review AI-matched candidates and manage job postings."
    >
      <h2 style={styles.heading}>Company Login</h2>
      <p style={styles.sub}>Sign in with your official company email</p>

      <AlertBanner type={alert.type} message={alert.msg} />

      {/* Verification reminder banner */}
      <div style={styles.infoBanner}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#047857" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Unverified companies can log in but cannot publish jobs until verified.</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput label="Official Email" type="email"    value={form.email}    onChange={set('email')}    error={errors.email}    placeholder="hr@yourcompany.com" required accent={ACCENT} autoComplete="email" />
        <FormInput label="Password"       type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Your password"       required accent={ACCENT} autoComplete="current-password" />

        <button type="submit" disabled={loading} style={{ ...styles.btn, background: loading ? '#6ee7b7' : ACCENT }}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p style={styles.switchText}>
        New company?{' '}
        <Link to="/company/register" style={{ color: ACCENT, fontWeight: 600 }}>Register here</Link>
      </p>

      <p style={styles.backLink}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to home</Link>
      </p>
    </AuthCard>
  );
}

function CompanyLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>HireBridge AI</span>
    </div>
  );
}

const styles = {
  heading:    { fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem', letterSpacing: '-0.02em' },
  sub:        { fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1.25rem' },
  infoBanner: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.625rem 0.875rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#065f46', lineHeight: 1.5 },
  btn:        { width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '0.25rem', transition: 'opacity .15s' },
  switchText: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9375rem', color: '#6b7280' },
  backLink:   { textAlign: 'center', marginTop: '0.75rem' },
};
