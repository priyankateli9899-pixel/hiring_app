import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const register = (payload) => api.post('/auth/register', payload);
export const login    = (payload) => api.post('/auth/login',    payload);

// ── Health ────────────────────────────────────────────────────────────────────
export const health = () => api.get('/health');

// ── Student profile ───────────────────────────────────────────────────────────
export const getStudentProfile    = ()        => api.get('/student/profile');
export const createStudentProfile = (payload) => api.post('/student/profile', payload);
export const updateStudentProfile = (payload) => api.put('/student/profile',  payload);

// ── Company profile (backend: /api/recruiter/**) ──────────────────────────────
export const getCompanyProfile    = ()        => api.get('/recruiter/profile');
export const createCompanyProfile = (payload) => api.post('/recruiter/profile', payload);
export const updateCompanyProfile = (payload) => api.put('/recruiter/profile',  payload);

// ── Company job-posting eligibility (server-side check) ──────────────────────
// Returns { eligible, verificationStatus, verified, rejectionReason }
export const getPostingStatus = () => api.get('/recruiter/jobs/posting-status');

// ── Company: resubmit after NEEDS_INFORMATION ─────────────────────────────────
export const resubmitProfile = () => api.post('/recruiter/profile/resubmit');

// ── Admin: company management ─────────────────────────────────────────────────
// status = 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'NEEDS_INFORMATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
export const adminListCompanies = (status = 'ALL') =>
  api.get('/admin/companies', { params: { status } });

export const adminGetCompany = (id) =>
  api.get(`/admin/companies/${id}`);

export const adminCompanyCounts = () =>
  api.get('/admin/companies/counts');

// Verification actions – body: { adminNotes?, reason? }
export const adminStartReview  = (id, body = {}) => api.post(`/admin/companies/${id}/review`,  body);
export const adminApprove      = (id, body = {}) => api.post(`/admin/companies/${id}/approve`, body);
export const adminRequestInfo  = (id, body)      => api.post(`/admin/companies/${id}/request`, body);
export const adminReject       = (id, body)      => api.post(`/admin/companies/${id}/reject`,  body);
export const adminSuspend      = (id, body)      => api.post(`/admin/companies/${id}/suspend`, body);

export default api;
