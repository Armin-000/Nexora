import React, { useState } from 'react';
import '../styles/settings.css';

interface AuthUser {
  id?: number;
  email: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

type SettingsTab = 'account' | 'help';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');

  const [pwdForm, setPwdForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Placeholder for real backend call
  const changePasswordOnServer = async (params: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPwdForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPwdError(null);
    setPwdSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    const { current, next, confirm } = pwdForm;

    if (!current || !next || !confirm) {
      setPwdError('Molim te ispuni sva polja.');
      return;
    }

    if (next.length < 8) {
      setPwdError('Nova lozinka treba imati barem 8 znakova.');
      return;
    }

    if (next !== confirm) {
      setPwdError('Nova lozinka i potvrda se ne podudaraju.');
      return;
    }

    if (!user?.email) {
      setPwdError('Nisi prijavljen. Prijavi se pa pokušaj ponovno.');
      return;
    }

    try {
      await changePasswordOnServer({
        email: user.email,
        currentPassword: current,
        newPassword: next,
      });

      setPwdSuccess('Lozinka je uspješno promijenjena (demo).');
    } catch (err: any) {
      console.error(err);
      setPwdError(
        err?.message || 'Došlo je do greške pri promjeni lozinke.',
      );
    }
  };

  const handleClose = () => {
    // Reset local modal state on close
    setSettingsTab('account');
    setPwdForm({ current: '', next: '', confirm: '' });
    setPwdError(null);
    setPwdSuccess(null);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Postavke</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Zatvori postavke"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tab ${settingsTab === 'account' ? 'active' : ''}`}
            onClick={() => {
              setSettingsTab('account');
              setPwdError(null);
              setPwdSuccess(null);
            }}
          >
            Račun
          </button>
          <button
            type="button"
            className={`modal-tab ${settingsTab === 'help' ? 'active' : ''}`}
            onClick={() => {
              setSettingsTab('help');
              setPwdError(null);
              setPwdSuccess(null);
            }}
          >
            Pomoć
          </button>
        </div>

        <div className="modal-body">
          {settingsTab === 'account' ? (
            <form
              className="modal-form"
              onSubmit={handlePasswordSubmit}
              noValidate
            >
              {user?.email && (
                <p className="field-hint" style={{ marginBottom: 6 }}>
                  Prijavljen si kao: <strong>{user.email}</strong>
                </p>
              )}

              <div className="form-group">
                <label className="field-label" htmlFor="current">
                  Trenutna lozinka
                </label>
                <input
                  id="current"
                  name="current"
                  type="password"
                  className="field-input"
                  value={pwdForm.current}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="next">
                  Nova lozinka
                </label>
                <input
                  id="next"
                  name="next"
                  type="password"
                  className="field-input"
                  value={pwdForm.next}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
                <p className="field-hint">
                  Minimalno 8 znakova. Preporuka: kombinacija slova, brojeva i
                  simbola.
                </p>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="confirm">
                  Potvrda nove lozinke
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  className="field-input"
                  value={pwdForm.confirm}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
              </div>

              {pwdError && (
                <div className="form-status form-status-error">
                  {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div className="form-status form-status-success">
                  {pwdSuccess}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  Spremi lozinku
                </button>
              </div>
            </form>
          ) : (
            <div className="modal-help">
              <div className="modal-help-section">
                <h3>Kako koristiti Nexoru?</h3>
                <p>
                  Jednostavno postavi pitanje ili zalijepi kod. Nexora će
                  pokušati objasniti, optimizirati ili nadopuniti tvoj kod na
                  razumljiv način.
                </p>
              </div>

              <div className="modal-help-section">
                <h3>Tipovi pitanja</h3>
                <ul>
                  <li>Debugiranje i traženje bugova u kodu.</li>
                  <li>Pisanje novih komponenti ili funkcija.</li>
                  <li>Objašnjenja TS/JS/React/Node koncepata.</li>
                </ul>
              </div>

              <div className="modal-help-section">
                <h3>Trebaš dodatnu pomoć?</h3>
                <p>
                  Ako imaš specifičan problem, pokušaj što bolje opisati
                  kontekst (stack, verzije, error poruke) i Nexora će ti dati
                  preciznije rješenje.
                </p>
                <button type="button" className="secondary-btn">
                  Otvori dokumentaciju (placeholder)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
