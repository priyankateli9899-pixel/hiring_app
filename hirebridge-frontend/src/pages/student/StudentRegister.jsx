import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './student.css';

export default function StudentRegister() {
  const navigate     = useNavigate();
  const { saveAuth } = useAuth();

  const [form, setForm]     = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  function validate() {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required';
    if (!form.email.trim())     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)         e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirm)          e.confirm  = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr('');
    try {
      const { data } = await register({ fullName: form.fullName, email: form.email, password: form.password, role: 'STUDENT' });
      saveAuth({ userId: data.userId, fullName: data.fullName, email: data.email, role: data.role }, data.token);
      navigate('/student/profile-setup', { replace: true });
    } catch (err) {
      setApiErr(err.response?.data?.message || err.response?.data?.details?.email || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="s-auth-page">
      {/* Left panel */}
      <div className="s-auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>HireBridge AI</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-.02em' }}>
            Start Your<br />Career Journey
          </h1>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join thousands of students across India finding their dream jobs with AI-powered placement assistance.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {['Find Jobs Matching Your Skills', 'AI-Powered Resume Analyzer', 'Track Applications Easily', 'Get Hired Faster'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '.9rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="s-auth-right">
        <div className="s-auth-form-box">
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', marginBottom: '.25rem', letterSpacing: '-.02em' }}>Create Student Account</h2>
          <p style={{ fontSize: '.9375rem', color: '#6b7280', marginBottom: '1.75rem' }}>Fill in your details to get started</p>

          {apiErr && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.875rem', color: '#b91c1c', display: 'flex', gap: '.5rem' }}>
              <span style={{ fontWeight: 700 }}>✕</span> {apiErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input value={form.fullName} onChange={set('fullName')} placeholder="Enter your full name"
                style={{ ...inp, borderColor: errors.fullName ? '#ef4444' : '#e2e8f0' }} />
              {errors.fullName && <p style={err}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com"
                style={{ ...inp, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} />
              {errors.email && <p style={err}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Create a password (min 8 chars)"
                  style={{ ...inp, borderColor: errors.password ? '#ef4444' : '#e2e8f0', paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <p style={err}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={lbl}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showCfm ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                  placeholder="Re-enter your password"
                  style={{ ...inp, borderColor: errors.confirm ? '#ef4444' : '#e2e8f0', paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowCfm(v => !v)} style={eyeBtn}>{showCfm ? '🙈' : '👁️'}</button>
              </div>
              {errors.confirm && <p style={err}>{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '.75rem', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s' }}>
              {loading ? 'Creating Account…' : 'Register'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.9375rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/student/login" style={{ color: '#2563eb', fontWeight: 700 }}>Login</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '.625rem' }}>
            <Link to="/" style={{ color: '#9ca3af', fontSize: '.8125rem' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const lbl   = { display: 'block', fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' };
const inp   = { width: '100%', padding: '.65rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.9375rem', outline: 'none', color: '#111827', fontFamily: 'inherit', transition: 'border-color .15s' };
const err   = { fontSize: '.75rem', color: '#ef4444', marginTop: '.25rem' };
const eyeBtn = { position: 'absolute', right: '.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 };
