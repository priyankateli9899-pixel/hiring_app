import { useState, useEffect } from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext.jsx';
import { getStudentProfile }   from '../../api/authApi.js';
import StudentProfileView      from './StudentProfileView.jsx';
import {
  HomeIcon, BriefcaseIcon, StarIcon, FileTextIcon, CalendarIcon,
  ZapIcon, MessageIcon, TrendingUpIcon, BellIcon, UserIcon,
  SettingsIcon, LogoutIcon, SearchIcon, MapPinIcon, ClockIcon,
  CheckCircleIcon, AlertIcon, MenuIcon, XIcon, GraduationIcon,
} from '../../components/Icons.jsx';
import './student.css';

/* ── Static demo data (real data wired when job-search API is built) ── */
const DEMO_JOBS = [
  { id: 1, title: 'Software Engineer', company: 'Google', location: 'Bangalore', type: 'Full-time', mode: 'Hybrid', salary: '₹18–25 LPA', match: 94, color: '#4285F4', initial: 'G' },
  { id: 2, title: 'Frontend Developer', company: 'Flipkart', location: 'Bangalore', type: 'Full-time', mode: 'On-site', salary: '₹12–18 LPA', match: 88, color: '#F7941D', initial: 'F' },
  { id: 3, title: 'Data Analyst', company: 'Infosys', location: 'Pune', type: 'Full-time', mode: 'Remote', salary: '₹8–12 LPA', match: 75, color: '#007CC3', initial: 'I' },
];

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',          icon: HomeIcon },
  { id: 'find-jobs',    label: 'Find Jobs',          icon: SearchIcon },
  { id: 'recommended',  label: 'Recommended Jobs',   icon: StarIcon },
  { id: 'applications', label: 'My Applications',    icon: FileTextIcon, badge: 0 },
  { id: 'interviews',   label: 'Interview Schedule', icon: CalendarIcon },
  { id: 'resume',       label: 'Resume Analyzer',    icon: ZapIcon },
  { id: 'ai-assistant', label: 'AI Career Assistant',icon: MessageIcon },
  { id: 'skill-gap',   label: 'Skill Gap Analysis',  icon: TrendingUpIcon },
  { id: 'notifications',label: 'Notifications',      icon: BellIcon, badge: 3 },
  { id: 'profile',      label: 'My Profile',         icon: UserIcon },
  { id: 'settings',     label: 'Settings',           icon: SettingsIcon },
];

function matchClass(m) { return m >= 85 ? 'high' : m >= 65 ? 'medium' : 'low'; }
function matchLabel(m) { return `${m}% Match`; }

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, saveAuth } = useAuth();
  const [active, setActive]           = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQ, setSearchQ]         = useState('');
  const [profilePct, setProfilePct]   = useState(20); // local state – set from backend fetch

  // ── Fetch saved profile on mount so profilePct is correct after login ──
  useEffect(() => {
    getStudentProfile()
      .then(res => {
        if (res.status === 200 && res.data) {
          const p = res.data;
          // Compute completion from the ACTUAL backend data
          let pct = 20;
          if (p.college)                 pct += 20;
          if (p.technicalSkills?.length) pct += 20;
          if (p.resumeFileName)          pct += 20;
          if (p.linkedinUrl)             pct += 10;
          if (p.githubUrl)               pct += 10;
          setProfilePct(Math.min(pct, 100));

          // Also update AuthContext snapshot so it persists to next render
          const snapshot = {
            college:         p.college,
            technicalSkills: p.technicalSkills,
            resumeFileName:  p.resumeFileName,
            linkedinUrl:     p.linkedinUrl,
            githubUrl:       p.githubUrl,
          };
          const updatedUser = { ...user, profileCompleted: true, savedProfile: snapshot };
          saveAuth(updatedUser, localStorage.getItem('hb_token'));
        }
      })
      .catch(() => {}); // no profile yet – stays at 20
  }, []); // eslint-disable-line

  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const initials  = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S';

  function handleLogout() { logout(); navigate('/student/login'); }

  function handleNav(id) {
    setActive(id);
    setSidebarOpen(false);
    if (id === 'profile') navigate('/student/profile');
  }

  // ── Sidebar ─────────────────────────────────────────────────
  const Sidebar = (
    <div className={`db-sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="db-sidebar-brand">
        <div className="logo-mark">H</div>
        <div className="brand-name">HireBridge <span>AI</span></div>
      </div>

      <nav className="db-nav">
        <div className="db-nav-section">
          <div className="db-nav-section-label">Main Menu</div>
          {NAV.slice(0, 8).map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`db-nav-item${active === id ? ' active' : ''}`} onClick={() => handleNav(id)}>
              <Icon size={17} />
              {label}
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          ))}
        </div>
        <div className="db-nav-section">
          <div className="db-nav-section-label">Account</div>
          {NAV.slice(8).map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`db-nav-item${active === id ? ' active' : ''}`} onClick={() => handleNav(id)}>
              <Icon size={17} />
              {label}
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          ))}
          <button className="db-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogoutIcon size={17} />
            Logout
          </button>
        </div>
      </nav>

      <div className="db-sidebar-footer">
        <div className="db-user-chip">
          <div className="db-avatar">{initials}</div>
          <div className="db-user-info">
            <div className="name">{user?.fullName?.split(' ')[0] ?? 'Student'}</div>
            <div className="role">Student</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Content areas ────────────────────────────────────────────
  function renderDashboard() {
    return (
      <>
        {/* Welcome + profile completion */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 360px', background: 'linear-gradient(135deg,#1e40af,#2563eb)', borderRadius: 14, padding: '1.5rem', color: '#fff' }}>
            <div style={{ fontSize: '.8125rem', opacity: .8, marginBottom: '.25rem' }}>Welcome back 👋</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' }}>{user?.fullName ?? 'Student'}!</h2>
            <p style={{ fontSize: '.875rem', opacity: .85, marginBottom: '1.25rem' }}>Here's your placement journey overview.</p>
            <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '.8125rem', fontWeight: 600 }}>Profile {profilePct}% Complete</span>
                {profilePct < 100 && (
                  <button onClick={() => navigate('/student/profile-setup')}
                    style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', fontSize: '.75rem', fontWeight: 600, padding: '.2rem .625rem', borderRadius: 999, cursor: 'pointer' }}>
                    Complete →
                  </button>
                )}
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,.2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${profilePct}%`, background: '#fff', borderRadius: 999, transition: 'width .4s' }} />
              </div>
            </div>
          </div>

          {/* Profile incomplete tip */}
          {profilePct < 100 && (
            <div style={{ flex: '1 1 220px', background: '#fff', borderRadius: 14, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '.875rem', fontWeight: 700, color: '#111827', marginBottom: '.5rem' }}>🎯 Complete Your Profile</div>
                <p style={{ fontSize: '.8125rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1rem' }}>
                  A complete profile gets <strong>3× more</strong> recruiter views and better job matches.
                </p>
              </div>
              <button onClick={() => navigate('/student/profile-setup')}
                style={{ padding: '.6rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
                Complete Profile →
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="db-stat-grid">
          <StatCard icon="💼" iconBg="#eff6ff" label="Total Jobs Available" value="2,854" sub="Updated today" />
          <StatCard icon="✅" iconBg="#f0fdf4" label="Jobs You're Eligible For" value={profilePct >= 60 ? '120' : '—'} sub={profilePct < 60 ? 'Complete profile to see' : 'Based on your profile'} />
          <StatCard icon="📋" iconBg="#fff7ed" label="Applications Submitted" value="0" sub="Start applying today" />
          <StatCard icon="🗓️" iconBg="#f5f3ff" label="Interviews Scheduled" value="0" sub="No upcoming interviews" />
        </div>

        <div className="db-row-3">
          {/* Recommended Jobs */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Recommended Jobs</div>
              <button className="db-card-link" onClick={() => setActive('recommended')}>View All →</button>
            </div>
            {DEMO_JOBS.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* AI Card */}
            <div className="db-ai-card">
              <h3>🤖 AI Career Assistant</h3>
              <p>Get personalised career advice, resume feedback and interview tips powered by AI.</p>
              <button className="db-ai-btn" onClick={() => setActive('ai-assistant')}>Chat with AI →</button>
            </div>

            {/* Upcoming Interviews */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Upcoming Interviews</div>
              </div>
              <div className="db-empty">
                <div className="db-empty-icon">📅</div>
                <p>No interviews scheduled yet.<br />Apply to jobs to get started.</p>
              </div>
            </div>

            {/* Skill Gap */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Skill Gap Analysis</div>
                <button className="db-card-link" onClick={() => setActive('skill-gap')}>Analyse →</button>
              </div>
              {user?.skills?.technicalSkills?.length ? (
                <div>
                  <p style={{ fontSize: '.8125rem', color: '#6b7280', marginBottom: '.75rem' }}>Your top skills:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem' }}>
                    {user.skills.technicalSkills.slice(0, 6).map(s => (
                      <span key={s} className="db-chip blue">{s}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="db-empty">
                  <p>Complete your profile to see skill gap analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="db-card" style={{ marginTop: '1rem' }}>
          <div className="db-card-header">
            <div className="db-card-title">Recent Applications</div>
            <button className="db-card-link" onClick={() => setActive('applications')}>View All →</button>
          </div>
          <div className="db-empty">
            <div className="db-empty-icon">📭</div>
            <p>You haven't applied to any jobs yet.<br />Browse recommended jobs to get started.</p>
          </div>
        </div>
      </>
    );
  }

  function renderFindJobs() {
    const filtered = DEMO_JOBS.filter(j =>
      !searchQ || j.title.toLowerCase().includes(searchQ.toLowerCase()) || j.company.toLowerCase().includes(searchQ.toLowerCase())
    );
    return (
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <SearchIcon size={17} style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search jobs, companies, roles…"
              style={{ width: '100%', padding: '.7rem .875rem .7rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.9375rem', outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
          {filtered.length ? filtered.map(job => <JobCardFull key={job.id} job={job} />) : (
            <div className="db-empty"><div className="db-empty-icon">🔍</div><p>No jobs found for "{searchQ}"</p></div>
          )}
        </div>
      </div>
    );
  }

  function renderRecommended() {
    return (
      <div>
        <p style={{ fontSize: '.9rem', color: '#6b7280', marginBottom: '1.25rem' }}>
          Jobs recommended based on your profile. Complete your profile for better matches.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
          {DEMO_JOBS.map(job => <JobCardFull key={job.id} job={job} />)}
        </div>
      </div>
    );
  }

  function renderEmpty(icon, title, desc) {
    return (
      <div style={{ background: '#fff', borderRadius: 14, padding: '3rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div className="db-empty">
          <div className="db-empty-icon">{icon}</div>
          <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '.5rem' }}>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
    );
  }

  const PAGE_TITLES = {
    dashboard: 'Dashboard', 'find-jobs': 'Find Jobs', recommended: 'Recommended Jobs',
    applications: 'My Applications', interviews: 'Interview Schedule', resume: 'Resume Analyzer',
    'ai-assistant': 'AI Career Assistant', 'skill-gap': 'Skill Gap Analysis',
    notifications: 'Notifications', profile: 'My Profile', settings: 'Settings',
  };

  function renderContent() {
    switch (active) {
      case 'dashboard':    return renderDashboard();
      case 'find-jobs':    return renderFindJobs();
      case 'recommended':  return renderRecommended();
      case 'profile':      return <StudentProfileView />;
      case 'applications': return renderEmpty('📋','No Applications Yet','You haven\'t applied to any jobs. Start exploring jobs to apply.');
      case 'interviews':   return renderEmpty('🗓️','No Interviews Scheduled','Apply to jobs to get interview invitations from recruiters.');
      case 'resume':       return renderEmpty('⚡','Resume Analyzer','Upload your resume to get AI-powered feedback and improvement suggestions.');
      case 'ai-assistant': return renderEmpty('🤖','AI Career Assistant','Chat with our AI to get personalised career guidance and interview prep tips.');
      case 'skill-gap':    return renderEmpty('📈','Skill Gap Analysis','Complete your profile to see which skills you need for your target roles.');
      case 'notifications':return renderEmpty('🔔','Notifications','You have no new notifications.');
      case 'settings':     return renderEmpty('⚙️','Settings','Account settings will be available soon.');
      default:             return renderDashboard();
    }
  }

  return (
    <div className="db-layout">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 39 }} />
      )}

      {Sidebar}

      <div className="db-main">
        {/* Top bar */}
        <div className="db-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="db-notif-btn" onClick={() => setSidebarOpen(v => !v)}
              style={{ display: 'none' }} id="menu-toggle">
              <MenuIcon size={20} />
            </button>
            <span className="db-topbar-title">{PAGE_TITLES[active] ?? 'Dashboard'}</span>
          </div>
          <div className="db-topbar-actions">
            <button className="db-notif-btn" onClick={() => setActive('notifications')}>
              <BellIcon size={20} />
              <span className="db-notif-dot" />
            </button>
            <div className="db-avatar" style={{ cursor: 'pointer' }} onClick={() => setActive('profile')} title={user?.fullName}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="db-content">
          {renderContent()}
        </div>
      </div>

      {/* Mobile menu button — shown via CSS */}
      <style>{`
        @media (max-width: 768px) {
          #menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="db-stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
      <div className="icon-wrap" style={{ background: iconBg, fontSize: '1.375rem' }}>{icon}</div>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div className="db-job-card" style={{ marginBottom: '.75rem' }}>
      <div className="db-job-logo" style={{ background: job.color + '18', color: job.color }}>{job.initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="db-job-title">{job.title}</div>
        <div className="db-job-company">{job.company} · {job.location}</div>
        <div className="db-job-meta">
          <span className="db-chip">{job.type}</span>
          <span className="db-chip blue">{job.mode}</span>
          <span className="db-chip green">{job.salary}</span>
        </div>
      </div>
      <span className={`db-match-pill ${matchClass(job.match)}`}>{matchLabel(job.match)}</span>
    </div>
  );
}

function JobCardFull({ job }) {
  const [applied, setApplied] = useState(false);
  return (
    <div className="db-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className="db-job-logo" style={{ background: job.color + '18', color: job.color, width: 52, height: 52, fontSize: '1.1rem', borderRadius: 12 }}>{job.initial}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{job.title}</div>
              <div style={{ fontSize: '.875rem', color: '#6b7280' }}>{job.company}</div>
            </div>
            <span className={`db-match-pill ${matchClass(job.match)}`}>{matchLabel(job.match)}</span>
          </div>
          <div className="db-job-meta" style={{ margin: '.625rem 0' }}>
            <span className="db-chip"><MapPinIcon size={12} style={{ marginRight: 3 }} />{job.location}</span>
            <span className="db-chip">{job.type}</span>
            <span className="db-chip blue">{job.mode}</span>
            <span className="db-chip green">{job.salary}</span>
          </div>
          <button onClick={() => setApplied(true)} disabled={applied}
            style={{ padding: '.5rem 1.25rem', background: applied ? '#f0fdf4' : '#2563eb', color: applied ? '#15803d' : '#fff', border: applied ? '1.5px solid #bbf7d0' : 'none', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: applied ? 'default' : 'pointer', transition: 'all .15s' }}>
            {applied ? '✓ Applied' : 'Quick Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
