'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Snowflake, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/cards');
      setCards(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Failed to load cards');
      toast.error('Failed to load cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async () => {
    setCreating(true);
    try {
      await api.post('/cards');
      toast.success('Virtual card created');
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setCreating(false);
    }
  };

  const toggleFreeze = async (id) => {
    try {
      const { data } = await api.patch(`/cards/${id}/freeze`);
      toast.success(data.message);
      fetchCards();
    } catch {
      toast.error('Action failed');
    }
  };

  const cancelCard = async (id) => {
    if (!confirm('Cancel this card permanently?')) return;
    try {
      await api.delete(`/cards/${id}`);
      toast.success('Card cancelled');
      fetchCards();
    } catch {
      toast.error('Failed');
    }
  };

  const fmt = (num, show) => {
    if (!num) return '•••• •••• •••• ••••';
    if (show) return num.replace(/(\d{4})/g, '$1 ').trim();
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  const activeCards = cards.filter(c => c.status !== 'CANCELLED');

  return (
    <div className="p-5 lg:p-7 anim-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,106,0,0.7)' }}>PAYMENT INSTRUMENTS</p>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">Virtual Cards</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCards} className="btn-ghost p-2.5 rounded-xl"><RefreshCw size={15} /></button>
          <button onClick={createCard} disabled={creating || activeCards.length >= 3}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40">
            {creating ? <div className="spinner" style={{ borderTopColor: '#000' }} /> : <Plus size={14} />}
            Issue Card
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">{[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 195 }} />)}</div>
      ) : error ? (
        <div className="text-center py-20 rounded-2xl card">
          <CreditCard size={28} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
          <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Could not load cards</p>
          <button onClick={fetchCards} className="btn-ghost px-4 py-2 rounded-xl text-xs mt-2">Try again</button>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20 card rounded-2xl">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,106,0,0.08)', color: '#FF6A00' }}>
            <CreditCard size={24} />
          </div>
          <h3 className="font-display font-semibold text-white mb-2">No cards yet</h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Issue your first virtual card instantly</p>
          <button onClick={createCard} disabled={creating} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
            {creating ? 'Creating...' : 'Issue Virtual Card'}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((card) => {
            const show = revealed[card.id];
            const frozen = card.status === 'FROZEN';
            const cancelled = card.status === 'CANCELLED';
            return (
              <div key={card.id} className="space-y-3">
                {/* Card visual */}
                <div className={`relative rounded-2xl overflow-hidden transition-all ${frozen ? 'opacity-60' : ''} ${cancelled ? 'opacity-30 grayscale' : ''}`}
                  style={{ height: 195, background: 'linear-gradient(135deg, #141414 0%, #1c1208 60%, #141414 100%)', border: '1px solid rgba(255,106,0,0.12)', boxShadow: '0 0 40px rgba(255,106,0,0.04)' }}>
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 85% 20%, rgba(255,106,0,0.1) 0%, transparent 50%)' }} />
                  {frozen && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(129,140,248,0.3)' }}>
                        <Snowflake size={14} style={{ color: '#818cf8' }} />
                        <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>Frozen</span>
                      </div>
                    </div>
                  )}
                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>NOVA TRUST</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.15)' }}>{card.account?.accountType || 'VIRTUAL'} · VISA</p>
                      </div>
                      <button onClick={() => setRevealed(p => ({ ...p, [card.id]: !p[card.id] }))}
                        className="transition" style={{ color: 'rgba(255,255,255,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FF6A00'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div>
                      <p className="font-mono text-base tracking-widest text-white mb-3">{fmt(card.cardNumber, show)}</p>
                      <div className="flex justify-between items-end">
                        <div><p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>HOLDER</p><p className="text-xs font-semibold tracking-wide text-white">{card.cardHolder}</p></div>
                        <div><p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>EXPIRES</p><p className="text-xs font-semibold text-white">{String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}</p></div>
                        <div><p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>CVV</p><p className="text-xs font-semibold text-white font-mono">{show ? card.cvv : '•••'}</p></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                {card.status !== 'CANCELLED' && (
                  <div className="flex gap-2">
                    <button onClick={() => toggleFreeze(card.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition"
                      style={frozen ? { background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.15)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Snowflake size={12} />{frozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button onClick={() => cancelCard(card.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
                      style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.12)' }}>
                      <Trash2 size={12} />Cancel
                    </button>
                  </div>
                )}
                {card.status === 'CANCELLED' && (
                  <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>This card has been cancelled</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 p-4 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}>
        Virtual cards are simulated instruments for demonstration. Maximum 3 active cards per account.
      </div>
    </div>
  );
}
