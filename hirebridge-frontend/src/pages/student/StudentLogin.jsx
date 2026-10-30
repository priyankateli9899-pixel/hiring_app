import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard.jsx';
import FormInput from '../../components/FormInput.jsx';
import AlertBanner from '../../components/AlertBanner.jsx';
import { login } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ACCENT   = '#2563eb';
const GRADIENT = 'linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #60a5fa 100%)';

export default function StudentLogin() {
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
    if (!form.email.trim())  e.email    = 'Email is required';
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

      // Guard: ensure the authenticated account is actually a STUDENT
      if (data.role !== 'STUDENT') {
        setAlert({ type: 'error', msg: 'This account is not a student account. Please use the correct portal.' });
        setLoading(false);
        return;
      }

      saveAuth(
        { userId: data.userId, fullName: data.fullName, email: data.email, role: data.role },
        data.token
      );

      // Redirect based on profile completion (extend later when profileCompleted is added)
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid email or password. Please try again.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      gradient={GRADIENT}
      accent={ACCENT}
      logo={<StudentLogo />}
      title="Welcome Back, Student"
      subtitle="Log in to access your personalised placement dashboard and AI-powered job matches."
    >
      <h2 style={styles.heading}>Student Login</h2>
      <p style={styles.sub}>Enter your credentials to continue</p>

      <AlertBanner type={alert.type} message={alert.msg} />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput label="Email"    type="email"    value={form.email}    onChange={set('email')}    error={errors.email}    placeholder="you@email.com"   required accent={ACCENT} autoComplete="email" />
        <FormInput label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Your password"    required accent={ACCENT} autoComplete="current-password" />

        <button type="submit" disabled={loading} style={{ ...styles.btn, background: loading ? '#93c5fd' : ACCENT }}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p style={styles.switchText}>
        New to HireBridge AI?{' '}
        <Link to="/student/register" style={{ color: ACCENT, fontWeight: 600 }}>
          Register as Student
        </Link>
      </p>

      <p style={styles.backLink}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to home</Link>
      </p>
    </AuthCard>
  );
}

function StudentLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>HireBridge AI</span>
    </div>
  );
}

const styles = {
  heading:    { fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem', letterSpacing: '-0.02em' },
  sub:        { fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1.75rem' },
  btn:        { width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '0.25rem', transition: 'opacity .15s' },
  switchText: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9375rem', color: '#6b7280' },
  backLink:   { textAlign: 'center', marginTop: '0.75rem' },
};
