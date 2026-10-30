import { useState, useEffect } from 'react';
import { getPostingStatus } from '../../api/authApi.js';
import './company.css';

const BRANCHES    = ['CSE','IT','ECE','EEE','Mechanical','Civil','Data Science','AI/ML','BCA','MCA','All Branches'];
const EXP_OPTIONS = ['Fresher (0 years)','0–1 year','1–2 years','2–3 years','3–5 years','5+ years'];
const WORK_MODES  = ['On-site','Remote','Hybrid'];
const PROC_TYPES  = ['Written Test','Group Discussion','Technical Interview','HR Interview','Multiple Rounds'];
const GRAD_YEARS  = ['2024','2025','2026','2027','2028'];
const JOB_TYPES   = ['Full-time','Part-time','Internship','Contract'];

function TagInput({ value, onChange, placeholder, suggestions = [] }) {
  const [inp, setInp] = useState('');
  const [showSug, setShowSug] = useState(false);

  function add(t) { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setInp(''); setShowSug(false); }
  function remove(t) { onChange(value.filter(x => x !== t)); }
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(inp); }
    if (e.key === 'Backspace' && !inp && value.length) remove(value[value.length - 1]);
  }
  const filtered = suggestions.filter(s => s.toLowerCase().includes(inp.toLowerCase()) && !value.includes(s));

  return (
    <div style={{ position: 'relative' }}>
      <div className="pj-tags-input">
        {value.map(t => (
          <span key={t} className="pj-tag">{t}<button type="button" onClick={() => remove(t)}>×</button></span>
        ))}
        <input value={inp} onChange={e => { setInp(e.target.value); setShowSug(true); }}
          onKeyDown={onKey} onFocus={() => setShowSug(true)} onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={value.length ? '' : placeholder} />
      </div>
      {showSug && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 100, maxHeight: 160, overflowY: 'auto' }}>
          {filtered.slice(0, 8).map(s => (
            <div key={s} onMouseDown={() => add(s)}
              style={{ padding: '.5rem .875rem', cursor: 'pointer', fontSize: '.875rem', color: '#374151' }}
              onMouseEnter={e => e.target.style.background = '#f0fdf4'}
              onMouseLeave={e => e.target.style.background = '#fff'}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostJob({ onSuccess }) {
  // ── Server-side verification guard ──────────────────────────────────
  const [eligible, setEligible]         = useState(null); // null=checking
  const [eligibilityStatus, setStatus]  = useState('');

  useEffect(() => {
    getPostingStatus()
      .then(({ data }) => {
        setEligible(data.eligible);
        setStatus(data.verificationStatus || 'PENDING');
      })
      .catch(() => { setEligible(false); setStatus('PENDING'); });
  }, []);

  if (eligible === null) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><div style={{ width: 36, height: 36, border: '3px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;
  }

  if (!eligible) {
    const msgs = {
      PENDING:           'Your company is awaiting verification before you can post jobs.',
      UNDER_REVIEW:      'Admin is reviewing your company. Job posting will be enabled once approved.',
      NEEDS_INFORMATION: 'Your company requires additional information. Please update your profile and resubmit.',
      REJECTED:          'Your company verification was rejected. You cannot post jobs.',
      SUSPENDED:         'Your company has been suspended. Job posting is blocked.',
    };
    return (
      <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '.5rem' }}>Job Posting Not Available</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          {msgs[eligibilityStatus] || 'Your company must be verified before posting jobs.'}
        </p>
        <p style={{ fontSize: '.8125rem', color: '#9ca3af' }}>
          This restriction is enforced by the backend. Contact support if you believe this is incorrect.
        </p>
      </div>
    );
  }

  // ── Form state (only reached when eligible === true) ──────────────
  const [form, setForm] = useState({
    title: '', type: '', description: '', skills: [], branches: [], minCgpa: '',
    gradYear: '', backlogAllowed: 'No', location: '', workMode: 'On-site',
    salaryMin: '', salaryMax: '', experience: '', deadline: '', vacancies: '',
    interviewProcess: [],
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set  = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };
  const setA = (f) => (v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

  function validate() {
    const e = {};
    if (!form.title.trim())       e.title       = 'Job title is required';
    if (!form.type)               e.type        = 'Job type is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.skills.length)      e.skills      = 'Add at least one skill';
    if (!form.location.trim())    e.location    = 'Location is required';
    if (!form.deadline)           e.deadline    = 'Application deadline is required';
    if (!form.vacancies || Number(form.vacancies) < 1) e.vacancies = 'Enter number of vacancies';
    return e;
  }

  async function handlePublish(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    if (onSuccess) setTimeout(onSuccess, 2000);
  }

  if (submitted) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '.5rem' }}>Job Posted Successfully!</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          <strong>{form.title}</strong> has been published. Students matching your criteria will be notified.
        </p>
        <button onClick={() => { setSubmitted(false); setForm({ title:'',type:'',description:'',skills:[],branches:[],minCgpa:'',gradYear:'',backlogAllowed:'No',location:'',workMode:'On-site',salaryMin:'',salaryMax:'',experience:'',deadline:'',vacancies:'',interviewProcess:[] }); }}
          style={{ padding: '.75rem 2rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          Post Another Job
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePublish} noValidate>
      {/* Basic Info */}
      <div className="pj-card">
        <div className="pj-section-title">
          <span>📋</span> Basic Job Information
        </div>
        <div className="pj-grid">
          <PF label="Job Title *" error={errors.title}>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Software Engineer" />
          </PF>
          <PF label="Job Type *" error={errors.type}>
            <select value={form.type} onChange={set('type')}>
              <option value="">Select type</option>
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </PF>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <PF label="Job Description *" error={errors.description}>
            <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Describe the role, responsibilities and expectations…" style={{ resize: 'vertical' }} />
          </PF>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <PF label="Required Skills *" error={errors.skills}>
            <TagInput value={form.skills} onChange={setA('skills')} placeholder="Add skill and press Enter…"
              suggestions={['React','Node.js','Python','Java','SQL','MongoDB','AWS','Docker','Spring Boot','Machine Learning','Data Analysis','TypeScript']} />
          </PF>
        </div>
      </div>

      {/* Eligibility */}
      <div className="pj-card">
        <div className="pj-section-title"><span>🎓</span> Eligibility Criteria</div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' }}>Eligible Branches</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {BRANCHES.map(b => {
              const sel = form.branches.includes(b);
              return (
                <button type="button" key={b} onClick={() => setForm(p => ({ ...p, branches: sel ? p.branches.filter(x => x !== b) : [...p.branches, b] }))}
                  style={{ padding: '.35rem .875rem', borderRadius: 999, fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${sel ? '#059669' : '#e2e8f0'}`, background: sel ? '#f0fdf4' : '#fff', color: sel ? '#059669' : '#6b7280', transition: 'all .15s' }}>
                  {b}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pj-grid">
          <PF label="Minimum CGPA">
            <input type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={set('minCgpa')} placeholder="e.g. 6.5" />
          </PF>
          <PF label="Graduation Year">
            <select value={form.gradYear} onChange={set('gradYear')}>
              <option value="">Any year</option>
              {GRAD_YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </PF>
        </div>
        <PF label="Backlog Criteria">
          <select value={form.backlogAllowed} onChange={set('backlogAllowed')}>
            <option value="No">No active backlogs</option>
            <option value="Yes">Backlogs allowed</option>
            <option value="History">History of backlogs allowed</option>
          </select>
        </PF>
      </div>

      {/* Location & Package */}
      <div className="pj-card">
        <div className="pj-section-title"><span>💼</span> Job Details &amp; Package</div>
        <div className="pj-grid">
          <PF label="Job Location *" error={errors.location}>
            <input value={form.location} onChange={set('location')} placeholder="e.g. Bangalore, Remote" />
          </PF>
          <PF label="Work Mode">
            <select value={form.workMode} onChange={set('workMode')}>
              {WORK_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </PF>
        </div>
        <div className="pj-grid-3">
          <PF label="Salary Min (LPA)">
            <input type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="e.g. 6" />
          </PF>
          <PF label="Salary Max (LPA)">
            <input type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="e.g. 12" />
          </PF>
          <PF label="Experience Required">
            <select value={form.experience} onChange={set('experience')}>
              <option value="">Select</option>
              {EXP_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </PF>
        </div>
      </div>

      {/* Process & Deadline */}
      <div className="pj-card">
        <div className="pj-section-title"><span>🗓️</span> Application &amp; Interview</div>
        <div className="pj-grid">
          <PF label="Application Deadline *" error={errors.deadline}>
            <input type="date" value={form.deadline} onChange={set('deadline')} min={new Date().toISOString().split('T')[0]} />
          </PF>
          <PF label="Number of Vacancies *" error={errors.vacancies}>
            <input type="number" min="1" value={form.vacancies} onChange={set('vacancies')} placeholder="e.g. 10" />
          </PF>
        </div>
        <div>
          <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#374151', marginBottom: '.375rem' }}>Interview Process</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {PROC_TYPES.map(p => {
              const sel = form.interviewProcess.includes(p);
              return (
                <button type="button" key={p} onClick={() => setForm(prev => ({ ...prev, interviewProcess: sel ? prev.interviewProcess.filter(x => x !== p) : [...prev.interviewProcess, p] }))}
                  style={{ padding: '.35rem .875rem', borderRadius: 999, fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${sel ? '#059669' : '#e2e8f0'}`, background: sel ? '#f0fdf4' : '#fff', color: sel ? '#059669' : '#6b7280', transition: 'all .15s' }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button type="button" style={{ padding: '.75rem 2rem', border: '1.5px solid #d1fae5', borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
          Save as Draft
        </button>
        <button type="submit" disabled={loading} style={{ padding: '.75rem 2.5rem', background: loading ? '#6ee7b7' : '#059669', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s' }}>
          {loading ? 'Publishing…' : '🚀 Publish Job'}
        </button>
      </div>
    </form>
  );
}

function PF({ label, error, children }) {
  return (
    <div className="pj-field">
      {label && <label>{label}</label>}
      {children}
      {error && <p className="pj-field-err">{error}</p>}
    </div>
  );
}
