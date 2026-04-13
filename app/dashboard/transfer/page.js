'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const TYPES    = ['ALL','TRANSFER','DEPOSIT','WITHDRAWAL','ZELLE','CASHAPP','BILL_PAYMENT'];
const STATUSES = ['ALL','COMPLETED','PENDING','FAILED','REVERSED'];

export default function TransferPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('send');
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
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

  useEffect(() => {
    fetchTransactions();
    api.get('/security/pin/status').then(r => setHasPin(r.data.data.hasPin)).catch(() => {});
  }, [fetchTransactions]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions/transfer', {
        recipientAccountNumber: form.recipientAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description,
        transactionPin: hasPin ? pinInput : undefined,
      });
      toast.success('Transfer completed');
      setForm({ recipientAccountNumber: '', amount: '', description: '' });
      setPinInput('');
      fetchTransactions();
      setTab('history');
    } catch (err) { toast.error(err.response?.data?.message || 'Transfer failed'); }
    finally { setLoading(false); }
  };

  const isCredit = (tx) => tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT';

  const TYPE_LABELS = { TRANSFER:'Transfer', DEPOSIT:'Deposit', WITHDRAWAL:'Withdrawal', ZELLE:'Zelle', CASHAPP:'Cash App', BILL_PAYMENT:'Bill', LOAN_DISBURSEMENT:'Loan', LOAN_REPAYMENT:'Loan Repay', MOBILE_DEPOSIT:'Cheque' };

  return (
    <div className="p-5 lg:p-7 anim-up">
      <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,106,0,0.7)' }}>TRANSACTIONS</p>
      <h1 className="font-display text-2xl font-bold mb-5 mt-0.5" style={{ color: 'var(--t1)' }}>Transfers & History</h1>

      {/* Tab bar */}
      <div className="tab-bar mb-6">
        {[{ id:'send', label:'↗ Send Money' }, { id:'history', label:'≡ History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-item ${tab === t.id ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SEND FORM ── */}
      {tab === 'send' && (
        <div className="max-w-md">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--orangeD)', color: 'var(--orange)' }}>
                <Send size={18} />
              </div>
              <div>
                <h2 className="font-display font-semibold" style={{ color: 'var(--t1)' }}>Wire Transfer</h2>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>Instant internal transfer</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>RECIPIENT ACCOUNT</label>
                <input type="text" value={form.recipientAccountNumber}
                  onChange={e => setForm({ ...form, recipientAccountNumber: e.target.value })}
                  className="inp px-4 py-3 rounded-xl text-sm font-mono"
                  placeholder="Account number" required />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>AMOUNT (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--t3)' }}>$</span>
                  <input type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="inp pl-9 pr-4 py-3 rounded-xl text-2xl font-bold"
                    placeholder="0.00" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>REFERENCE (OPTIONAL)</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="inp px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. Invoice payment" />
              </div>

              {hasPin && (
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>TRANSACTION PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="inp px-4 py-3 rounded-xl text-2xl font-bold text-center tracking-[0.5em] font-mono"
                    placeholder="••••" required />
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading ? <div className="spinner" /> : <><Send size={15} /><span>Execute Transfer</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
                <input type="text" placeholder="Search transactions..." value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className="inp pl-9 pr-4 py-2.5 rounded-xl text-sm" />
              </div>
              <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
                className="inp px-3 py-2.5 rounded-xl text-sm" style={{ width: 'auto' }}>
                {TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="inp px-3 py-2.5 rounded-xl text-sm" style={{ width: 'auto' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-display font-semibold text-sm" style={{ color: 'var(--t1)' }}>All Transactions</p>
              <span className="badge badge-gray">{pagination.total} records</span>
            </div>

            {txLoading ? (
              <div className="p-5 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="py-14 text-center" style={{ color: 'var(--t3)' }}>
                <ArrowLeftRight size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => {
                        const credit = isCredit(tx);
                        const color = credit ? '#22c55e' : '#ef4444';
                        return (
                          <tr key={tx.id}>
                            <td style={{ color: 'var(--t3)', fontSize: 12, whiteSpace: 'nowrap' }}>
                              {format(new Date(tx.createdAt), 'MMM d, HH:mm')}
                            </td>
                            <td>
                              <span className="badge badge-gray">{TYPE_LABELS[tx.type] || tx.type}</span>
                            </td>
                            <td style={{ color: 'var(--t2)', fontSize: 13 }}>
                              {tx.description || '—'}
                            </td>
                            <td>
                              <span className="font-semibold" style={{ color }}>{credit ? '+' : '-'}${tx.amount.toFixed(2)}</span>
                            </td>
                            <td>
                              <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-green' : tx.status === 'REVERSED' ? 'badge-blue' : tx.status === 'FAILED' ? 'badge-red' : 'badge-yellow'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--t3)' }}>Page {pagination.page} of {pagination.totalPages}</p>
                    <div className="flex gap-2">
                      <button onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page === 1}
                        className="btn-ghost p-2 rounded-lg disabled:opacity-30"><ChevronLeft size={14} /></button>
                      <button onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                        className="btn-ghost p-2 rounded-lg disabled:opacity-30"><ChevronRight size={14} /></button>
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
