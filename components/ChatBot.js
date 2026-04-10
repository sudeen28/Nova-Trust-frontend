'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

const SYSTEM_PROMPT = `You are Nova, an AI assistant for Nova Trust Private Banking. You are professional, concise, and helpful.

Nova Trust offers:
- Multi-account banking (Checking, Savings, Investment)
- Internal transfers between accounts
- Zelle and Cash App payments
- Virtual card issuance
- Loan applications (8.5% APR)
- Bill payments
- Mobile cheque deposits
- KYC identity verification
- 256-bit encryption and OTP security

Answer questions about banking, accounts, transfers, loans, and security. Keep responses brief (2-4 sentences max). If asked about something outside banking, politely redirect. Never ask for passwords, OTPs, or sensitive data.`;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m Nova, your private banking assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'I\'m sorry, I couldn\'t process that. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = [
    'How do I transfer money?',
    'How do I apply for a loan?',
    'What is OTP login?',
    'How do I pay bills?',
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition hover:scale-105 active:scale-95"
          style={{ background: '#FF6A00', boxShadow: '0 8px 32px rgba(255,106,0,0.4)' }}>
          <MessageCircle size={24} color="#000" strokeWidth={2.5} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 360,
            height: minimized ? 64 : 520,
            background: '#111111',
            border: '1px solid rgba(255,106,0,0.2)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            transition: 'height 0.2s ease'
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
            style={{ background: '#0F0F0F', borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.15)', color: '#FF6A00' }}>
                <Bot size={16} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold font-display">Nova AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Online</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg transition hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Minimize2 size={14} />
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }} className="p-1.5 rounded-lg transition hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={msg.role === 'assistant'
                        ? { background: 'rgba(255,106,0,0.12)', color: '#FF6A00' }
                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                      {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    <div className="max-w-[80%]">
                      <div className="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                        style={msg.role === 'assistant'
                          ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: 4 }
                          : { background: 'rgba(255,106,0,0.15)', color: '#FF6A00', borderBottomRightRadius: 4 }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.12)', color: '#FF6A00' }}>
                      <Bot size={14} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: 4 }}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.3)', animationDelay: `${d * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick questions (only on first message) */}
                {messages.length === 1 && (
                  <div className="space-y-1.5 pt-1">
                    {quickQuestions.map(q => (
                      <button key={q} onClick={() => { setInput(q); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs transition hover:border-orange-400"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Ask Nova anything..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.8)',
                      outline: 'none',
                      maxHeight: 80,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button onClick={sendMessage} disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
                    style={{ background: '#FF6A00' }}>
                    <Send size={14} color="#000" />
                  </button>
                </div>
                <p className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>Powered by Claude AI</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
