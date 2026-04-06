'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['ALL', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'];
const STATUSES = ['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REVERSED'];

export default function TransferPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('send');
  const [form, setForm] = useState({ recipientAccountNumber: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: 'ALL', status: 'ALL', search: '' });
  const [txLoading, setTxLoading] = useState(true);

  const fetchTransactions = useCallback(async (page = 1) => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filters.type !== 'ALL') params.append('type', filters.type);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load transactions'); }
    finally { setTxLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions/transfer', {
        recipientAccountNumber: form.recipientAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description,
      });
      toast.success('Transfer completed');
      setForm({ recipientAccountNumber: '', amount: '', description: '' });
      fetchTransactions();
      setTab('history');
    } catch (err) { toast.error(err.response?.data?.message || 'Transfer failed'); }
    finally { setLoading(false); }
  };

  const isCredit = (tx) => tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT';
  const getColor = (tx) => isCredit(tx) ? '#4ade80' : '#f87171';

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'rgba(255,106,0,0.7)' }}>TRANSACTIONS</p>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Transfers & History</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {['send', 'history'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
            style={tab === t ? { background: 'rgba(255,106,0,0.15)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' } : { color: 'rgba(255,255,255,0.35)' }}>
            {t === 'send' ? '↗ Send Money' : '≡ History'}
          </button>
        ))}
      </div>

      {tab === 'send' && (
        <div className="max-w-md">
          <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.1)', color: '#FF6A00' }}>
                <Send size={18} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-white">Wire Transfer</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Instant internal transfer</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>RECIPIENT ACCOUNT</label>
                <input type="text" value={form.recipientAccountNumber}
                  onChange={(e) => setForm({ ...form, recipientAccountNumber: e.target.value })}
                  className="elite-input w-full px-4 py-3 rounded-xl text-sm font-mono"
                  placeholder="Account number" required />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>AMOUNT (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl" style={{ color: 'rgba(255,255,255,0.2)' }}>$</span>
                  <input type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="elite-input w-full pl-9 pr-4 py-3 rounded-xl text-2xl font-bold"
                    placeholder="0.00" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>REFERENCE (OPTIONAL)</label>
                <input type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="elite-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. Invoice payment" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Send size={15} /><span>Execute Transfer</span></>}
              </button>
            </form>

            <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.1)', color: 'rgba(255,106,0,0.6)' }}>
              💡 Test: use account number <span className="font-mono">485700000001</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl p-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input type="text" placeholder="Search..." value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="elite-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs" />
              </div>
              {[{ key: 'type', opts: TYPES }, { key: 'status', opts: STATUSES }].map(({ key, opts }) => (
                <select key={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  className="elite-input select-input px-3 py-2.5 rounded-xl text-xs">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="font-display font-semibold text-white text-sm">All Transactions</p>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{pagination.total} records</span>
            </div>

            {txLoading ? (
              <div className="p-5 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-xl skeleton" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="py-14 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <ArrowLeftRight size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions found</p>
              </div>
            ) : (
              <>
                <div className="px-5">
                  {transactions.map((tx) => {
                    const credit = isCredit(tx);
                    const color = getColor(tx);
                    return (
                      <div key={tx.id} className="flex items-center gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12`, color }}>
                          {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={13} /> : tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={13} /> : credit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{tx.description || tx.type}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{format(new Date(tx.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold" style={{ color }}>{credit ? '+' : '-'}${tx.amount.toFixed(2)}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            background: tx.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : tx.status === 'REVERSED' ? 'rgba(129,140,248,0.1)' : 'rgba(251,191,36,0.1)',
                            color: tx.status === 'COMPLETED' ? '#4ade80' : tx.status === 'REVERSED' ? '#818cf8' : '#fbbf24'
                          }}>{tx.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Page {pagination.page} of {pagination.totalPages}</p>
                    <div className="flex gap-2">
                      {[{ icon: ChevronLeft, action: () => fetchTransactions(pagination.page - 1), disabled: pagination.page === 1 },
                        { icon: ChevronRight, action: () => fetchTransactions(pagination.page + 1), disabled: pagination.page === pagination.totalPages }
                      ].map(({ icon: Icon, action, disabled }, i) => (
                        <button key={i} onClick={action} disabled={disabled}
                          className="p-2 rounded-lg transition disabled:opacity-30"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
