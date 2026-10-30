/**
 * StudentProfileView – read-only profile page.
 *
 * Fetches the authenticated student's profile directly from
 * GET /api/student/profile and renders every saved field.
 * An "Edit Profile" button navigates to the 3-step wizard.
 * The page never reads from localStorage for profile content.
 */
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext.jsx';
import { getStudentProfile }   from '../../api/authApi.js';
import './student.css';

/* ── Helpers ─────────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        fontSize: '.75rem', fontWeight: 700, color: '#2563eb',
        textTransform: 'uppercase', letterSpacing: '.06em',
        borderBottom: '1.5px solid #e2e8f0', paddingBottom: '.375rem',
        marginBottom: '.875rem',
      }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '.625rem' }}>
      <div style={{ minWidth: 180, fontSize: '.8125rem', color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '.9rem', color: '#111827', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function TagList({ tags }) {
  if (!tags || tags.length === 0) return <span style={{ color: '#9ca3af', fontSize: '.875rem' }}>—</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem' }}>
      {tags.map(t => (
        <span key={t} style={{
          background: '#eff6ff', color: '#1d4ed8',
          fontSize: '.8rem', fontWeight: 500,
          padding: '.2rem .625rem', borderRadius: 999,
        }}>{t}</span>
      ))}
    </div>
  );
}

/* ── Profile completion calculator (matches dashboard logic exactly) ─── */
function calcPct(p) {
  if (!p) return 20;
  let pct = 20;
  if (p.college)                      pct += 20;
  if (p.technicalSkills?.length)      pct += 20;
  if (p.resumeFileName)               pct += 20;
  if (p.linkedinUrl)                  pct += 10;
  if (p.githubUrl)                    pct += 10;
  return Math.min(pct, 100);
}

/* ═══════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════ */
export default function StudentProfileView() {
  const navigate       = useNavigate();
  const { user }       = useAuth();

  const [profile, setProfile]   = useState(null);   // null = loading, false = no profile
  const [loadErr, setLoadErr]   = useState('');

  useEffect(() => {
    getStudentProfile()
      .then(res => {
        if (res.status === 204 || !res.data) {
          setProfile(false); // no profile created yet
        } else {
          setProfile(res.data);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load profile. Please try again.';
        setLoadErr(msg);
        setProfile(false);
      });
  }, []);

  const pct = calcPct(profile || null);

  /* ── Loading state ─────────────────────────────────────────────── */
  if (profile === null && !loadErr) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="db-spinner" />
      </div>
    );
  }

  /* ── Error state ────────────────────────────────────────────────── */
  if (loadErr) {
    return (
      <div className="ad-card" style={{ maxWidth: 560, margin: '2rem auto' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', fontSize: '.9rem', color: '#b91c1c' }}>
          ✕ {loadErr}
        </div>
        <button onClick={() => navigate('/student/profile-setup')}
          style={{ marginTop: '1rem', padding: '.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
          Complete Your Profile
        </button>
      </div>
    );
  }

  /* ── No profile yet ─────────────────────────────────────────────── */
  if (profile === false) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '.5rem' }}>
          Profile Not Set Up Yet
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Complete your profile to unlock job recommendations and recruiter visibility.
        </p>
        <button onClick={() => navigate('/student/profile-setup')}
          style={{ padding: '.75rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          Complete Profile →
        </button>
      </div>
    );
  }

  /* ── Full profile view ──────────────────────────────────────────── */
  const p = profile;

  return (
    <div>
      {/* Header card */}
      <div style={{
        background: 'linear-gradient(135deg,#1e40af,#2563eb)',
        borderRadius: 14, padding: '1.5rem 2rem',
        marginBottom: '1.25rem', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.25rem',
          }}>
            {user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{user?.fullName}</div>
            <div style={{ opacity: .8, fontSize: '.875rem' }}>{user?.email}</div>
            <div style={{ opacity: .8, fontSize: '.8125rem', marginTop: '.25rem' }}>
              {p.degree} · {p.branch}
            </div>
          </div>
        </div>

        {/* Profile completion */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: '.8rem', opacity: .8, marginBottom: '.5rem' }}>Profile Complete</div>
          <div style={{ width: 140, height: 6, background: 'rgba(255,255,255,.2)', borderRadius: 999 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#fff', borderRadius: 999, transition: 'width .4s' }} />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate('/student/profile-setup')}
          style={{ padding: '.6rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Academic */}
      <div className="db-card" style={{ marginBottom: '1rem' }}>
        <Section title="Academic Details">
          <Row label="College"           value={p.college} />
          <Row label="University"        value={p.university} />
          <Row label="Degree"            value={p.degree} />
          <Row label="Branch"            value={p.branch} />
          <Row label="Current Year"      value={p.currentYear} />
          <Row label="Current Semester"  value={p.currentSemester} />
          <Row label="Graduation Year"   value={p.graduationYear} />
          <Row label="CGPA / Percentage" value={p.cgpa} />
          <Row label="Active Backlogs"   value={p.activeBacklogs ?? 0} />
        </Section>
      </div>

      {/* Skills */}
      <div className="db-card" style={{ marginBottom: '1rem' }}>
        <Section title="Skills &amp; Preferences">
          <div style={{ marginBottom: '.875rem' }}>
            <div style={{ fontSize: '.8125rem', color: '#6b7280', marginBottom: '.375rem', fontWeight: 500 }}>Technical Skills</div>
            <TagList tags={p.technicalSkills} />
          </div>
          <div style={{ marginBottom: '.875rem' }}>
            <div style={{ fontSize: '.8125rem', color: '#6b7280', marginBottom: '.375rem', fontWeight: 500 }}>Programming Languages</div>
            <TagList tags={p.programmingLanguages} />
          </div>
          <div style={{ marginBottom: '.875rem' }}>
            <div style={{ fontSize: '.8125rem', color: '#6b7280', marginBottom: '.375rem', fontWeight: 500 }}>Preferred Job Roles</div>
            <TagList tags={p.preferredRoles} />
          </div>
          <div style={{ marginBottom: '.875rem' }}>
            <div style={{ fontSize: '.8125rem', color: '#6b7280', marginBottom: '.375rem', fontWeight: 500 }}>Preferred Locations</div>
            <TagList tags={p.preferredLocations} />
          </div>
          <Row label="Preferred Work Mode" value={p.preferredWorkMode} />
          {p.experience && (
            <div>
              <div style={{ fontSize: '.8125rem', color: '#6b7280', fontWeight: 500, marginBottom: '.25rem' }}>Experience / Projects</div>
              <div style={{ fontSize: '.875rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.experience}</div>
            </div>
          )}
        </Section>
      </div>

      {/* Resume & Links */}
      <div className="db-card">
        <Section title="Resume &amp; Links">
          <Row label="Resume File"  value={p.resumeFileName} />
          <Row label="LinkedIn URL" value={p.linkedinUrl && (
            <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{p.linkedinUrl}</a>
          )} />
          <Row label="GitHub URL"   value={p.githubUrl && (
            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{p.githubUrl}</a>
          )} />
          <Row label="Portfolio"    value={p.portfolioUrl && (
            <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{p.portfolioUrl}</a>
          )} />
        </Section>

        {pct < 100 && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 8, padding: '.875rem 1rem',
            fontSize: '.875rem', color: '#1d4ed8',
            display: 'flex', alignItems: 'center', gap: '.625rem',
          }}>
            <span>💡</span>
            <span>
              <strong>Profile {pct}% complete.</strong> Add{' '}
              {!p.resumeFileName && 'resume, '}
              {!p.linkedinUrl && 'LinkedIn URL, '}
              {!p.githubUrl && 'GitHub URL'}
              {' '}to reach 100%.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
