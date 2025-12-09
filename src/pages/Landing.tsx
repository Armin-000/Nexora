// src/pages/Landing.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="app-root theme-light">
      <div className="chat-shell">
        {/* Gornji bar (isti stil kao u App.tsx) */}
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">AI Chatbot</span>
              <span className="mono sub-model">Local • Private • Fast</span>
            </div>
          </div>
        </header>

        {/* Tijelo – centrirani „modal” */}
        <main className="chat-body">
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                maxWidth: 780,
                width: '100%',
                borderRadius: 24,
                padding: 24,
                border: '1px solid rgba(148,163,184,0.55)',
                background:
                  'linear-gradient(145deg, rgba(249,250,251,0.98), rgba(229,231,235,0.96))',
                boxShadow:
                  '0 18px 45px rgba(15,23,42,0.22), 0 0 0 1px rgba(148,163,184,0.35)',
              }}
            >
              {/* Gornji „chip” */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(148,163,184,0.8)',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                  background: 'rgba(15,23,42,0.02)',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '999px',
                    background: '#2563eb',
                    boxShadow: '0 0 8px rgba(37,99,235,0.7)',
                  }}
                />
                <span>Local AI coding assistant</span>
              </div>

              {/* Naslov + opis */}
              <h1
                style={{
                  margin: 0,
                  fontSize: 30,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Dobrodošao u Nexoru
              </h1>

              <p
                style={{
                  marginTop: 8,
                  marginBottom: 18,
                  fontSize: 14,
                  opacity: 0.85,
                  maxWidth: 540,
                }}
              >
                Nexora je lokalni AI asistent za programiranje. Radi direktno s{' '}
                <span className="mono">Ollama</span> modelima na tvom računalu – bez
                cloud API poziva i bez slanja koda trećim stranama.
              </p>

              {/* Dvije kolone benefita */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: 6,
                      fontSize: 13,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}
                  >
                    Što Nexora radi?
                  </h2>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <li>Objašnjava tvoj kod (JS, TS, React, Node...)</li>
                    <li>Pronalazi bugove i predlaže rješenja</li>
                    <li>Refaktorira i čisti komponente i funkcije</li>
                  </ul>
                </div>

                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: 6,
                      fontSize: 13,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}
                  >
                    Zašto je drugačiji?
                  </h2>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <li>Radi potpuno lokalno na tvom računalu</li>
                    <li>Nema slanja koda u cloud ili treće servise</li>
                    <li>Jednostavno sučelje fokusirano na kod</li>
                  </ul>
                </div>
              </div>

              {/* Blaga razdjelnica */}
              <div
                style={{
                  height: 1,
                  background: 'linear-gradient(to right, transparent, #cbd5f5, transparent)',
                  margin: '10px 0 18px',
                  opacity: 0.7,
                }}
              />

              {/* CTA gumbi */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <Link
                  to="/login"
                  className="primary-btn"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 140,
                  }}
                >
                  Prijava
                </Link>

                <Link
                  to="/register"
                  className="secondary-btn"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 140,
                  }}
                >
                  Registracija
                </Link>

                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginLeft: 'auto',
                  }}
                >
                  Nakon prijave otvara se Nexora chat sučelje.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
