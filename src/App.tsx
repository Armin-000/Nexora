import React, { useState, useRef, useEffect } from 'react';
import Prism from 'prismjs';

// Prism jezici (VAŽAN REDOSLIJED)
import 'prismjs/components/prism-markup';    // HTML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

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

const MODEL_OPTIONS = [
  { value: 'qwen2.5-coder:1.5b', label: 'Qwen 2.5 Coder 1.5B' },
  { value: 'qwen2.5:0.5b', label: 'Qwen 2.5 0.5B' },
  { value: 'llama3.2:1b', label: 'Llama 3.2 1B' },
];

// helper za prikaz jezika
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

// parsira tekst na običan + code blockove ```lang ... ```
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

  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: content.trim(),
      key: `${messageId}-text-only`,
    });
  }

  return segments;
};

const App: React.FC = () => {
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

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [model, setModel] = useState<string>(MODEL_OPTIONS[0].value);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleModelChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setModel(e.target.value);
  };

  const currentModelLabel =
    MODEL_OPTIONS.find((m) => m.value === model)?.label ?? model;

  // auto-scroll na dno kad se promijene poruke
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // dodaj user poruku + prazan assistant za streaming
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

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <div
      className={`app-root ${
        theme === 'dark' ? 'theme-dark' : 'theme-light'
      }`}
    >
      <div className="chat-shell">
        {/* HEADER */}
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">Model</span>
              <span className="mono sub-model">{currentModelLabel}</span>
            </div>
          </div>

          <div className="topbar-right">
            <select
              className="model-select"
              value={model}
              onChange={handleModelChange}
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Promijeni temu"
            />

            <div className="topbar-badge">LOCAL ONLY</div>
          </div>
        </header>

        {/* GLAVNI DIO */}
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
                      className={`avatar ${isUser ? 'avatar-user' : 'avatar-bot'}`}
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
                          {isUser ? 'Ti' : 'Chatbot'}
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
                                    // @ts-ignore
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

          {/* INPUT */}
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
                {isLoading ? 'Razmišljam…' : 'Pošalji'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
};

export default App;
