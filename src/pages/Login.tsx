// src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Molim te upiši email i lozinku.');
      return;
    }

    // 🔹 demo login – kasnije ovdje ide pravi backend
    localStorage.setItem('nexora_email', email);

    navigate('/chat');
  };

  return (
    <div className="app-root theme-light">
      <div className="chat-shell">
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">Prijava</span>
              <span className="mono sub-model">Siguran pristup chatbotu</span>
            </div>
          </div>
        </header>

        <main className="chat-body">
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="modal-form"
              style={{
                maxWidth: 420,
                width: '100%',
                borderRadius: 20,
                padding: 20,
                border: '1px solid rgba(148,163,184,0.6)',
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 18px 40px rgba(15,23,42,0.16)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: 12,
                  fontSize: 18,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Prijava
              </h2>

              <div className="form-group">
                <label className="field-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ti@example.com"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="login-password">
                  Lozinka
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Lozinka"
                />
              </div>

              {error && (
                <div className="form-status form-status-error">
                  {error}
                </div>
              )}

              <div
                className="form-actions"
                style={{ justifyContent: 'space-between', marginTop: 10 }}
              >
                <Link
                  to="/"
                  className="secondary-btn"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ← Natrag
                </Link>

                <button type="submit" className="primary-btn">
                  Prijavi se
                </button>
              </div>

              <p
                className="field-hint"
                style={{ marginTop: 10, textAlign: 'right' }}
              >
                Nemaš račun?{' '}
                <Link to="/register">Registriraj se</Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
