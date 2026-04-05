'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Snowflake, Trash2, Eye, EyeOff, Wifi } from 'lucide-react';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    try {
      const { data } = await api.get('/cards');
      setCards(data.data);
    } catch {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async () => {
    setCreating(true);
    try {
      await api.post('/cards');
      toast.success('Virtual card created!');
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
    if (!confirm('Cancel this card? This cannot be undone.')) return;
    try {
      await api.delete(`/cards/${id}`);
      toast.success('Card cancelled');
      fetchCards();
    } catch {
      toast.error('Failed to cancel card');
    }
  };

  const toggleReveal = (id) => {
    setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCardNumber = (num, revealed) => {
    if (!num) return '';
    if (revealed) return num.replace(/(\d{4})/g, '$1 ').trim();
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  const CardVisual = ({ card }) => {
    const revealed = revealedCards[card.id];
    const isFrozen = card.status === 'FROZEN';
    const isCancelled = card.status === 'CANCELLED';

    return (
      <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${isFrozen ? 'opacity-70' : ''} ${isCancelled ? 'opacity-40 grayscale' : ''}`}
        style={{ height: 200, background: isFrozen ? 'linear-gradient(135deg, #334155, #475569)' : 'linear-gradient(135deg, #0A1628 0%, #1e3a6e 50%, #0f2547 100%)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 80% 10%, rgba(240,180,41,0.2) 0%, transparent 50%)'
        }} />
        {isFrozen && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <Snowflake size={16} className="text-blue-300" />
              <span className="text-blue-300 font-semibold text-sm">Card Frozen</span>
            </div>
          </div>
        )}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/40 text-xs font-medium">NOVA TRUST</p>
              <p className="text-white/60 text-xs mt-0.5">{card.type} • {card.network}</p>
            </div>
            <Wifi size={20} className="text-white/40 rotate-90" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-white font-mono text-lg tracking-widest">
                {formatCardNumber(card.cardNumber, revealed)}
              </p>
              <button onClick={() => toggleReveal(card.id)} className="text-white/40 hover:text-white/80 transition">
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/40 text-xs mb-0.5">CARD HOLDER</p>
                <p className="text-white font-medium text-sm tracking-wide">{card.cardHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs mb-0.5">EXPIRES</p>
                <p className="text-white font-medium text-sm">
                  {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs mb-0.5">CVV</p>
                <p className="text-white font-medium text-sm">{revealed ? card.cvv : '•••'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: '#F0B429', transform: 'translate(30%, 30%)' }} />
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>My Cards</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your virtual cards</p>
        </div>
        <button onClick={createCard} disabled={creating || cards.filter(c => c.status !== 'CANCELLED').length >= 3}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: '#0A1628', color: '#F0B429' }}>
          {creating ? (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
          ) : <Plus size={16} />}
          New Card
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0f4ff' }}>
            <CreditCard size={28} style={{ color: '#0A1628' }} />
          </div>
          <h3 className="font-bold font-display text-lg mb-2" style={{ color: '#0A1628' }}>No cards yet</h3>
          <p className="text-slate-500 mb-6 text-sm">Create your first virtual card to start spending</p>
          <button onClick={createCard} className="px-6 py-3 rounded-xl font-semibold" style={{ background: '#0A1628', color: '#F0B429' }}>
            Create Virtual Card
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="space-y-4">
              <CardVisual card={card} />

              {/* Card Info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Type', value: card.type },
                    { label: 'Network', value: card.network },
                    { label: 'Limit', value: `$${card.limit?.toLocaleString()}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                      <p className="font-semibold text-sm" style={{ color: '#0A1628' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    card.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                    card.status === 'FROZEN' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-500'
                  }`}>
                    {card.status}
                  </span>

                  {card.status !== 'CANCELLED' && (
                    <div className="flex gap-2">
                      <button onClick={() => toggleFreeze(card.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition hover:opacity-80 ${
                          card.status === 'FROZEN' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Snowflake size={13} />
                        {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                      </button>
                      <button onClick={() => cancelCard(card.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 transition hover:bg-red-100">
                        <Trash2 size={13} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-2xl border border-amber-100 bg-amber-50">
        <p className="text-sm text-amber-800">
          <strong>ℹ️ Simulation Notice:</strong> These are virtual cards for demonstration purposes. Card numbers are simulated and cannot be used for real transactions. Up to 3 active cards allowed per account.
        </p>
      </div>
    </div>
  );
}
