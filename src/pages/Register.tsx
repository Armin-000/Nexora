// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirm) {
      setError('Molim te ispuni sva polja.');
      return;
    }

    if (password !== confirm) {
      setError('Lozinka i potvrda se ne podudaraju.');
      return;
    }

    // 🔹 demo registracija – kasnije ovdje ide pravi backend
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
              <span className="sub-label">Registracija</span>
              <span className="mono sub-model">Kreiraj Nexora račun</span>
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
                Registracija
              </h2>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ti@example.com"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-password">
                  Lozinka
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Lozinka"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-confirm">
                  Potvrda lozinke
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="field-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ponovno lozinka"
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
                  Registriraj se
                </button>
              </div>

              <p
                className="field-hint"
                style={{ marginTop: 10, textAlign: 'right' }}
              >
                Već imaš račun? <Link to="/login">Prijava</Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;
