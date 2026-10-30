import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getStudentProfile, createStudentProfile, updateStudentProfile } from '../../api/authApi.js';
import './student.css';

const STEPS = ['Academic Details', 'Skills & Preferences', 'Resume & Finalize'];

const DEGREES    = ['B.Tech','B.E.','BCA','B.Sc','MCA','M.Tech','MBA','B.Com','BBA','Other'];
const BRANCHES   = ['Computer Science','Information Technology','Electronics','Electrical','Mechanical','Civil','Data Science','AI/ML','Other'];
const YEARS      = ['1st Year','2nd Year','3rd Year','4th Year','5th Year'];
const SEMS       = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
const GRAD_YRS   = ['2024','2025','2026','2027','2028'];
const ROLES      = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Analyst','Data Scientist','DevOps Engineer','Mobile Developer','UI/UX Designer','Product Manager','Business Analyst','Cybersecurity Analyst'];
const CITIES     = ['Bangalore','Mumbai','Hyderabad','Pune','Chennai','Delhi NCR','Kolkata','Ahmedabad','Remote'];
const WORK_MODES = ['Remote','Hybrid','On-site'];

/* ── Tag input component (unchanged) ─────────────────────────────────── */
function TagsInput({ value, onChange, placeholder, suggestions = [] }) {
  const [input, setInput]     = useState('');
  const [showSug, setShowSug] = useState(false);

  function addTag(tag) {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput(''); setShowSug(false);
  }
  function removeTag(t) { onChange(value.filter(x => x !== t)); }
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && value.length) removeTag(value[value.length - 1]);
  }
  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  return (
    <div style={{ position: 'relative' }}>
      <div className="ps-tags-input"
        onClick={() => document.getElementById('ti-' + placeholder)?.focus()}>
        {value.map(t => (
          <span key={t} className="ps-tag">
            {t}
            <button type="button" onClick={() => removeTag(t)}>×</button>
          </span>
        ))}
        <input
          id={'ti-' + placeholder}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSug(true); }}
          onKeyDown={onKey}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={value.length ? '' : placeholder}
        />
      </div>
      {showSug && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 100, maxHeight: 180, overflowY: 'auto' }}>
          {filtered.slice(0, 8).map(s => (
            <div key={s} onMouseDown={() => addTag(s)}
              style={{ padding: '.5rem .875rem', cursor: 'pointer', fontSize: '.875rem', color: '#374151' }}
              onMouseEnter={e => e.target.style.background = '#f1f5f9'}
              onMouseLeave={e => e.target.style.background = '#fff'}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Success toast ────────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════ */
export default function StudentProfileSetup() {
  const navigate          = useNavigate();
  const { user, saveAuth } = useAuth();
  const errorRef          = useRef(null);

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [apiErr, setApiErr]           = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  /* Step 1 state */
  const [academic, setAcademic] = useState({
    college: '', university: '', degree: '', branch: '',
    currentYear: '', currentSemester: '', graduationYear: '',
    cgpa: '', backlogs: '0',
  });
  const [acadErr, setAcadErr] = useState({});

  /* Step 2 state */
  const [skills, setSkills] = useState({
    technicalSkills: [], programmingLanguages: [],
    preferredRoles: [], preferredLocations: [],
    experience: '', workMode: '',
  });
  const [skillErr, setSkillErr] = useState({});

  /* Step 3 state */
  const [resume, setResume] = useState({
    file: null,           // actual File object (null if not re-uploaded)
    existingFileName: '', // filename already saved on the server
    linkedin: '', github: '', portfolio: '',
  });
  const [resumeErr, setResumeErr] = useState({});

  /* ── Load existing profile on mount ─────────────────────────────── */
  useEffect(() => {
    getStudentProfile()
      .then(res => {
        if (res.status === 200 && res.data) {
          const p = res.data;
          setExistingProfile(p);
          setAcademic({
            college:         p.college          || '',
            university:      p.university       || '',
            degree:          p.degree           || '',
            branch:          p.branch           || '',
            currentYear:     p.currentYear      || '',
            currentSemester: p.currentSemester  || '',
            graduationYear:  p.graduationYear   || '',
            cgpa:            p.cgpa             || '',
            backlogs:        String(p.activeBacklogs ?? 0),
          });
          setSkills({
            technicalSkills:     p.technicalSkills      || [],
            programmingLanguages:p.programmingLanguages || [],
            preferredRoles:      p.preferredRoles       || [],
            preferredLocations:  p.preferredLocations   || [],
            experience:          p.experience           || '',
            workMode:            p.preferredWorkMode    || '',
          });
          setResume(prev => ({
            ...prev,
            existingFileName: p.resumeFileName || '',
            linkedin:         p.linkedinUrl    || '',
            github:           p.githubUrl      || '',
            portfolio:        p.portfolioUrl   || '',
          }));
        }
      })
      .catch(() => { /* 204 or network – start fresh */ });
  }, []); // eslint-disable-line

  /* ── Validation ──────────────────────────────────────────────────── */
  function validateStep1() {
    const e = {};
    if (!academic.college.trim())    e.college      = 'Required';
    if (!academic.university.trim()) e.university   = 'Required';
    if (!academic.degree)            e.degree       = 'Required';
    if (!academic.branch)            e.branch       = 'Required';
    if (!academic.currentYear)       e.currentYear  = 'Required';
    if (!academic.graduationYear)    e.graduationYear = 'Required';
    if (academic.cgpa && isNaN(Number(academic.cgpa))) e.cgpa = 'Must be a number';
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!skills.technicalSkills.length)      e.technicalSkills     = 'Add at least one skill';
    if (!skills.programmingLanguages.length) e.programmingLanguages = 'Add at least one language';
    if (!skills.preferredRoles.length)       e.preferredRoles      = 'Add at least one role';
    if (!skills.workMode)                    e.workMode            = 'Select a work mode';
    return e;
  }

  function validateStep3() {
    const e = {};
    // FIX: resume file is OPTIONAL if a filename was already saved
    // Only require it on a brand-new profile with nothing saved yet
    const hasExistingResume = !!(resume.existingFileName || resume.file);
    if (!hasExistingResume && !existingProfile) {
      e.file = 'Please upload your resume';
    }
    if (resume.linkedin && !/linkedin\.com/.test(resume.linkedin)) {
      e.linkedin = 'Enter a valid LinkedIn URL';
    }
    return e;
  }

  function nextStep() {
    let errs = {};
    if (step === 0) { errs = validateStep1(); setAcadErr(errs); }
    if (step === 1) { errs = validateStep2(); setSkillErr(errs); }
    if (Object.keys(errs).length) {
      // Scroll errors into view
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  async function handleSubmit() {
    const errs = validateStep3();
    setResumeErr(errs);
    if (Object.keys(errs).length) {
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }

    setLoading(true);
    setApiErr('');

    // Resolve the resume filename: prefer newly uploaded file, fall back to saved name
    const resolvedResumeName = resume.file?.name || resume.existingFileName || null;

    const payload = {
      college:              academic.college,
      university:           academic.university,
      degree:               academic.degree,
      branch:               academic.branch,
      currentYear:          academic.currentYear,
      currentSemester:      academic.currentSemester,
      graduationYear:       academic.graduationYear,
      cgpa:                 academic.cgpa          || null,
      activeBacklogs:       parseInt(academic.backlogs, 10) || 0,
      technicalSkills:      skills.technicalSkills,
      programmingLanguages: skills.programmingLanguages,
      preferredRoles:       skills.preferredRoles,
      preferredLocations:   skills.preferredLocations,
      experience:           skills.experience      || null,
      preferredWorkMode:    skills.workMode,
      resumeFileName:       resolvedResumeName,
      linkedinUrl:          resume.linkedin        || null,
      githubUrl:            resume.github          || null,
      portfolioUrl:         resume.portfolio       || null,
    };

    try {
      const apiFn = existingProfile ? updateStudentProfile : createStudentProfile;
      const { data } = await apiFn(payload);

      // ── Update AuthContext so profilePct calculates correctly ───────
      // Store the full profile response alongside auth fields
      const updatedUser = {
        ...user,
        profileCompleted: true,
        // Store enough for the dashboard's profilePct calculation
        savedProfile: {
          college:        data.college,
          technicalSkills:data.technicalSkills,
          resumeFileName: data.resumeFileName,
          linkedinUrl:    data.linkedinUrl,
          githubUrl:      data.githubUrl,
        },
      };
      saveAuth(updatedUser, localStorage.getItem('hb_token'));

      // Show success toast, then redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1800);

    } catch (err) {
      // Surface the exact backend message
      const details = err.response?.data?.details;
      const detailMsg = details ? Object.values(details)[0] : null;
      const msg =
        detailMsg ||
        err.response?.data?.message ||
        `Error ${err.response?.status ?? ''}: Failed to save profile. Please try again.`;
      setApiErr(msg);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setLoading(false);
    }
  }

  const setA = (f) => (e) => {
    setAcademic(p => ({ ...p, [f]: e.target.value }));
    setAcadErr(p => ({ ...p, [f]: '' }));
  };

  /* ── Step 1 render ───────────────────────────────────────────────── */
  function renderStep1() {
    return (
      <>
        <div className="ps-card-title">Step 1 – Academic Details</div>
        <div className="ps-card-sub">Tell us about your educational background</div>
        <div className="ps-grid" style={{ marginBottom: '1rem' }}>
          <Field label="College Name *" error={acadErr.college}>
            <input value={academic.college} onChange={setA('college')} placeholder="e.g. IIT Delhi" />
          </Field>
          <Field label="University *" error={acadErr.university}>
            <input value={academic.university} onChange={setA('university')} placeholder="e.g. Delhi University" />
          </Field>
        </div>
        <div className="ps-grid" style={{ marginBottom: '1rem' }}>
          <Field label="Degree *" error={acadErr.degree}>
            <select value={academic.degree} onChange={setA('degree')}>
              <option value="">Select degree</option>
              {DEGREES.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Branch / Specialisation *" error={acadErr.branch}>
            <select value={academic.branch} onChange={setA('branch')}>
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>
        <div className="ps-grid-3" style={{ marginBottom: '1rem' }}>
          <Field label="Current Year *" error={acadErr.currentYear}>
            <select value={academic.currentYear} onChange={setA('currentYear')}>
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Current Semester">
            <select value={academic.currentSemester} onChange={setA('currentSemester')}>
              <option value="">Select semester</option>
              {SEMS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Graduation Year *" error={acadErr.graduationYear}>
            <select value={academic.graduationYear} onChange={setA('graduationYear')}>
              <option value="">Select year</option>
              {GRAD_YRS.map(y => <option key={y}>{y}</option>)}
            </select>
          </Field>
        </div>
        <div className="ps-grid">
          <Field label="CGPA / Percentage" error={acadErr.cgpa}>
            <input type="number" step="0.01" min="0" max="10"
              value={academic.cgpa} onChange={setA('cgpa')} placeholder="e.g. 8.5" />
          </Field>
          <Field label="Active Backlogs">
            <input type="number" min="0"
              value={academic.backlogs} onChange={setA('backlogs')} placeholder="0" />
          </Field>
        </div>
      </>
    );
  }

  /* ── Step 2 render ───────────────────────────────────────────────── */
  function renderStep2() {
    const setS = (f) => (v) => {
      setSkills(p => ({ ...p, [f]: v }));
      setSkillErr(p => ({ ...p, [f]: '' }));
    };
    return (
      <>
        <div className="ps-card-title">Step 2 – Skills &amp; Preferences</div>
        <div className="ps-card-sub">Tell us what you know and what you're looking for</div>

        <Field label="Technical Skills *" error={skillErr.technicalSkills} style={{ marginBottom: '1rem' }}>
          <TagsInput value={skills.technicalSkills} onChange={setS('technicalSkills')}
            placeholder="Add skill and press Enter…"
            suggestions={['React','Node.js','Python','Java','SQL','MongoDB','AWS','Docker','Kubernetes','Machine Learning','Deep Learning','Data Analysis']} />
        </Field>
        <Field label="Programming Languages *" error={skillErr.programmingLanguages} style={{ marginBottom: '1rem' }}>
          <TagsInput value={skills.programmingLanguages} onChange={setS('programmingLanguages')}
            placeholder="Add language and press Enter…"
            suggestions={['JavaScript','Python','Java','C++','C','TypeScript','Go','Rust','Swift','Kotlin','PHP','Ruby']} />
        </Field>
        <Field label="Preferred Job Roles *" error={skillErr.preferredRoles} style={{ marginBottom: '1rem' }}>
          <TagsInput value={skills.preferredRoles} onChange={setS('preferredRoles')}
            placeholder="Add role and press Enter…" suggestions={ROLES} />
        </Field>
        <Field label="Preferred Locations" style={{ marginBottom: '1rem' }}>
          <TagsInput value={skills.preferredLocations} onChange={setS('preferredLocations')}
            placeholder="Add city and press Enter…" suggestions={CITIES} />
        </Field>
        <Field label="Internship / Project Experience" style={{ marginBottom: '1rem' }}>
          <textarea value={skills.experience}
            onChange={e => setSkills(p => ({ ...p, experience: e.target.value }))}
            rows={3} placeholder="Briefly describe internships, projects or open-source contributions…"
            style={{ resize: 'vertical' }} />
        </Field>
        <Field label="Preferred Work Mode *" error={skillErr.workMode}>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            {WORK_MODES.map(m => (
              <label key={m} style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                cursor: 'pointer', padding: '.5rem 1rem', borderRadius: 8,
                border: `1.5px solid ${skills.workMode === m ? '#2563eb' : '#e2e8f0'}`,
                background: skills.workMode === m ? '#eff6ff' : '#fff',
                fontSize: '.9rem', fontWeight: 500,
                color: skills.workMode === m ? '#1d4ed8' : '#374151',
                transition: 'all .15s',
              }}>
                <input type="radio" name="workMode" value={m}
                  checked={skills.workMode === m}
                  onChange={() => { setSkills(p => ({ ...p, workMode: m })); setSkillErr(p => ({ ...p, workMode: '' })); }}
                  style={{ display: 'none' }} />
                {m}
              </label>
            ))}
          </div>
        </Field>
      </>
    );
  }

  /* ── Step 3 render ───────────────────────────────────────────────── */
  function renderStep3() {
    const hasResume = resume.file || resume.existingFileName;
    return (
      <>
        <div className="ps-card-title">Step 3 – Resume &amp; Finalize</div>
        <div className="ps-card-sub">Upload your resume and add your professional links</div>

        {/* Resume upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' }}>
            Resume (PDF) {!existingProfile && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <label className="ps-upload-box">
            <input type="file" accept=".pdf"
              onChange={e => {
                setResume(p => ({ ...p, file: e.target.files[0] }));
                setResumeErr(p => ({ ...p, file: '' }));
              }} />
            <div className="ps-upload-icon">📄</div>
            {resume.file ? (
              <div>
                <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '.9375rem' }}>{resume.file.name}</div>
                <div style={{ fontSize: '.8125rem', color: '#6b7280', marginTop: '.25rem' }}>
                  {(resume.file.size / 1024).toFixed(1)} KB · Click to change
                </div>
              </div>
            ) : resume.existingFileName ? (
              <div>
                <div style={{ fontWeight: 600, color: '#059669', fontSize: '.9375rem' }}>
                  ✓ {resume.existingFileName}
                </div>
                <div style={{ fontSize: '.8125rem', color: '#6b7280', marginTop: '.25rem' }}>
                  Previously uploaded · Click to replace
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '.9375rem' }}>
                  Click to upload or drag &amp; drop
                </div>
                <div style={{ fontSize: '.8125rem', color: '#9ca3af', marginTop: '.25rem' }}>
                  PDF only · Max 5 MB
                </div>
              </div>
            )}
          </label>
          {resumeErr.file && (
            <p style={{ fontSize: '.75rem', color: '#ef4444', marginTop: '.25rem' }}>
              {resumeErr.file}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="ps-grid" style={{ marginBottom: '1rem' }}>
          <Field label="LinkedIn Profile URL" error={resumeErr.linkedin}>
            <input value={resume.linkedin}
              onChange={e => setResume(p => ({ ...p, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/yourname" />
          </Field>
          <Field label="GitHub Profile URL">
            <input value={resume.github}
              onChange={e => setResume(p => ({ ...p, github: e.target.value }))}
              placeholder="https://github.com/yourname" />
          </Field>
        </div>
        <Field label="Portfolio URL (optional)" style={{ marginBottom: '1.5rem' }}>
          <input value={resume.portfolio}
            onChange={e => setResume(p => ({ ...p, portfolio: e.target.value }))}
            placeholder="https://yourportfolio.com" />
        </Field>

        {/* Review summary */}
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ fontSize: '.875rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '1rem' }}>
            Review Your Details
          </div>
          <ReviewSection title="Academic">
            <ReviewItem label="College"      val={academic.college} />
            <ReviewItem label="Degree"       val={`${academic.degree} – ${academic.branch}`} />
            <ReviewItem label="Year"         val={`${academic.currentYear} | Grad ${academic.graduationYear}`} />
            <ReviewItem label="CGPA"         val={academic.cgpa || '—'} />
          </ReviewSection>
          <ReviewSection title="Skills &amp; Preferences">
            <ReviewItem label="Skills"       val={skills.technicalSkills.join(', ') || '—'} />
            <ReviewItem label="Languages"    val={skills.programmingLanguages.join(', ') || '—'} />
            <ReviewItem label="Roles"        val={skills.preferredRoles.join(', ') || '—'} />
            <ReviewItem label="Work Mode"    val={skills.workMode || '—'} />
          </ReviewSection>
        </div>
      </>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="ps-page">
      {/* Success toast */}
      {showSuccess && <SuccessToast message="Profile saved successfully! Redirecting…" />}

      <header className="ps-header">
        <div className="ps-brand">HireBridge <span>AI</span></div>
        <div style={{ fontSize: '.875rem', color: '#6b7280' }}>
          Welcome, <strong>{user?.fullName?.split(' ')[0]}</strong> 👋
        </div>
      </header>

      <div className="ps-body">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111827', marginBottom: '.25rem' }}>
            Complete Your Profile
          </h1>
          <p style={{ fontSize: '.9rem', color: '#6b7280' }}>
            Step {step + 1} of 3 — {STEPS[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="ps-progress-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`ps-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <div className="ps-step-dot">
                {i < step
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  : i + 1}
              </div>
              <div className="ps-step-label">{s}</div>
            </div>
          ))}
        </div>

        <div className="ps-card">
          {/* Error banner — ref so we can scroll to it */}
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

          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}

          <div className="ps-nav-buttons">
            {step > 0
              ? <button className="ps-btn-prev" onClick={() => { setStep(s => s - 1); setApiErr(''); }}>
                  ← Previous
                </button>
              : <span />}
            {step < 2
              ? <button className="ps-btn-next" onClick={nextStep}>
                  Continue →
                </button>
              : <button
                  className="ps-btn-next"
                  onClick={handleSubmit}
                  disabled={loading || showSuccess}
                  style={{ opacity: loading || showSuccess ? 0.7 : 1 }}
                >
                  {loading ? 'Saving…' : showSuccess ? '✓ Saved!' : '✓ Submit Profile'}
                </button>}
          </div>
        </div>
      </div>

      {/* CSS for toast animation */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function Field({ label, error, children, style }) {
  return (
    <div className="ps-field" style={style}>
      {label && <label>{label}</label>}
      {children}
      {error && <span className="field-err">{error}</span>}
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.5rem' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem 1.5rem' }}>
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ label, val }) {
  return (
    <div>
      <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{label}</div>
      <div style={{ fontSize: '.875rem', color: '#111827', fontWeight: 500 }}>{val || '—'}</div>
    </div>
  );
}
