/**
 * AdminDashboard – HireBridge AI
 *
 * Company data is fetched from the real backend (PostgreSQL via
 * GET /api/admin/companies). No hardcoded company records.
 *
 * Verification actions call the backend and update local state
 * from the returned record – no fake state mutations.
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../../context/AuthContext.jsx';
import {
  HomeIcon, UserIcon, BriefcaseIcon, FileTextIcon, CalendarIcon,
  TrendingUpIcon, BellIcon, SettingsIcon, LogoutIcon, SearchIcon,
  CheckCircleIcon, AlertIcon, MenuIcon, StarIcon, ZapIcon,
} from '../../components/Icons.jsx';
import {
  adminListCompanies, adminCompanyCounts, adminGetCompany,
  adminStartReview, adminApprove, adminRequestInfo,
  adminReject, adminSuspend,
} from '../../api/authApi.js';
import './admin.css';

/* ── Navigation ─────────────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',            icon: HomeIcon },
  { id: 'students',     label: 'Manage Students',      icon: UserIcon },
  { id: 'companies',    label: 'Manage Companies',     icon: BriefcaseIcon },
  { id: 'verify',       label: 'Verify Companies',     icon: CheckCircleIcon },
  { id: 'jobs',         label: 'Manage Job Listings',  icon: BriefcaseIcon },
  { id: 'applications', label: 'Manage Applications',  icon: FileTextIcon },
  { id: 'recruitment',  label: 'Recruitment Mgmt',     icon: ZapIcon },
  { id: 'interviews',   label: 'Interview Monitoring', icon: CalendarIcon },
  { id: 'users',        label: 'User Management',      icon: UserIcon },
  { id: 'analytics',    label: 'Reports & Analytics',  icon: TrendingUpIcon },
  { id: 'notifications',label: 'Notifications',        icon: BellIcon },
  { id: 'settings',     label: 'System Settings',      icon: SettingsIcon },
];
const PAGE_TITLES = {
  dashboard: 'Dashboard Overview', students: 'Manage Students',
  companies: 'Manage Companies',   verify: 'Verify Companies',
  jobs: 'Manage Job Listings',     applications: 'Manage Applications',
  recruitment: 'Recruitment Management', interviews: 'Interview Monitoring',
  users: 'User Management',        analytics: 'Reports & Analytics',
  notifications: 'Notifications',  settings: 'System Settings',
};

/* ── Demo student data (students API not yet implemented) ────────────── */
const DEMO_STUDENTS = [
  { id: 1, name: 'Priya Sharma',  email: 'priya@student.com',  college: 'IIT Delhi',   branch: 'CSE',  cgpa: '9.1', status: 'active',   joinedAt: '2026-10-15' },
  { id: 2, name: 'Rahul Verma',   email: 'rahul@student.com',  college: 'BITS Pilani', branch: 'IT',   cgpa: '8.7', status: 'active',   joinedAt: '2026-10-18' },
  { id: 3, name: 'Ananya Singh',  email: 'ananya@student.com', college: 'NIT Trichy',  branch: 'ECE',  cgpa: '8.3', status: 'active',   joinedAt: '2026-10-20' },
  { id: 4, name: 'Karthik Rajan', email: 'k@student.com',      college: 'VIT',         branch: 'CSE',  cgpa: '7.9', status: 'inactive', joinedAt: '2026-10-22' },
  { id: 5, name: 'Sneha Patel',   email: 'sneha@student.com',  college: 'DAIICT',      branch: 'IT',   cgpa: '8.5', status: 'active',   joinedAt: '2026-10-25' },
];
const BRANCH_STATS = [
  { branch: 'CSE',      students: 420, placed: 310, pct: 74 },
  { branch: 'IT',       students: 280, placed: 195, pct: 70 },
  { branch: 'ECE',      students: 190, placed: 120, pct: 63 },
  { branch: 'EEE',      students: 140, placed:  82, pct: 59 },
  { branch: 'ME',       students: 110, placed:  55, pct: 50 },
  { branch: 'AI/ML',    students:  95, placed:  78, pct: 82 },
  { branch: 'Data Sci', students:  75, placed:  65, pct: 87 },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function statusClass(s) {
  const map = {
    PENDING:          'pending',
    UNDER_REVIEW:     'pending',
    NEEDS_INFORMATION:'pending',
    VERIFIED:         'verified',
    REJECTED:         'rejected',
    SUSPENDED:        'inactive',
  };
  return map[s] || 'pending';
}
function statusLabel(s) {
  const map = {
    PENDING:          'Pending',
    UNDER_REVIEW:     'Under Review',
    NEEDS_INFORMATION:'Needs Info',
    VERIFIED:         'Verified',
    REJECTED:         'Rejected',
    SUSPENDED:        'Suspended',
  };
  return map[s] || s;
}
function coInitials(name) {
  return (name || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatCard({ icon, bg, label, value, delta, deltaType = 'neu' }) {
  return (
    <div className="ad-stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {delta && <div className={`stat-delta ${deltaType}`}>{delta}</div>}
      </div>
      <div className="icon-wrap" style={{ background: bg, fontSize: '1.375rem' }}>{icon}</div>
    </div>
  );
}
function BarChart({ data, color = '#7c3aed', height = 72 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ width: '100%', background: color + '20', borderRadius: '4px 4px 0 0', height: `${(d.v / max) * height}px`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, height: `${(d.v / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '.65rem', color: '#9ca3af', marginTop: 4 }}>{d.l}</div>)}
      </div>
    </div>
  );
}
function DonutChart({ pct, color = '#7c3aed', size = 80 }) {
  const r = 32, c = 2 * Math.PI * r;
  return (
    <div className="ad-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#ede9fe" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="ad-donut-val">
        <span style={{ fontSize: '.9375rem', fontWeight: 800, color: '#111827' }}>{pct}%</span>
      </div>
    </div>
  );
}
function Pagination({ total, perPage, page, setPage }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="ad-pagination">
      <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
      {Array.from({ length: pages }, (_, i) => (
        <button key={i} className={`ad-page-btn${page === i + 1 ? ' active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
      ))}
      <button className="ad-page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Verification Detail Modal (full company profile + actions)
───────────────────────────────────────────────────────────────────── */
function VerificationModal({ company, onClose, onAction }) {
  const [actionLoading, setActionLoading] = useState('');
  const [notes, setNotes]   = useState('');
  const [reason, setReason] = useState('');
  const [showReject, setShowReject]   = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [apiErr, setApiErr] = useState('');

  async function act(fn, label, body) {
    setActionLoading(label); setApiErr('');
    try {
      const { data } = await fn(company.id, body);
      onAction(data);
      onClose();
    } catch (e) {
      setApiErr(e.response?.data?.message || 'Action failed. Please try again.');
    } finally { setActionLoading(''); }
  }

  const cp = company;
  const checklist = [
    { label: 'Legal / business name',         value: cp.companyName },
    { label: 'Official email',                 value: cp.userEmail || cp.recruitmentEmail },
    { label: 'Website / online presence',      value: cp.website },
    { label: 'Registered business address',    value: cp.hqLocation },
    { label: 'Authorized representative',      value: cp.contactPerson && cp.designation ? `${cp.contactPerson} (${cp.designation})` : null },
    { label: 'Contact number',                 value: cp.contactPhone },
    { label: 'Company description & industry', value: cp.description },
    { label: 'LinkedIn company URL',           value: cp.linkedinUrl },
  ];

  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className="ad-modal-title" style={{ margin: 0 }}>🏢 Company Verification — {cp.companyName || cp.userFullName}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9ca3af' }}>✕</button>
        </div>

        {/* Company identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#faf9ff', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
            {coInitials(cp.companyName || cp.userFullName)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{cp.companyName || cp.userFullName}</div>
            <div style={{ fontSize: '.875rem', color: '#6b7280' }}>{cp.userEmail}</div>
            <div style={{ marginTop: '.375rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <span className="ad-chip">{cp.industry || '—'}</span>
              <span className="ad-chip">{cp.companySize || '—'}</span>
              <span className={`ad-badge ${statusClass(cp.verificationStatus)}`}>{statusLabel(cp.verificationStatus)}</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '.8125rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.75rem' }}>Verification Checklist</div>
          {checklist.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '.5rem 0', borderBottom: '1px solid #f5f3ff' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '.1rem' }}>{value ? '✅' : '⚠️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.8125rem', color: '#6b7280' }}>{label}</div>
                <div style={{ fontSize: '.875rem', color: value ? '#111827' : '#ef4444', fontWeight: value ? 500 : 600 }}>
                  {value || 'Not provided'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin notes */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.375rem' }}>Admin Notes (internal)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Internal notes not shown to the company…"
            style={{ width: '100%', padding: '.625rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
        </div>

        {/* Rejection/suspension reason input */}
        {(showReject || showRequest || showSuspend) && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '.8125rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '.375rem' }}>
              {showReject ? 'Rejection Reason *' : showSuspend ? 'Suspension Reason *' : 'Missing Information / Required Corrections *'}
            </label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder={showReject ? 'Explain why this company is rejected…' : showSuspend ? 'Explain why this company is suspended…' : 'Specify what information or documents are needed…'}
              style={{ width: '100%', padding: '.625rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
        )}

        {apiErr && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: '#b91c1c' }}>
            ✕ {apiErr}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
          {cp.verificationStatus !== 'VERIFIED' && cp.verificationStatus !== 'REJECTED' && (
            <>
              {cp.verificationStatus === 'PENDING' && (
                <button className="ad-btn outline" disabled={!!actionLoading}
                  onClick={() => act(adminStartReview, 'review', { adminNotes: notes })}>
                  {actionLoading === 'review' ? 'Starting…' : '🔍 Start Review'}
                </button>
              )}
              <button className="ad-btn success" disabled={!!actionLoading}
                onClick={() => act(adminApprove, 'approve', { adminNotes: notes })}>
                {actionLoading === 'approve' ? 'Approving…' : '✓ Approve & Verify'}
              </button>
              {!showRequest ? (
                <button className="ad-btn outline" onClick={() => { setShowRequest(true); setShowReject(false); setShowSuspend(false); }}>
                  📋 Request Info
                </button>
              ) : (
                <button className="ad-btn outline" disabled={!reason.trim() || !!actionLoading}
                  onClick={() => act(adminRequestInfo, 'request', { adminNotes: notes, reason })}>
                  {actionLoading === 'request' ? 'Sending…' : '📋 Send Request'}
                </button>
              )}
              {!showReject ? (
                <button className="ad-btn danger" onClick={() => { setShowReject(true); setShowRequest(false); setShowSuspend(false); }}>
                  ✗ Reject
                </button>
              ) : (
                <button className="ad-btn danger" disabled={!reason.trim() || !!actionLoading}
                  onClick={() => act(adminReject, 'reject', { adminNotes: notes, reason })}>
                  {actionLoading === 'reject' ? 'Rejecting…' : '✗ Confirm Reject'}
                </button>
              )}
            </>
          )}
          {cp.verificationStatus === 'VERIFIED' && (
            <>
              {!showSuspend ? (
                <button className="ad-btn danger" onClick={() => { setShowSuspend(true); setShowReject(false); setShowRequest(false); }}>
                  ⏸ Suspend Company
                </button>
              ) : (
                <button className="ad-btn danger" disabled={!reason.trim() || !!actionLoading}
                  onClick={() => act(adminSuspend, 'suspend', { adminNotes: notes, reason })}>
                  {actionLoading === 'suspend' ? 'Suspending…' : '⏸ Confirm Suspend'}
                </button>
              )}
            </>
          )}
          {(showReject || showRequest || showSuspend) && (
            <button className="ad-btn outline" onClick={() => { setShowReject(false); setShowRequest(false); setShowSuspend(false); setReason(''); }}>
              Cancel
            </button>
          )}
        </div>

        {/* Prior rejection reason (read-only display) */}
        {cp.rejectionReason && (
          <div style={{ marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', fontSize: '.875rem', color: '#b91c1c' }}>
            <strong>Reason on record:</strong> {cp.rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main AdminDashboard component
═══════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [active, setActive]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Company data – live from PostgreSQL ──────────────────────────────
  const [companies, setCompanies]       = useState([]);
  const [coLoading, setCoLoading]       = useState(false);
  const [coError, setCoError]           = useState('');
  const [coFilter, setCoFilter]         = useState('ALL');
  const [coSearch, setCoSearch]         = useState('');
  const [coPage, setCoPage]             = useState(1);
  const [counts, setCounts]             = useState({});
  const CO_PER = 8;

  // ── Student data (still demo until student admin API is built) ───────
  const [students, setStudents]   = useState(DEMO_STUDENTS);
  const [stuSearch, setStuSearch] = useState('');
  const [stuFilter, setStuFilter] = useState('all');
  const [stuPage, setStuPage]     = useState(1);
  const STU_PER = 5;

  // ── Modal ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);

  const adminName     = user?.fullName || 'Admin';
  const adminInitials = adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // ── Fetch companies from backend ─────────────────────────────────────
  const fetchCompanies = useCallback(async (status = 'ALL') => {
    setCoLoading(true); setCoError('');
    try {
      const { data } = await adminListCompanies(status);
      setCompanies(data);
    } catch (e) {
      setCoError(e.response?.data?.message || 'Failed to load companies.');
    } finally { setCoLoading(false); }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await adminCompanyCounts();
      setCounts(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchCompanies('ALL');
    fetchCounts();
  }, []); // eslint-disable-line

  // Re-fetch when filter changes
  useEffect(() => {
    fetchCompanies(coFilter);
    setCoPage(1);
  }, [coFilter]); // eslint-disable-line

  // ── After a verification action – update the company in local state ──
  function handleVerificationAction(updatedCompany) {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    fetchCounts(); // refresh sidebar counts
  }

  // ── Student helpers ──────────────────────────────────────────────────
  const filteredStudents = useMemo(() =>
    students
      .filter(s => stuFilter === 'all' || s.status === stuFilter)
      .filter(s => !stuSearch || s.name.toLowerCase().includes(stuSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(stuSearch.toLowerCase())),
  [students, stuSearch, stuFilter]);

  // ── Company filtered view ────────────────────────────────────────────
  const filteredCompanies = useMemo(() =>
    companies.filter(c =>
      !coSearch || (c.companyName || '').toLowerCase().includes(coSearch.toLowerCase()) ||
      (c.userEmail || '').toLowerCase().includes(coSearch.toLowerCase())
    ), [companies, coSearch]);

  function toggleStudentStatus(id) {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  }

  function handleLogout() { logout(); navigate('/admin/login'); }
  function nav(id) { setActive(id); setSidebarOpen(false); }

  // ── Sidebar ──────────────────────────────────────────────────────────
  const pendingCount = counts['PENDING'] || 0;
  const Sidebar = (
    <div className={`ad-sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="ad-sidebar-brand">
        <div className="logo-mark">H</div>
        <div className="brand-name">HireBridge <span>AI</span></div>
      </div>
      <nav className="ad-nav">
        <div className="ad-nav-section">
          <div className="ad-nav-label">Main Menu</div>
          {NAV.slice(0, 9).map(({ id, label, icon: Icon }) => {
            const badge = id === 'verify' ? pendingCount : 0;
            return (
              <button key={id} className={`ad-nav-item${active === id ? ' active' : ''}`} onClick={() => nav(id)}>
                <Icon size={16} />{label}
                {badge > 0 && <span className="badge">{badge}</span>}
              </button>
            );
          })}
        </div>
        <div className="ad-nav-section">
          <div className="ad-nav-label">System</div>
          {NAV.slice(9).map(({ id, label, icon: Icon }) => (
            <button key={id} className={`ad-nav-item${active === id ? ' active' : ''}`} onClick={() => nav(id)}>
              <Icon size={16} />{label}
            </button>
          ))}
          <button className="ad-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogoutIcon size={16} />Logout
          </button>
        </div>
      </nav>
      <div className="ad-sidebar-footer">
        <div className="ad-user-chip">
          <div className="ad-avatar">{adminInitials}</div>
          <div className="ad-user-info">
            <div className="name">{adminName.split(' ')[0]}</div>
            <div className="role">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Dashboard Overview ──────────────────────────────────────────── */
  function renderDashboard() {
    const totalStudents  = students.length;
    const totalCompanies = counts['TOTAL'] || companies.length;
    const verified       = counts['VERIFIED'] || 0;
    const pending        = counts['PENDING']  || 0;

    const months = ['May','Jun','Jul','Aug','Sep','Oct'];
    const stuGrowth = months.map((l, i) => ({ l, v: [20,35,48,62,78,totalStudents][i] }));
    const coGrowth  = months.map((l, i) => ({ l, v: Math.max(0, [1,2,3,5,7, totalCompanies][i]) }));

    return (
      <>
        <div className="ad-stat-grid">
          <StatCard icon="🎓" bg="#eff6ff" label="Total Students"      value={totalStudents.toString()}  delta={`${students.filter(s => s.status === 'active').length} active`}  deltaType="up" />
          <StatCard icon="🏢" bg="#f5f3ff" label="Total Companies"     value={totalCompanies.toString()} delta={`${verified} verified`}                                             deltaType="up" />
          <StatCard icon="✅" bg="#f0fdf4" label="Verified Companies"  value={verified.toString()}       delta={`${pending} pending`}                                               deltaType={pending > 0 ? 'down' : 'neu'} />
          <StatCard icon="⏳" bg="#fff7ed" label="Pending Verification" value={pending.toString()}        delta="Awaiting review"                                                    deltaType="neu" />
          <StatCard icon="💼" bg="#f5f3ff" label="Total Job Listings"  value="0"  delta="Jobs module coming soon" deltaType="neu" />
          <StatCard icon="📋" bg="#fdf2f8" label="Total Applications"  value="0"  delta="Data available after job postings" deltaType="neu" />
        </div>

        <div className="ad-row-3">
          <div>
            <div className="ad-row">
              <div className="ad-card">
                <div className="ad-card-header"><div className="ad-card-title">Student Growth</div><span className="ad-chip purple">6 months</span></div>
                <BarChart data={stuGrowth} color="#7c3aed" height={80} />
              </div>
              <div className="ad-card">
                <div className="ad-card-header"><div className="ad-card-title">Company Growth</div><span className="ad-chip green">6 months</span></div>
                <BarChart data={coGrowth} color="#059669" height={80} />
              </div>
            </div>
            <div className="ad-card">
              <div className="ad-card-header"><div className="ad-card-title">User Distribution</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <DonutChart pct={totalCompanies ? Math.round(totalStudents / (totalStudents + totalCompanies) * 100) : 100} color="#7c3aed" size={100} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {[['Students', totalStudents, '#7c3aed'], ['Companies', totalCompanies, '#059669']].map(([l, n, c]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: '.875rem', color: '#374151' }}>{l}</span>
                      <span style={{ fontWeight: 700, color: '#111827', marginLeft: '.375rem' }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pending verifications quick-list */}
            {companies.filter(c => c.verificationStatus === 'PENDING').length > 0 && (
              <div className="ad-card">
                <div className="ad-card-header">
                  <div className="ad-card-title">⏳ Pending Verifications</div>
                  <button className="ad-card-link" onClick={() => nav('verify')}>Review →</button>
                </div>
                {companies.filter(c => c.verificationStatus === 'PENDING').slice(0, 4).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem 0', borderBottom: '1px solid #f5f3ff' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#111827' }}>{c.companyName || c.userFullName}</div>
                      <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{c.industry || '—'}</div>
                    </div>
                    <button className="ad-btn primary sm" onClick={() => setModal({ type: 'verify', data: c })}>Review</button>
                  </div>
                ))}
              </div>
            )}
            <div className="ad-card">
              <div className="ad-card-title" style={{ marginBottom: '1rem' }}>Recent Activity</div>
              {companies.slice(0, 5).map((c, i) => (
                <div key={i} className="ad-activity-item">
                  <div className="ad-activity-dot" style={{ background: '#f5f3ff' }}>🏢</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.8125rem', color: '#374151', lineHeight: 1.5 }}>
                      {c.companyName || c.userFullName} registered ({statusLabel(c.verificationStatus)})
                    </div>
                    <div className="ad-activity-time">{fmtDate(c.createdAt)}</div>
                  </div>
                </div>
              ))}
              {companies.length === 0 && <div style={{ fontSize: '.875rem', color: '#9ca3af' }}>No company registrations yet.</div>}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Manage Companies (searchable table) ─────────────────────────── */
  function renderCompanies() {
    const paged = filteredCompanies.slice((coPage - 1) * CO_PER, coPage * CO_PER);
    return (
      <div className="ad-card">
        <div className="ad-card-header" style={{ flexWrap: 'wrap', gap: '.75rem' }}>
          <div className="ad-card-title">All Companies ({filteredCompanies.length})</div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="ad-search-wrap" style={{ maxWidth: 280 }}>
              <SearchIcon size={15} />
              <input className="ad-search-input" placeholder="Search company, email…" value={coSearch}
                onChange={e => { setCoSearch(e.target.value); setCoPage(1); }} />
            </div>
            <select className="ad-filter-select" value={coFilter}
              onChange={e => { setCoFilter(e.target.value); setCoSearch(''); }}>
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="NEEDS_INFORMATION">Needs Information</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button className="ad-btn outline sm" onClick={() => { fetchCompanies(coFilter); fetchCounts(); }}>↻ Refresh</button>
          </div>
        </div>

        {coLoading && <div style={{ textAlign: 'center', padding: '2rem' }}><div className="db-spinner" /></div>}
        {coError  && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.75rem 1rem', fontSize: '.875rem', color: '#b91c1c', marginBottom: '1rem' }}>✕ {coError}</div>}

        {!coLoading && (
          <>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr><th>#</th><th>Company</th><th>Email</th><th>Industry</th><th>Size</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {paged.length ? paged.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: '#9ca3af' }}>{(coPage - 1) * CO_PER + i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.companyName || c.userFullName}</td>
                      <td style={{ color: '#6b7280' }}>{c.userEmail}</td>
                      <td><span className="ad-chip">{c.industry || '—'}</span></td>
                      <td style={{ fontSize: '.8125rem' }}>{c.companySize || '—'}</td>
                      <td><span className={`ad-badge ${statusClass(c.verificationStatus)}`}>{statusLabel(c.verificationStatus)}</span></td>
                      <td style={{ color: '#9ca3af', fontSize: '.8125rem' }}>{fmtDate(c.createdAt)}</td>
                      <td>
                        <button className="ad-btn outline sm" onClick={() => setModal({ type: 'verify', data: c })}>View</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No companies found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination total={filteredCompanies.length} perPage={CO_PER} page={coPage} setPage={setCoPage} />
          </>
        )}
      </div>
    );
  }

  /* ── Verify Companies (pending/needs-info queue) ─────────────────── */
  function renderVerify() {
    const queue = companies.filter(c =>
      c.verificationStatus === 'PENDING' ||
      c.verificationStatus === 'UNDER_REVIEW' ||
      c.verificationStatus === 'NEEDS_INFORMATION'
    );

    if (coLoading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="db-spinner" /></div>;
    if (coError)   return <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '1rem', color: '#b91c1c' }}>✕ {coError}</div>;
    if (queue.length === 0) {
      return (
        <div className="ad-card">
          <div className="ad-empty"><div className="ad-empty-icon">✅</div><p>No pending verifications. All queued companies have been processed.</p></div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[['PENDING', 'Pending'], ['UNDER_REVIEW', 'Under Review'], ['NEEDS_INFORMATION', 'Needs Info']].map(([s, l]) => {
            const n = queue.filter(c => c.verificationStatus === s).length;
            return n > 0 && (
              <span key={s} className={`ad-badge ${statusClass(s)}`}>{l}: {n}</span>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {queue.map(c => (
            <div key={c.id} className="ad-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                      {coInitials(c.companyName || c.userFullName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{c.companyName || c.userFullName}</div>
                      <div style={{ fontSize: '.875rem', color: '#6b7280' }}>{c.userEmail}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                    <span className="ad-chip">{c.industry || '—'}</span>
                    <span className="ad-chip">{c.companySize || '—'}</span>
                    <span className={`ad-badge ${statusClass(c.verificationStatus)}`}>{statusLabel(c.verificationStatus)}</span>
                    {!c.profileCompleted && <span className="ad-badge inactive">Profile Incomplete</span>}
                  </div>
                  <div style={{ fontSize: '.8125rem', color: '#9ca3af' }}>Registered: {fmtDate(c.createdAt)}</div>
                  {c.rejectionReason && (
                    <div style={{ marginTop: '.5rem', fontSize: '.8125rem', color: '#b45309', background: '#fff7ed', padding: '.375rem .625rem', borderRadius: 6 }}>
                      📋 On record: {c.rejectionReason}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
                  <button className="ad-btn primary" onClick={() => setModal({ type: 'verify', data: c })}>
                    🔍 Review Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Manage Students ─────────────────────────────────────────────── */
  function renderStudents() {
    const paged = filteredStudents.slice((stuPage - 1) * STU_PER, stuPage * STU_PER);
    return (
      <div className="ad-card">
        <div className="ad-card-header" style={{ flexWrap: 'wrap', gap: '.75rem' }}>
          <div className="ad-card-title">All Students ({filteredStudents.length})</div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="ad-search-wrap" style={{ maxWidth: 280 }}>
              <SearchIcon size={15} />
              <input className="ad-search-input" placeholder="Search name, email, college…" value={stuSearch}
                onChange={e => { setStuSearch(e.target.value); setStuPage(1); }} />
            </div>
            <select className="ad-filter-select" value={stuFilter} onChange={e => { setStuFilter(e.target.value); setStuPage(1); }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>College</th><th>Branch</th><th>CGPA</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.length ? paged.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: '#9ca3af' }}>{(stuPage - 1) * STU_PER + i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.75rem', flexShrink: 0 }}>
                        {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{s.email}</td>
                  <td>{s.college}</td>
                  <td><span className="ad-chip">{s.branch}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.cgpa}</td>
                  <td><span className={`ad-badge ${s.status}`}>{s.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: '.8125rem' }}>{s.joinedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.375rem' }}>
                      <button className="ad-btn outline sm" onClick={() => setModal({ type: 'student', data: s })}>View</button>
                      <button className={`ad-btn sm ${s.status === 'active' ? 'danger' : 'success'}`} onClick={() => toggleStudentStatus(s.id)}>
                        {s.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No students match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filteredStudents.length} perPage={STU_PER} page={stuPage} setPage={setStuPage} />
      </div>
    );
  }

  /* ── User Management ─────────────────────────────────────────────── */
  function renderUsers() {
    const allUsers = [
      ...students.map(s => ({ id: 's' + s.id, name: s.name, email: s.email, role: 'STUDENT', status: s.status, joinedAt: s.joinedAt })),
      ...companies.map(c => ({ id: 'c' + c.id, name: c.companyName || c.userFullName, email: c.userEmail, role: 'RECRUITER', status: c.verificationStatus === 'VERIFIED' ? 'active' : 'pending', joinedAt: fmtDate(c.createdAt) })),
    ];
    return (
      <div className="ad-card">
        <div className="ad-card-header">
          <div className="ad-card-title">All Users ({allUsers.length})</div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <span className="ad-chip blue">{students.length} Students</span>
            <span className="ad-chip purple">{companies.length} Companies</span>
          </div>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {allUsers.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: '#6b7280' }}>{u.email}</td>
                  <td><span className={`ad-badge ${u.role.toLowerCase()}`}>{u.role === 'STUDENT' ? 'Student' : 'Company'}</span></td>
                  <td><span className={`ad-badge ${u.status}`}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: '.8125rem' }}>{u.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── Reports & Analytics ─────────────────────────────────────────── */
  function renderAnalytics() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'];
    const stuData = months.map((l, i) => ({ l, v: [5,8,12,18,25,34,45,58,72,94][i] }));
    const coData  = months.map((l, i) => ({ l, v: [1,2,3,4,5,6,7,8,9, companies.length || 12][i] }));

    function downloadCSV() {
      const rows = [['Branch','Total Students','Placed','Placement %'], ...BRANCH_STATS.map(b => [b.branch, b.students, b.placed, b.pct + '%'])];
      const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'branch_placement_report.csv'; a.click();
      URL.revokeObjectURL(url);
    }

    return (
      <div>
        <div className="ad-row" style={{ marginBottom: '1rem' }}>
          <div className="ad-card">
            <div className="ad-card-header"><div className="ad-card-title">Student Registrations</div></div>
            <BarChart data={stuData} color="#7c3aed" height={90} />
          </div>
          <div className="ad-card">
            <div className="ad-card-header"><div className="ad-card-title">Company Registrations</div></div>
            <BarChart data={coData} color="#059669" height={90} />
          </div>
        </div>
        <div className="ad-card">
          <div className="ad-card-header">
            <div className="ad-card-title">Branch-wise Placement Report</div>
            <button className="ad-btn outline" onClick={downloadCSV}>⬇ Download CSV</button>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Branch</th><th>Total Students</th><th>Placed</th><th>Placement %</th><th>Rate</th></tr></thead>
              <tbody>
                {BRANCH_STATS.map(b => (
                  <tr key={b.branch}>
                    <td style={{ fontWeight: 600 }}>{b.branch}</td>
                    <td>{b.students}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{b.placed}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                        <div style={{ width: 80, height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                          <div style={{ height: '100%', width: `${b.pct}%`, background: b.pct >= 75 ? '#059669' : b.pct >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '.875rem' }}>{b.pct}%</span>
                      </div>
                    </td>
                    <td><span className={`ad-badge ${b.pct >= 75 ? 'active' : b.pct >= 60 ? 'pending' : 'inactive'}`}>{b.pct >= 75 ? 'Excellent' : b.pct >= 60 ? 'Good' : 'Needs Work'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderEmpty(icon, title, desc) {
    return <div className="ad-card"><div className="ad-empty"><div className="ad-empty-icon">{icon}</div><h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '.5rem' }}>{title}</h3><p>{desc}</p></div></div>;
  }

  function renderContent() {
    switch (active) {
      case 'dashboard':    return renderDashboard();
      case 'students':     return renderStudents();
      case 'companies':    return renderCompanies();
      case 'verify':       return renderVerify();
      case 'users':        return renderUsers();
      case 'analytics':    return renderAnalytics();
      case 'recruitment':  return renderEmpty('🚀', 'Recruitment Management', 'Recruitment drive monitoring will be available when companies start posting jobs.');
      case 'interviews':   return renderEmpty('🗓️', 'Interview Monitoring', 'Interview slot monitoring will be available once recruitment drives begin.');
      case 'jobs':         return renderEmpty('💼', 'Job Listings', 'Job listing management will be available once companies post jobs.');
      case 'applications': return renderEmpty('📋', 'Applications', 'Application management will be available once students start applying.');
      case 'notifications':return renderEmpty('🔔', 'Notifications', 'Notifications will appear here.');
      case 'settings':     return renderEmpty('⚙️', 'System Settings', 'Platform configuration settings will be available here.');
      default:             return renderDashboard();
    }
  }

  /* ── Student modal ─────────────────────────────────────────────── */
  function renderStudentModal(data) {
    return (
      <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
        <div className="ad-modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div className="ad-modal-title" style={{ margin: 0 }}>🎓 Student Profile</div>
            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9ca3af' }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#faf9ff', borderRadius: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.125rem' }}>
              {data.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#111827' }}>{data.name}</div>
              <div style={{ fontSize: '.875rem', color: '#6b7280' }}>{data.email}</div>
              <span className={`ad-badge ${data.status}`} style={{ marginTop: '.375rem', display: 'inline-block' }}>{data.status}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem 2rem' }}>
            {[['College', data.college],['Branch', data.branch],['CGPA', data.cgpa],['Joined', data.joinedAt]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{l}</div><div style={{ fontWeight: 600, color: '#111827' }}>{v}</div></div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.625rem' }}>
            <button className={`ad-btn ${data.status === 'active' ? 'danger' : 'success'}`} style={{ flex: 1 }}
              onClick={() => { toggleStudentStatus(data.id); setModal(null); }}>
              {data.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-layout">
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 39 }} />}

      {Sidebar}

      <div className="ad-main">
        <div className="ad-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button id="ad-menu-toggle" className="ad-notif-btn" onClick={() => setSidebarOpen(v => !v)}><MenuIcon size={20} /></button>
            <span className="ad-topbar-title">{PAGE_TITLES[active] ?? 'Dashboard'}</span>
          </div>
          <div className="ad-topbar-actions">
            <button className="ad-notif-btn" onClick={() => nav('notifications')}><BellIcon size={20} /><span className="ad-notif-dot" /></button>
            <div className="ad-avatar" style={{ cursor: 'default' }}>{adminInitials}</div>
          </div>
        </div>
        <div className="ad-content">{renderContent()}</div>
      </div>

      {/* Modals */}
      {modal?.type === 'verify'  && <VerificationModal company={modal.data} onClose={() => setModal(null)} onAction={handleVerificationAction} />}
      {modal?.type === 'student' && renderStudentModal(modal.data)}

      <style>{`
        #ad-menu-toggle { display: none; }
        @media (max-width: 768px) { #ad-menu-toggle { display: flex !important; } }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #ede9fe; border-top-color: #7c3aed; border-radius: 50%; animation: spin .7s linear infinite; margin: 2rem auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
