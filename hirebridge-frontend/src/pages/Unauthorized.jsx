import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,system-ui,sans-serif', background: '#f9fafb' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Access Denied</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', textAlign: 'center', maxWidth: 360 }}>
        You don't have permission to view this page. Please log in with the correct account type.
      </p>
      <Link to="/" style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: '#fff', borderRadius: '10px', fontWeight: 600, fontSize: '1rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
