import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCompanyProfile, createCompanyProfile, updateCompanyProfile } from '../../api/authApi.js';
import './company.css';

/* ── Success toast ─────────────────────────────────────────────────── */
function SuccessToast({ message }) {
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#f0fdf4', border: '1.5px solid #86efac',
      borderRadius: 12, padding: '1rem 2rem',
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      display: 'flex', alignItems: 'center', gap: '.75rem',
      fontSize: '.9375rem', fontWeight: 600, color: '#15803d',
      zIndex: 9999, fontFamily: 'Inter,system-ui,sans-serif',
      animation: 'fadeInDown .3s ease',
    }}>
      <span style={{ fontSize: '1.25rem' }}>✅</span>
      {message}
    </div>
  );
}

const STEPS    = ['Company Details', 'Company Information', 'Review & Submit'];
const INDUSTRIES = ['Information Technology','Software & SaaS','E-Commerce','FinTech','EdTech','HealthTech','Manufacturing','Consulting','Banking & Finance','Telecommunications','Media & Entertainment','Retail','Logistics','Other'];
const SIZES    = ['1–10','11–50','51–200','201–500','501–1000','1001–5000','5000+'];
const CITIES   = ['Bangalore','Mumbai','Hyderabad','Pune','Chennai','Delhi NCR','Kolkata','Ahmedabad','Noida','Gurugram','Other'];

export default function CompanyProfileSetup() {
  const navigate             = useNavigate();
  const { user, saveAuth }   = useAuth();
  const errorRef             = useRef(null);

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [apiErr, setApiErr]           = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // ── Load existing profile on mount ────────────────────────────────
  useEffect(() => {
    getCompanyProfile()
      .then(res => {
        if (res.status === 200 && res.data) {
          const p = res.data;
          setExistingProfile(p);
          setBasic(prev => ({
            ...prev,
            companyName: p.companyName  || '',
            industry:    p.industry     || '',
            size:        p.companySize  || '',
            website:     p.website      || '',
            hqLocation:  p.hqLocation   || '',
          }));
          setInfo({
            contactPerson: p.contactPerson    || '',
            designation:   p.designation      || '',
            contactPhone:  p.contactPhone      || '',
            description:   p.description      || '',
            about:         p.about            || '',
            recruitEmail:  p.recruitmentEmail || '',
            linkedin:      p.linkedinUrl      || '',
          });
        }
      })
      .catch(() => { /* 204 or network error – stay empty */ });
  }, []); // eslint-disable-line

  // Step 1
  const [basic, setBasic] = useState({
    companyName: user?.fullName || '', industry: '', size: '',
    website: '', hqLocation: '', logoFile: null,
  });
  const [basicErr, setBasicErr] = useState({});

  // Step 2
  const [info, setInfo] = useState({
    contactPerson: '', designation: '', contactPhone: '',
    description: '', about: '', recruitEmail: '', linkedin: '',
  });
  const [infoErr, setInfoErr] = useState({});

  const setB = (f) => (e) => { setBasic(p => ({ ...p, [f]: e.target.value })); setBasicErr(p => ({ ...p, [f]: '' })); };
  const setI = (f) => (e) => { setInfo(p => ({ ...p, [f]: e.target.value })); setInfoErr(p => ({ ...p, [f]: '' })); };

  function validateStep1() {
    const e = {};
    if (!basic.companyName.trim()) e.companyName = 'Required';
    if (!basic.industry)           e.industry    = 'Required';
    if (!basic.size)               e.size        = 'Required';
    if (!basic.hqLocation.trim())  e.hqLocation  = 'Required';
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!info.contactPerson.trim()) e.contactPerson = 'Required';
    if (!info.designation.trim())   e.designation   = 'Required';
    if (!info.description.trim())   e.description   = 'Required';
    if (info.recruitEmail && !/\S+@\S+\.\S+/.test(info.recruitEmail)) e.recruitEmail = 'Enter a valid email';
    return e;
  }

  function next() {
    if (step === 0) { const e = validateStep1(); setBasicErr(e); if (Object.keys(e).length) return; }
    if (step === 1) { const e = validateStep2(); setInfoErr(e); if (Object.keys(e).length) return; }
    setStep(s => s + 1); window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    setLoading(true);
    setApiErr('');

    const payload = {
      companyName:      basic.companyName,
      industry:         basic.industry,
      companySize:      basic.size,
      website:          basic.website    || null,
      hqLocation:       basic.hqLocation,
      logoFileName:     basic.logoFile?.name || null,
      contactPerson:    info.contactPerson,
      designation:      info.designation,
      contactPhone:     info.contactPhone    || null,
      description:      info.description,
      about:            info.about           || null,
      recruitmentEmail: info.recruitEmail    || null,
      linkedinUrl:      info.linkedin        || null,
    };

    try {
      const apiFn = existingProfile ? updateCompanyProfile : createCompanyProfile;
      await apiFn(payload);

      const updatedUser = { ...user, profileCompleted: true };
      saveAuth(updatedUser, localStorage.getItem('hb_token'));

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/company/dashboard', { replace: true });
      }, 1800);

    } catch (err) {
      const details = err.response?.data?.details;
      const detailMsg = details ? Object.values(details)[0] : null;
      const msg =
        detailMsg ||
        err.response?.data?.message ||
        `Error ${err.response?.status ?? ''}: Failed to save company profile. Please try again.`;
      setApiErr(msg);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setLoading(false);
    }
  }

  const StepDot = ({ idx }) => {
    const state = idx < step ? 'done' : idx === step ? 'active' : '';
    return (
      <div className={`cp-step ${state}`}>
        <div className="cp-dot">
          {idx < step
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            : idx + 1}
        </div>
        <div className="cp-step-label">{STEPS[idx]}</div>
      </div>
    );
  };

  return (
    <div className="cp-page">
      {showSuccess && <SuccessToast message="Company profile saved successfully! Redirecting…" />}

      <header className="cp-header">
        <div className="cp-brand">HireBridge <span>AI</span></div>
        <span style={{ fontSize: '.875rem', color: '#6b7280' }}>Welcome, <strong>{user?.fullName?.split(' ')[0]}</strong></span>
      </header>

      <div className="cp-body">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111827', marginBottom: '.25rem' }}>Complete Company Profile</h1>
          <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Step {step + 1} of 3 — {STEPS[step]}</p>
        </div>

        <div className="cp-progress">
          {STEPS.map((_, i) => <StepDot key={i} idx={i} />)}
        </div>

        <div className="cp-card">
          {/* Error banner */}
          {apiErr && (
            <div ref={errorRef} style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '.875rem 1rem',
              marginBottom: '1.25rem', fontSize: '.875rem',
              color: '#b91c1c', display: 'flex', gap: '.5rem',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>✕</span>
              <span>{apiErr}</span>
            </div>
          )}

          {step === 0 && <Step1 basic={basic} setB={setB} basicErr={basicErr} setBasic={setBasic} setBasicErr={setBasicErr} />}
          {step === 1 && <Step2 info={info} setI={setI} infoErr={infoErr} />}
          {step === 2 && <Step3 basic={basic} info={info} onEdit={setStep} />}

          <div className="cp-nav">
            {step > 0
              ? <button className="cp-prev" onClick={() => { setStep(s => s - 1); setApiErr(''); }}>← Previous</button>
              : <span />}
            {step < 2
              ? <button className="cp-next" onClick={next}>Continue →</button>
              : <button
                  className="cp-next"
                  onClick={handleSubmit}
                  disabled={loading || showSuccess}
                  style={{ opacity: loading || showSuccess ? 0.7 : 1 }}
                >
                  {loading ? 'Saving…' : showSuccess ? '✓ Saved!' : '✓ Submit Profile'}
                </button>}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

function Step1({ basic, setB, basicErr, setBasic, setBasicErr }) {
  return (
    <>
      <div className="cp-card-title">Step 1 – Basic Company Details</div>
      <div className="cp-card-sub">Tell us about your company</div>

      <div className="cp-grid" style={{ marginBottom: '1rem' }}>
        <F label="Company Name *" error={basicErr.companyName}>
          <input value={basic.companyName} onChange={setB('companyName')} placeholder="Your company name" />
        </F>
        <F label="Industry Type *" error={basicErr.industry}>
          <select value={basic.industry} onChange={setB('industry')}>
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </F>
      </div>
      <div className="cp-grid" style={{ marginBottom: '1rem' }}>
        <F label="Company Size *" error={basicErr.size}>
          <select value={basic.size} onChange={setB('size')}>
            <option value="">Select size</option>
            {SIZES.map(s => <option key={s}>{s} employees</option>)}
          </select>
        </F>
        <F label="Company Website">
          <input value={basic.website} onChange={setB('website')} placeholder="https://yourcompany.com" />
        </F>
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <F label="Headquarters Location *" error={basicErr.hqLocation}>
          <input value={basic.hqLocation} onChange={setB('hqLocation')} placeholder="e.g. Bangalore, Karnataka" />
        </F>
      </div>

      <div style={{ marginBottom: '.5rem' }}>
        <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' }}>
          Company Logo (Optional)
        </label>
        <label className="cp-upload-box">
          <input type="file" accept="image/*" onChange={e => setBasic(p => ({ ...p, logoFile: e.target.files[0] }))} />
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🏢</div>
          {basic.logoFile
            ? <div style={{ fontWeight: 600, color: '#059669', fontSize: '.9rem' }}>{basic.logoFile.name}</div>
            : <div style={{ fontSize: '.9rem', color: '#374151', fontWeight: 500 }}>Click to upload logo<br /><span style={{ fontSize: '.8rem', color: '#9ca3af' }}>JPG, PNG · Max 2 MB</span></div>}
        </label>
      </div>
    </>
  );
}

function Step2({ info, setI, infoErr }) {
  return (
    <>
      <div className="cp-card-title">Step 2 – Company Information</div>
      <div className="cp-card-sub">Provide contact and recruitment details</div>

      <div className="cp-grid" style={{ marginBottom: '1rem' }}>
        <F label="Contact Person Name *" error={infoErr.contactPerson}>
          <input value={info.contactPerson} onChange={setI('contactPerson')} placeholder="HR Manager / Founder" />
        </F>
        <F label="Designation *" error={infoErr.designation}>
          <input value={info.designation} onChange={setI('designation')} placeholder="e.g. HR Manager" />
        </F>
      </div>
      <div className="cp-grid" style={{ marginBottom: '1rem' }}>
        <F label="Official Contact Number">
          <input type="tel" value={info.contactPhone} onChange={setI('contactPhone')} placeholder="+91 98765 43210" />
        </F>
        <F label="Recruitment Contact Email" error={infoErr.recruitEmail}>
          <input type="email" value={info.recruitEmail} onChange={setI('recruitEmail')} placeholder="campus@company.com" />
        </F>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <F label="Company Description *" error={infoErr.description}>
          <textarea rows={3} value={info.description} onChange={setI('description')} placeholder="Short description of your company (shown to students)" style={{ resize: 'vertical' }} />
        </F>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <F label="About the Company">
          <textarea rows={4} value={info.about} onChange={setI('about')} placeholder="Detailed company overview, culture, values…" style={{ resize: 'vertical' }} />
        </F>
      </div>
      <F label="LinkedIn Company URL">
        <input value={info.linkedin} onChange={setI('linkedin')} placeholder="https://linkedin.com/company/yourcompany" />
      </F>
    </>
  );
}

function Step3({ basic, info, onEdit }) {
  return (
    <>
      <div className="cp-card-title">Step 3 – Review &amp; Submit</div>
      <div className="cp-card-sub">Review your company profile before submitting</div>

      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '1.5rem', border: '1px solid #d1fae5', marginBottom: '1rem' }}>
        <ReviewSection title="Basic Company Details" onEdit={() => onEdit(0)}>
          <RItem l="Company Name"   v={basic.companyName} />
          <RItem l="Industry"       v={basic.industry} />
          <RItem l="Company Size"   v={basic.size} />
          <RItem l="Website"        v={basic.website || '—'} />
          <RItem l="HQ Location"    v={basic.hqLocation} />
          <RItem l="Logo"           v={basic.logoFile ? basic.logoFile.name : 'Not uploaded'} />
        </ReviewSection>
        <ReviewSection title="Company Information" onEdit={() => onEdit(1)}>
          <RItem l="Contact Person" v={info.contactPerson} />
          <RItem l="Designation"    v={info.designation} />
          <RItem l="Phone"          v={info.contactPhone || '—'} />
          <RItem l="Recruit Email"  v={info.recruitEmail || '—'} />
          <RItem l="Description"    v={info.description} />
          <RItem l="LinkedIn"       v={info.linkedin || '—'} />
        </ReviewSection>
      </div>

      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1rem', fontSize: '.875rem', color: '#92400e' }}>
        ⚠️ After submission, your profile will be reviewed for <strong>verification</strong>. You can post jobs once your company is verified.
      </div>
    </>
  );
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.625rem', borderBottom: '1px solid #d1fae5', paddingBottom: '.375rem' }}>
        <h4 style={{ fontSize: '.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>{title}</h4>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#059669', fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem 2rem' }}>{children}</div>
    </div>
  );
}

function RItem({ l, v }) {
  return (
    <div>
      <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{l}</div>
      <div style={{ fontSize: '.875rem', color: '#111827', fontWeight: 500 }}>{v || '—'}</div>
    </div>
  );
}

function F({ label, error, children }) {
  return (
    <div className="cp-field">
      {label && <label>{label}</label>}
      {children}
      {error && <span className="cp-field-err">{error}</span>}
    </div>
  );
}
