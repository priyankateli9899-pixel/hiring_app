import { useState } from 'react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  autoComplete,
  accent = '#2563eb',
}) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPwd ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          style={{
            ...styles.input,
            borderColor: error ? '#ef4444' : '#d1d5db',
            paddingRight: isPassword ? '2.75rem' : '0.875rem',
          }}
          onFocus={(e) => (e.target.style.borderColor = accent)}
          onBlur={(e)  => (e.target.style.borderColor = error ? '#ef4444' : '#d1d5db')}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={styles.eyeBtn}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

const styles = {
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.375rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.9375rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    background: '#fff',
    transition: 'border-color .15s',
    color: '#111827',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.625rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '0.25rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  errorText: {
    marginTop: '0.25rem',
    fontSize: '0.8125rem',
    color: '#ef4444',
  },
};

function EyeIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
