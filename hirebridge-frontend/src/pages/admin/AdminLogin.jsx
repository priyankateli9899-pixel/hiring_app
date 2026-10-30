import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './admin.css';

export default function AdminLogin() {
  const navigate     = useNavigate();
  const { saveAuth } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: '' }));
  };

  function validate() {
    const e = {};
    if (!form.email.trim())  e.email    = 'Admin email is required';
    if (!form.password)      e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr('');
    try {
      const { data } = await login({ email: form.email, password: form.password });
      // Frontend role check — backed by server-side ROLE_ADMIN enforcement on all /api/admin/** routes
      if (data.role !== 'ADMIN') {
        setApiErr('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }
      saveAuth({ userId: data.userId, fullName: data.fullName, email: data.email, role: data.role }, data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="a-auth-page">
      {/* Left panel */}
      <div className="a-auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem' }}>HireBridge AI</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-.02em' }}>
            Administration<br />Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Secure access for platform administrators. All sessions are encrypted, logged and monitored.
          </p>

          {/* Features */}
          {['Manage Users & Companies', 'Verify Recruitment Partners', 'Monitor Activities', 'View Analytics & Reports'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.625rem' }}>
              <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '.875rem' }}>{t}</span>
            </div>
          ))}

          {/* Security badge */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '.5rem', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, padding: '.625rem 1rem', fontSize: '.8125rem', color: 'rgba(255,255,255,.85)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            End-to-end encrypted · JWT secured
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="a-auth-right">
        <div className="a-auth-box">
          <h2 style={S.heading}>Admin Login</h2>
          <p style={S.sub}>Restricted access — authorised personnel only</p>

          {/* Security notice */}
          <div style={S.secBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span>This portal is for administrators only. Unauthorised access attempts are logged.</span>
          </div>

          {apiErr && (
            <div style={S.errBanner}>
              <span style={{ fontWeight: 700 }}>✕</span> {apiErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={S.lbl}>Admin Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="admin@hirebridge.ai"
                style={{ ...S.inp, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
                autoComplete="email" />
              {errors.email && <p style={S.err}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '.5rem' }}>
              <label style={S.lbl}>Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Enter admin password"
                  style={{ ...S.inp, borderColor: errors.password ? '#ef4444' : '#e2e8f0', paddingRight: '2.75rem' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={S.eye}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <p style={S.err}>{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <button type="button" onClick={() => setShowForgot(v => !v)}
                style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>

            {showForgot && (
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#5b21b6', lineHeight: 1.6 }}>
                <strong>Password Reset:</strong> Admin passwords are managed by the system administrator.
                Contact <a href="mailto:sysadmin@hirebridge.ai" style={{ color: '#7c3aed', fontWeight: 600 }}>sysadmin@hirebridge.ai</a> to reset your admin credentials.
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '.75rem', background: loading ? '#c4b5fd' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s' }}>
              {loading ? 'Authenticating…' : 'Login'}
            </button>
          </form>

          <p style={S.note}>
            Admin accounts are provisioned by the system administrator.<br />
            Contact your system admin if you need access.
          </p>

          <p style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Link to="/" style={{ color: '#9ca3af', fontSize: '.8125rem' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  heading:   { fontSize: '1.625rem', fontWeight: 800, color: '#111827', marginBottom: '.25rem', letterSpacing: '-.02em' },
  sub:       { fontSize: '.9375rem', color: '#6b7280', marginBottom: '1.25rem' },
  secBadge:  { display: 'flex', alignItems: 'flex-start', gap: '.5rem', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '.625rem .875rem', marginBottom: '1.25rem', fontSize: '.8rem', color: '#5b21b6', lineHeight: 1.5 },
  errBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#b91c1c', display: 'flex', gap: '.5rem' },
  lbl:       { display: 'block', fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' },
  inp:       { width: '100%', padding: '.65rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.9375rem', outline: 'none', color: '#111827', fontFamily: 'inherit', transition: 'border-color .15s' },
  err:       { fontSize: '.75rem', color: '#ef4444', marginTop: '.25rem' },
  eye:       { position: 'absolute', right: '.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 },
  note:      { textAlign: 'center', marginTop: '1.25rem', fontSize: '.8125rem', color: '#9ca3af', lineHeight: 1.6 },
};
