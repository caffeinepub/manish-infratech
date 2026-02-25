import React, { useState } from 'react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface SimpleLoginScreenProps {
  onLogin: () => void;
}

export default function SimpleLoginScreen({ onLogin }: SimpleLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSimpleAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = login(username.trim(), password.trim());
    setLoading(false);
    if (success) {
      onLogin();
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 40%, #1c1c2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Branding Block */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* MI Logo */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '16px',
            background: '#c0392b',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(192,57,43,0.45)',
            marginBottom: '18px',
          }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '30px', letterSpacing: '-1px' }}>MI</span>
          </div>

          <div style={{ color: 'white', fontWeight: 900, fontSize: '26px', letterSpacing: '3px', lineHeight: 1.1 }}>
            MANISH INFRATECH
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginTop: '6px', letterSpacing: '0.5px' }}>
            Billing &amp; Invoice Management
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Card Header Strip */}
          <div style={{
            background: '#c0392b',
            padding: '16px 32px',
            textAlign: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Sign In to Your Account
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: '32px 32px 28px' }}>
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #e0e0e0', borderRadius: '8px',
                    fontSize: '14px', color: '#1a1a1a', background: '#fafafa',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#c0392b')}
                  onBlur={e => (e.target.style.borderColor = '#e0e0e0')}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
                }}>
                  Password / PIN
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #e0e0e0', borderRadius: '8px',
                    fontSize: '14px', color: '#1a1a1a', background: '#fafafa',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#c0392b')}
                  onBlur={e => (e.target.style.borderColor = '#e0e0e0')}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#fff0f0', border: '1.5px solid #fca5a5',
                  borderRadius: '8px', padding: '11px 14px',
                  fontSize: '13px', color: '#c0392b', fontWeight: 600,
                  marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#e57373' : '#c0392b',
                  color: 'white', fontWeight: 800, fontSize: '15px',
                  border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '1px', textTransform: 'uppercase',
                  boxShadow: '0 4px 14px rgba(192,57,43,0.35)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#a93226'); }}
                onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#c0392b'); }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          Secure access · Data stored on Internet Computer
        </div>
      </div>
    </div>
  );
}
