export default function AlertBanner({ type = 'error', message }) {
  if (!message) return null;

  const colours = {
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', icon: '✕' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✓' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', icon: '!' },
  };
  const c = colours[type] ?? colours.error;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.625rem',
      padding: '0.75rem 1rem',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      marginBottom: '1.25rem',
    }}>
      <span style={{
        fontWeight: 700,
        color: c.text,
        minWidth: 18,
        fontSize: '0.9rem',
        marginTop: 1,
      }}>{c.icon}</span>
      <p style={{ fontSize: '0.875rem', color: c.text, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}
