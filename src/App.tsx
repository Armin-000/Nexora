import React, { useState, useRef, useEffect } from 'react';
import Prism from 'prismjs';

// Prism languages (load order matters)
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

import SettingsModal from './components/settingsModal';

/* ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */

type Role = 'system' | 'user' | 'assistant';

interface Message {
  id: number;
  role: Role;
  content: string;
}

interface Segment {
  type: 'text' | 'code';
  content: string;
  lang?: string;
  key: string;
}

interface AuthUser {
  id?: number;
  email: string;
}

/* ────────────────────────────────────────────────────────────
 * Constants
 * ──────────────────────────────────────────────────────────── */

// Single hard-coded model (no model dropdown in UI)
const MODEL_NAME = 'llama3.2:3b';

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

/**
 * Normalize language hints for Prism based on a short `lang` token.
 */
const resolveLanguage = (raw?: string) => {
  const lang = (raw || '').toLowerCase();

  if (lang === 'js' || lang === 'javascript') return 'javascript';
  if (lang === 'ts' || lang === 'typescript') return 'typescript';
  if (lang === 'tsx') return 'tsx';
  if (lang === 'jsx') return 'jsx';
  if (lang === 'html' || lang === 'markup') return 'markup';
  if (lang === 'css') return 'css';

  return 'javascript';
};

/**
 * Split a message into plain text segments and ```lang code``` blocks.
 * This allows us to render mixed content with syntax highlighting.
 */
const parseMessageContent = (content: string, messageId: number): Segment[] => {
  const segments: Segment[] = [];
  const codeRegex = /```(\w+)?\s*\r?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    const [fullMatch, langRaw, codeRaw] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;

    // Text before the code block
    if (matchStart > lastIndex) {
      const textPart = content.slice(lastIndex, matchStart);
      if (textPart.trim().length > 0) {
        segments.push({
          type: 'text',
          content: textPart.trim(),
          key: `${messageId}-text-${blockIndex}`,
        });
      }
    }

    // Code block itself
    const lang = (langRaw || '').trim() || 'code';
    const code = codeRaw.replace(/\s+$/, '');

    segments.push({
      type: 'code',
      content: code,
      lang,
      key: `${messageId}-code-${blockIndex}`,
    });

    lastIndex = matchEnd;
    blockIndex += 1;
  }

  // Trailing text after the last code block
  if (lastIndex < content.length) {
    const textPart = content.slice(lastIndex);
    if (textPart.trim().length > 0) {
      segments.push({
        type: 'text',
        content: textPart.trim(),
        key: `${messageId}-text-end`,
      });
    }
  }

  // If no blocks were found, treat whole content as a single text segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: content.trim(),
      key: `${messageId}-text-only`,
    });
  }

  return segments;
};

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */

const App: React.FC = () => {
  /* ── Chat state ────────────────────────────────────────── */

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'system',
      content:
        'You are a helpful coding assistant. ' +
        'Odgovaraj na hrvatskom jeziku kad god je moguće. ' +
        'Kada daješ primjer koda, koristi jasno formatiranje i ukratko ga objasni. ' +
        'Kod piši unutar code-blockova (```jezik ...```), tako da ga je lako kopirati.',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── UI state ──────────────────────────────────────────── */

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /* ── Auth state (demo only; backend wiring comes later) ── */

  const [user, setUser] = useState<AuthUser | null>({
    email: 'demo@user.com',
  });
  const [authToken, setAuthToken] = useState<string | null>(null);

  /* ── Refs ──────────────────────────────────────────────── */

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* ── Derived values ───────────────────────────────────── */

  const model = MODEL_NAME;
  const currentModelLabel = MODEL_NAME;
  const visibleMessages = messages.filter((m) => m.role !== 'system');

  /* ────────────────────────────────────────────────────────
   * UI Handlers
   * ──────────────────────────────────────────────────────── */

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  /**
   * Clear local auth state and reset demo user.
   */
  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_email');
    localStorage.removeItem('nexora_user_id');
  };

  /**
   * Auto-scroll to the latest message whenever messages change.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send user input to the Ollama chat API and stream back assistant tokens.
   */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    const userMsgId = Date.now();
    const assistantId = userMsgId + 1;

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
    };

    const baseMessages = [...messages, userMsg];

    // Add user message and an empty assistant message to be filled as tokens arrive
    setMessages([
      ...baseMessages,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        model,
        stream: true,
        messages: baseMessages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      };

      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Greška na serveru: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Browser ne podržava stream čitanje odgovora.');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim().length > 0);

        for (const line of lines) {
          let data: any;
          try {
            data = JSON.parse(line);
          } catch {
            continue;
          }

          const token: string = data?.message?.content ?? '';
          const isDone: boolean = data?.done ?? false;

          if (token) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + token }
                  : m,
              ),
            );
          }

          if (isDone) break;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ??
          'Dogodila se greška pri spajanju na Ollama API. Je li Ollama pokrenut?',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Submit on Enter (single line), allow Shift+Enter for multiline input.
   */
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Copy a code block to clipboard and show temporary "copied" state.
   */
  const handleCopyBlock = async (blockId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlockId(blockId);
      setTimeout(() => setCopiedBlockId(null), 1500);
    } catch (err) {
      console.error(err);
      setError('Ne mogu kopirati kod u međuspremnik (clipboard).');
    }
  };

  /* ────────────────────────────────────────────────────────
   * Render
   * ──────────────────────────────────────────────────────── */

  return (
    <div
      className={`app-root ${
        theme === 'dark' ? 'theme-dark' : 'theme-light'
      }`}
    >
      <div className="chat-shell">
        {/* ── Top navigation bar ───────────────────────────── */}
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">Model</span>
              <span className="mono sub-model">{currentModelLabel}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Promijeni temu"
            />

            <button
              type="button"
              className="settings-btn"
              onClick={openSettings}
              aria-label="Otvori postavke"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.57 0 1.11.24 1.51.67A2 2 0 1 1 19.4 15z"></path>
              </svg>
            </button>

            {user && (
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Odjava"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* ── Main chat layout ─────────────────────────────── */}
        <div className="chat-body">
          <main className="chat-main">
            <div className="messages">
              {visibleMessages.length === 0 && (
                <div className="empty-state">
                  <p>Spreman sam. Napiši pitanje ili zalijepi svoj kod.</p>
                  <ul>
                    <li>Napiši mi primjer HTML stranice za prodaju automobila.</li>
                    <li>Optimiziraj ovaj JavaScript kod.</li>
                    <li>Objasni mi ovaj TSX kod koji šaljem.</li>
                  </ul>
                </div>
              )}

              {visibleMessages.map((msg) => {
                const isUser = msg.role === 'user';
                const isAssistant = msg.role === 'assistant';

                const segments: Segment[] = isAssistant
                  ? parseMessageContent(msg.content, msg.id)
                  : [
                      {
                        type: 'text',
                        content: msg.content,
                        key: `${msg.id}-user-text`,
                      },
                    ];

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${
                      isUser ? 'user-row' : 'assistant-row'
                    }`}
                  >
                    <div
                      className={`avatar ${
                        isUser ? 'avatar-user' : 'avatar-bot'
                      }`}
                    >
                      {isUser ? 'TY' : '</>'}
                    </div>

                    <div
                      className={`bubble ${
                        isUser ? 'bubble-user' : 'bubble-assistant'
                      }`}
                    >
                      <div className="bubble-header">
                        <span className="role-label">
                          {isUser ? 'Ti' : 'Nexora'}
                        </span>
                      </div>

                      <div className="bubble-content">
                        {segments.map((seg) =>
                          seg.type === 'text' ? (
                            <div className="segment-text" key={seg.key}>
                              {seg.content}
                            </div>
                          ) : (
                            <div className="code-block" key={seg.key}>
                              <div className="code-header">
                                <div className="code-title">
                                  <span className="code-dot red" />
                                  <span className="code-dot yellow" />
                                  <span className="code-dot green" />
                                  <span className="code-lang">
                                    {(seg.lang || 'code').toUpperCase()}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="code-copy-btn"
                                  onClick={() =>
                                    handleCopyBlock(seg.key, seg.content)
                                  }
                                >
                                  {copiedBlockId === seg.key
                                    ? '✓ Kopirano'
                                    : 'Kopiraj'}
                                </button>
                              </div>

                              <div className="code-body">
                                {(() => {
                                  const lang = resolveLanguage(seg.lang);
                                  const highlighted = Prism.highlight(
                                    seg.content,
                                    // @ts-ignore – Prism language registry typing is loose
                                    Prism.languages[lang] ||
                                      Prism.languages.javascript,
                                    lang,
                                  );

                                  return (
                                    <pre className={`language-${lang}`}>
                                      <code
                                        className={`language-${lang}`}
                                        dangerouslySetInnerHTML={{
                                          __html: highlighted,
                                        }}
                                      />
                                    </pre>
                                  );
                                })()}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </main>
          {/* ── Input area ─────────────────────────────────── */}
          <form
            className="input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="input-inner">
              <textarea
                className="chat-input"
                placeholder="Napiši pitanje ili zalijepi svoj kod ovdje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />

              <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="send-spinner" aria-hidden="true" />
                    <span className="send-label">Razmišljam…</span>
                  </>
                ) : (
                  <>
                    <span className="send-label">Pošalji</span>
                    <span className="send-icon" aria-hidden="true">
                      ➤
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Settings modal (separate component) ──────────── */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          user={user}
        />

        {/* ── Global error banner ─────────────────────────── */}
        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
};

export default App;
