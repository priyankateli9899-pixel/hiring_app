import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCompanyProfile, getPostingStatus, resubmitProfile } from '../../api/authApi.js';
import {
  HomeIcon, BriefcaseIcon, FileTextIcon, StarIcon, CalendarIcon,
  ClockIcon, SettingsIcon, LogoutIcon, BellIcon, UserIcon,
  TrendingUpIcon, MenuIcon, CheckCircleIcon, AlertIcon,
} from '../../components/Icons.jsx';
import PostJob from './PostJob.jsx';
import InterviewManagement from './InterviewManagement.jsx';
import './company.css';

/* ── Nav definition ────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',     label: 'Dashboard',             icon: HomeIcon },
  { id: 'post-job',      label: 'Post a Job',            icon: BriefcaseIcon },
  { id: 'manage-jobs',   label: 'Manage Jobs',           icon: FileTextIcon },
  { id: 'applications',  label: 'Applications',          icon: FileTextIcon, badge: 0 },
  { id: 'shortlisted',   label: 'Shortlisted Candidates',icon: StarIcon },
  { id: 'interviews',    label: 'Interview Schedule',     icon: CalendarIcon },
  { id: 'slots',         label: 'Slot Management',        icon: ClockIcon },
  { id: 'attendance',    label: 'Candidate Attendance',   icon: CheckCircleIcon },
  { id: 'analytics',     label: 'Recruitment Analytics',  icon: TrendingUpIcon },
  { id: 'notifications', label: 'Notifications',          icon: BellIcon, badge: 2 },
  { id: 'profile',       label: 'Company Profile',        icon: UserIcon },
  { id: 'settings',      label: 'Settings',               icon: SettingsIcon },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard', 'post-job': 'Post a Job', 'manage-jobs': 'Manage Jobs',
  applications: 'Applications', shortlisted: 'Shortlisted Candidates',
  interviews: 'Interview Schedule', slots: 'Slot Management',
  attendance: 'Candidate Attendance', analytics: 'Recruitment Analytics',
  notifications: 'Notifications', profile: 'Company Profile', settings: 'Settings',
};

/* ── Helpers ────────────────────────────────────────────────── */
function initials(name) {
  return (name || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function companyShortName(fullName) {
  if (!fullName) return 'Company';
  // strip the "— ContactPerson" suffix if present from old register flow
  return fullName.split('—')[0].trim().split(' ').slice(0, 3).join(' ');
}

// Simple SVG bar chart
function MiniBarChart({ data, color = '#059669' }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: '100%', background: color + '30', borderRadius: '4px 4px 0 0', height: `${(d.v / max) * 60}px`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, height: `${(d.v / max) * 100}%`, transition: 'height .4s' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '.65rem', color: '#9ca3af', marginTop: 4 }}>{d.l}</div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive]           = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null); // null=loading, false=none
  const [postingStatus, setPostingStatus]   = useState(null); // null until fetched
  const [resubmitting, setResubmitting]     = useState(false);

  // Fetch company profile on mount so the profile tab shows real data
  useEffect(() => {
    getCompanyProfile()
      .then(res => {
        if (res.status === 200 && res.data) setCompanyProfile(res.data);
        else setCompanyProfile(false);
      })
      .catch(() => setCompanyProfile(false));

    // Fetch server-side posting eligibility — never trust frontend flags alone
    getPostingStatus()
      .then(res => setPostingStatus(res.data))
      .catch(() => setPostingStatus({ eligible: false, verificationStatus: 'PENDING', verified: false, rejectionReason: '' }));
  }, []); // eslint-disable-line

  const verificationStatus = postingStatus?.verificationStatus || companyProfile?.verificationStatus || 'PENDING';
  const isVerified = verificationStatus === 'VERIFIED';
  const canPostJobs = postingStatus?.eligible === true; // backend-confirmed

  const companyName = companyShortName(user?.fullName);
  const companyInitials = initials(companyName);

  function handleLogout() { logout(); navigate('/company/login'); }
  function nav(id) { setActive(id); setSidebarOpen(false); }

  // ── Sidebar ────────────────────────────────────────────────
  const Sidebar = (
    <div className={`cd-sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="cd-sidebar-brand">
        <div className="logo-mark">H</div>
        <div className="brand-name">HireBridge <span>AI</span></div>
      </div>

      <nav className="cd-nav">
        <div className="cd-nav-section">
          <div className="cd-nav-label">Recruitment</div>
          {NAV.slice(0, 9).map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`cd-nav-item${active === id ? ' active' : ''}`} onClick={() => nav(id)}>
              <Icon size={17} />{label}
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          ))}
        </div>
        <div className="cd-nav-section">
          <div className="cd-nav-label">Account</div>
          {NAV.slice(9).map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`cd-nav-item${active === id ? ' active' : ''}`} onClick={() => nav(id)}>
              <Icon size={17} />{label}
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          ))}
          <button className="cd-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogoutIcon size={17} />Logout
          </button>
        </div>
      </nav>

      <div className="cd-sidebar-footer">
        <div className="cd-user-chip">
          <div className="cd-avatar">{companyInitials}</div>
          <div className="cd-user-info">
            <div className="name">{companyName.split(' ')[0]}</div>
            <div className="role">{isVerified ? '✓ Verified' : 'Pending Verification'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Content renders ────────────────────────────────────────
  function renderDashboard() {
    const appData = [
      { l: 'Jul', v: 0 }, { l: 'Aug', v: 0 }, { l: 'Sep', v: 0 },
      { l: 'Oct', v: 0 }, { l: 'Nov', v: 0 }, { l: 'Dec', v: 0 },
    ];
    return (
      <>
        {/* Verification status card — driven by backend verificationStatus */}
        {!isVerified && (() => {
          const statusConfig = {
            PENDING: {
              bg: '#fff7ed', border: '#fed7aa', icon: '⏳', color: '#92400e',
              title: 'Verification Pending',
              desc: 'Your registration has been submitted and is awaiting admin review. You cannot post jobs until verified.',
              action: null,
            },
            UNDER_REVIEW: {
              bg: '#eff6ff', border: '#bfdbfe', icon: '🔍', color: '#1e40af',
              title: 'Under Review',
              desc: 'An admin is currently reviewing your company profile and documents.',
              action: null,
            },
            NEEDS_INFORMATION: {
              bg: '#fff7ed', border: '#fed7aa', icon: '📋', color: '#92400e',
              title: 'Additional Information Required',
              desc: postingStatus?.rejectionReason || companyProfile?.rejectionReason || 'Admin has requested additional information. Please update your profile and resubmit.',
              action: 'resubmit',
            },
            REJECTED: {
              bg: '#fef2f2', border: '#fecaca', icon: '❌', color: '#b91c1c',
              title: 'Verification Rejected',
              desc: postingStatus?.rejectionReason || companyProfile?.rejectionReason || 'Your company verification was rejected.',
              action: null,
            },
            SUSPENDED: {
              bg: '#fef2f2', border: '#fecaca', icon: '⏸', color: '#b91c1c',
              title: 'Company Suspended',
              desc: (postingStatus?.rejectionReason || companyProfile?.rejectionReason || 'Your company has been suspended.') + ' Contact support@hirebridge.ai to resolve this.',
              action: null,
            },
          };
          const cfg = statusConfig[verificationStatus] || statusConfig['PENDING'];
          return (
            <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{cfg.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: cfg.color, marginBottom: '.25rem' }}>{cfg.title}</div>
                <div style={{ fontSize: '.875rem', color: cfg.color, opacity: .9, lineHeight: 1.6 }}>{cfg.desc}</div>
                {verificationStatus !== 'REJECTED' && verificationStatus !== 'SUSPENDED' && (
                  <button onClick={() => nav('profile')} style={{ marginTop: '.625rem', background: 'none', border: 'none', color: cfg.color, fontWeight: 700, cursor: 'pointer', fontSize: '.875rem', padding: 0, textDecoration: 'underline' }}>
                    Complete / Update Profile →
                  </button>
                )}
                {cfg.action === 'resubmit' && (
                  <button
                    disabled={resubmitting}
                    onClick={async () => {
                      setResubmitting(true);
                      try {
                        await resubmitProfile();
                        const { data } = await getPostingStatus();
                        setPostingStatus(data);
                      } catch (e) { alert(e.response?.data?.message || 'Resubmission failed.'); }
                      finally { setResubmitting(false); }
                    }}
                    style={{ marginTop: '.625rem', marginLeft: '1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '.375rem .875rem', fontWeight: 600, fontSize: '.8125rem', cursor: resubmitting ? 'not-allowed' : 'pointer' }}>
                    {resubmitting ? 'Submitting…' : '✓ Resubmit for Review'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg,#064e3b,#059669)', borderRadius: 14, padding: '1.5rem 2rem', marginBottom: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '.8125rem', opacity: .8, marginBottom: '.25rem' }}>Welcome back 👋</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' }}>
              {companyName}
              {isVerified && <span style={{ fontSize: '.875rem', background: 'rgba(255,255,255,.2)', padding: '.2rem .75rem', borderRadius: 999, marginLeft: '.75rem', fontWeight: 600 }}>✓ Verified</span>}
            </h2>
            <p style={{ opacity: .85, fontSize: '.875rem' }}>Here's your recruitment overview.</p>
          </div>
          <button onClick={() => canPostJobs ? nav('post-job') : null}
            disabled={!canPostJobs}
            title={canPostJobs ? 'Post a new job' : 'Verification required to post jobs'}
            style={{ padding: '.75rem 1.5rem', background: canPostJobs ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.3)', color: canPostJobs ? '#fff' : 'rgba(255,255,255,.5)', borderRadius: 10, fontWeight: 700, fontSize: '.9375rem', cursor: canPostJobs ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
            {canPostJobs ? '+ Post a Job' : '🔒 Verification Required'}
          </button>
        </div>

        {/* Stats */}
        <div className="cd-stat-grid">
          <StatCard icon="💼" bg="#f0fdf4" label="Total Jobs Posted"    value="0" sub="No jobs posted yet"    />
          <StatCard icon="📋" bg="#eff6ff" label="Total Applications"   value="0" sub="Post jobs to receive"  />
          <StatCard icon="⭐" bg="#f5f3ff" label="Shortlisted"          value="0" sub="Candidates shortlisted" />
          <StatCard icon="🗓️" bg="#fff7ed" label="Interviews Scheduled" value="0" sub="No interviews yet"     />
        </div>

        <div className="cd-row-3">
          {/* Recent Applications */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="cd-card-title">Recent Applications</div>
              <button className="cd-card-link" onClick={() => nav('applications')}>View All →</button>
            </div>
            <div className="cd-empty">
              <div className="cd-empty-icon">📭</div>
              <p>No applications yet.<br />Post a job to start receiving applications.</p>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Application trend */}
            <div className="cd-card">
              <div className="cd-card-title" style={{ marginBottom: '.875rem' }}>Application Trend</div>
              <MiniBarChart data={appData} color="#059669" />
              <p style={{ fontSize: '.75rem', color: '#9ca3af', marginTop: '.75rem', textAlign: 'center' }}>Post jobs to see trend data</p>
            </div>

            {/* Quick actions */}
            <div className="cd-card">
              <div className="cd-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</div>
              {[
                { icon: '💼', label: 'Post a New Job',        id: 'post-job' },
                { icon: '👥', label: 'Manage Interviews',     id: 'interviews' },
                { icon: '📊', label: 'View Analytics',        id: 'analytics' },
                { icon: '👤', label: 'Update Company Profile', id: 'profile' },
              ].map(({ icon, label, id }) => (
                <button key={id} onClick={() => nav(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '.75rem', width: '100%', padding: '.625rem .875rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, textAlign: 'left', fontSize: '.875rem', fontWeight: 500, color: '#374151', transition: 'background .12s', marginBottom: '.25rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span style={{ fontSize: '1.125rem' }}>{icon}</span>{label}
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '.75rem' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="cd-card" style={{ marginTop: '1rem' }}>
          <div className="cd-card-header">
            <div className="cd-card-title">Active Job Postings</div>
            <button className="cd-card-link" onClick={() => nav('post-job')}>+ Post Job</button>
          </div>
          <div className="cd-empty">
            <div className="cd-empty-icon">📋</div>
            <p>No active jobs.<br />Post your first job to start hiring.</p>
          </div>
        </div>
      </>
    );
  }

  function renderManageJobs() {
    return (
      <div className="cd-card">
        <div className="cd-card-header">
          <div className="cd-card-title">All Job Postings</div>
          <button onClick={() => nav('post-job')} style={{ padding: '.5rem 1.25rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
            + Post New Job
          </button>
        </div>
        <div className="cd-empty">
          <div className="cd-empty-icon">📋</div>
          <p>No job postings yet.<br />Click "Post New Job" to create your first listing.</p>
        </div>
      </div>
    );
  }

  function renderAnalytics() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const current = new Date().getMonth();
    const last6 = Array.from({ length: 6 }, (_, i) => ({ l: months[(current - 5 + i + 12) % 12], v: 0 }));
    return (
      <div>
        <div className="cd-row">
          <div className="cd-card">
            <div className="cd-card-title" style={{ marginBottom: '1rem' }}>Applications Received (Last 6 Months)</div>
            <MiniBarChart data={last6} color="#059669" />
            <p style={{ fontSize: '.8125rem', color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>Post jobs to generate recruitment data</p>
          </div>
          <div className="cd-card">
            <div className="cd-card-title" style={{ marginBottom: '1rem' }}>Hiring Funnel</div>
            {[
              { label: 'Applications',  count: 0, color: '#059669' },
              { label: 'Shortlisted',   count: 0, color: '#7c3aed' },
              { label: 'Interviews',    count: 0, color: '#2563eb' },
              { label: 'Offers Made',   count: 0, color: '#f59e0b' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ marginBottom: '.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.375rem' }}>
                  <span style={{ fontSize: '.875rem', color: '#374151', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '.875rem', fontWeight: 700, color }}>{count}</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: '0%', background: color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '.75rem', color: '#9ca3af', marginTop: '.75rem' }}>Data will populate as you post jobs and receive applications.</p>
          </div>
        </div>
      </div>
    );
  }

  function renderProfile() {
    const cp = companyProfile; // fetched from backend on mount

    if (cp === null) {
      return (
        <div className="cd-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <div className="cd-card">
        <div className="cd-card-header">
          <div className="cd-card-title">Company Profile</div>
          <div style={{ display: 'flex', gap: '.625rem', alignItems: 'center' }}>
            <span className={`cd-badge ${isVerified ? 'verified' : 'unverified'}`}>
              {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
            </span>
            <button onClick={() => navigate('/company/profile-setup')}
              style={{ padding: '.4rem 1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '.8125rem', cursor: 'pointer' }}>
              {cp ? 'Edit Profile' : 'Complete Profile'}
            </button>
          </div>
        </div>

        {cp ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem 2rem', marginBottom: '1.5rem' }}>
              {[
                ['Company Name',   cp.companyName],
                ['Industry',       cp.industry],
                ['Company Size',   cp.companySize],
                ['Website',        cp.website || '—'],
                ['HQ Location',    cp.hqLocation],
                ['Contact Person', cp.contactPerson],
                ['Designation',    cp.designation],
                ['Recruit Email',  cp.recruitmentEmail || '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{l}</div>
                  <div style={{ fontSize: '.9rem', color: '#111827', fontWeight: 500 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {cp.description && (
              <div style={{ borderTop: '1px solid #f0fdf4', paddingTop: '1rem' }}>
                <div style={{ fontSize: '.75rem', color: '#9ca3af', marginBottom: '.375rem' }}>Company Description</div>
                <p style={{ fontSize: '.9rem', color: '#374151', lineHeight: 1.6 }}>{cp.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="cd-empty">
            <div className="cd-empty-icon">🏢</div>
            <p>Your company profile is incomplete.<br />Complete it to get verified and start posting jobs.</p>
          </div>
        )}
      </div>
    );
  }

  function renderContent() {
    switch (active) {
      case 'dashboard':    return renderDashboard();
      case 'post-job':     return <PostJob onSuccess={() => nav('manage-jobs')} />;
      case 'manage-jobs':  return renderManageJobs();
      case 'interviews':
      case 'slots':
      case 'attendance':   return <InterviewManagement />;
      case 'analytics':    return renderAnalytics();
      case 'profile':      return renderProfile();
      case 'applications': return renderEmpty('📋','No Applications Yet','Post jobs to start receiving applications from students.');
      case 'shortlisted':  return renderEmpty('⭐','No Shortlisted Candidates','Shortlist candidates from received applications.');
      case 'notifications':return renderEmpty('🔔','No New Notifications','Notifications will appear here.');
      case 'settings':     return renderEmpty('⚙️','Settings','Account and notification settings coming soon.');
      default:             return renderDashboard();
    }
  }

  function renderEmpty(icon, title, desc) {
    return (
      <div className="cd-card">
        <div className="cd-empty">
          <div className="cd-empty-icon">{icon}</div>
          <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '.5rem' }}>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-layout">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 39 }} />
      )}

      {Sidebar}

      <div className="cd-main">
        <div className="cd-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button id="cd-menu-toggle" className="cd-notif-btn" onClick={() => setSidebarOpen(v => !v)}>
              <MenuIcon size={20} />
            </button>
            <span className="cd-topbar-title">{PAGE_TITLES[active] ?? 'Dashboard'}</span>
          </div>
          <div className="cd-topbar-actions">
            {!isVerified && (
              <span style={{ fontSize: '.75rem', background: '#fff7ed', color: '#92400e', padding: '.25rem .75rem', borderRadius: 999, fontWeight: 600, border: '1px solid #fed7aa' }}>
                ⏳ Pending Verification
              </span>
            )}
            <button className="cd-notif-btn" onClick={() => nav('notifications')}>
              <BellIcon size={20} />
              <span className="cd-notif-dot" />
            </button>
            <div className="cd-avatar" style={{ cursor: 'pointer' }} onClick={() => nav('profile')} title={companyName}>
              {companyInitials}
            </div>
          </div>
        </div>

        <div className="cd-content">
          {renderContent()}
        </div>
      </div>

      <style>{`
        #cd-menu-toggle { display: none; }
        @media (max-width: 768px) {
          #cd-menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, bg, label, value, sub }) {
  return (
    <div className="cd-stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
      <div className="icon-wrap" style={{ background: bg, fontSize: '1.375rem' }}>{icon}</div>
    </div>
  );
}
