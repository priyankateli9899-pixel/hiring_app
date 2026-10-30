import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './company.css';

export default function CompanyRegister() {
  const navigate     = useNavigate();
  const { saveAuth } = useAuth();

  const [form, setForm]   = useState({ companyName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.email.trim())       e.email       = 'Official email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)           e.password    = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirm)            e.confirm     = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr('');
    try {
      const { data } = await register({
        fullName: form.companyName,
        email:    form.email,
        password: form.password,
        role:     'RECRUITER',
      });
      saveAuth({ userId: data.userId, fullName: data.fullName, email: data.email, role: data.role }, data.token);
      navigate('/company/profile-setup', { replace: true });
    } catch (err) {
      setApiErr(err.response?.data?.message || err.response?.data?.details?.email || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="c-auth-page">
      {/* Left panel */}
      <div className="c-auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Brand />
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-.02em' }}>
            Hire India's<br />Best Talent
          </h1>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Post jobs, screen candidates with AI, and build your dream team — all from one platform.
          </p>
          {['Post Jobs in Minutes', 'AI-Matched Candidates', 'Manage Applications Easily', 'Grow Your Team Faster'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.625rem' }}>
              <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '.9rem' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="c-auth-right">
        <div className="c-auth-box">
          <h2 style={S.heading}>Create Company Account</h2>
          <p style={S.sub}>Register your company to start hiring</p>

          {apiErr && <ErrBanner msg={apiErr} />}

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Company Name *" error={errors.companyName}>
              <input value={form.companyName} onChange={set('companyName')} placeholder="e.g. Acme Corp Pvt Ltd" style={{ ...S.inp, borderColor: errors.companyName ? '#ef4444' : '#e2e8f0' }} />
            </Field>
            <Field label="Official Company Email *" error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="hr@yourcompany.com" style={{ ...S.inp, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} />
            </Field>
            <Field label="Password *" error={errors.password}>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Create a password (min 8 chars)" style={{ ...S.inp, borderColor: errors.password ? '#ef4444' : '#e2e8f0', paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={S.eye}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </Field>
            <Field label="Confirm Password *" error={errors.confirm} last>
              <div style={{ position: 'relative' }}>
                <input type={showCfm ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Re-enter your password" style={{ ...S.inp, borderColor: errors.confirm ? '#ef4444' : '#e2e8f0', paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowCfm(v => !v)} style={S.eye}>{showCfm ? '🙈' : '👁️'}</button>
              </div>
            </Field>

            <button type="submit" disabled={loading} style={{ ...S.btn, background: loading ? '#6ee7b7' : '#059669' }}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <p style={S.switchText}>
            Already registered?{' '}
            <Link to="/company/login" style={{ color: '#059669', fontWeight: 700 }}>Login</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '.625rem' }}>
            <Link to="/" style={{ color: '#9ca3af', fontSize: '.8125rem' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '2.5rem' }}>
      <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
      </div>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>HireBridge AI</span>
    </div>
  );
}

function Field({ label, error, children, last }) {
  return (
    <div style={{ marginBottom: last ? '1.5rem' : '1rem' }}>
      <label style={S.lbl}>{label}</label>
      {children}
      {error && <p style={S.err}>{error}</p>}
    </div>
  );
}

function ErrBanner({ msg }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#b91c1c', display: 'flex', gap: '.5rem' }}>
      <span style={{ fontWeight: 700 }}>✕</span> {msg}
    </div>
  );
}

const S = {
  heading:    { fontSize: '1.625rem', fontWeight: 800, color: '#111827', marginBottom: '.25rem', letterSpacing: '-.02em' },
  sub:        { fontSize: '.9375rem', color: '#6b7280', marginBottom: '1.75rem' },
  lbl:        { display: 'block', fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' },
  inp:        { width: '100%', padding: '.65rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.9375rem', outline: 'none', color: '#111827', fontFamily: 'inherit', transition: 'border-color .15s' },
  err:        { fontSize: '.75rem', color: '#ef4444', marginTop: '.25rem' },
  eye:        { position: 'absolute', right: '.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 },
  btn:        { width: '100%', padding: '.75rem', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background .15s' },
  switchText: { textAlign: 'center', marginTop: '1.25rem', fontSize: '.9375rem', color: '#6b7280' },
};
