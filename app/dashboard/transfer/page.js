'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['ALL', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'];
const STATUSES = ['ALL', 'COMPLETED', 'PENDING', 'FAILED'];

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
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setTxLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/transfer', {
        recipientAccountNumber: form.recipientAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description,
      });
      toast.success(`$${form.amount} sent successfully!`);
      setForm({ recipientAccountNumber: '', amount: '', description: '' });
      fetchTransactions();
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const getTxIcon = (tx) => {
    const isCredit = tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT';
    if (tx.type === 'DEPOSIT') return <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><ArrowDownLeft size={18} className="text-green-600" /></div>;
    if (tx.type === 'WITHDRAWAL') return <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><ArrowUpRight size={18} className="text-red-500" /></div>;
    if (isCredit) return <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><ArrowDownLeft size={18} className="text-blue-500" /></div>;
    return <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><ArrowUpRight size={18} className="text-slate-500" /></div>;
  };

  const getTxAmount = (tx) => {
    const isCredit = tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT';
    return (
      <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
        {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
      </span>
    );
  };

  const getCounterparty = (tx) => {
    if (tx.type === 'DEPOSIT') return 'Bank Deposit';
    if (tx.type === 'WITHDRAWAL') return 'Bank Withdrawal';
    const isCredit = tx.toAccount?.userId === user?.id;
    if (isCredit) {
      const u = tx.fromAccount?.user;
      return u ? `${u.firstName} ${u.lastName}` : 'Unknown';
    }
    const u = tx.toAccount?.user;
    return u ? `${u.firstName} ${u.lastName}` : 'Unknown';
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#0A1628' }}>Transfers & History</h1>
      <p className="text-slate-500 text-sm mb-6">Send money and view all your transactions</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {['send', 'history'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'send' ? '💸 Send Money' : '📋 History'}
          </button>
        ))}
      </div>

      {/* Send Money Form */}
      {tab === 'send' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#0A1628' }}>
                <Send size={18} style={{ color: '#F0B429' }} />
              </div>
              <div>
                <h2 className="font-bold font-display" style={{ color: '#0A1628' }}>Send Money</h2>
                <p className="text-xs text-slate-400">Instant transfers between accounts</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient Account Number</label>
                <input
                  type="text" value={form.recipientAccountNumber}
                  onChange={(e) => setForm({ ...form, recipientAccountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 font-mono"
                  placeholder="485700000000" required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 text-xl font-bold"
                    placeholder="0.00" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                <input
                  type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                  placeholder="e.g. Rent payment"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: '#0A1628', color: '#F0B429' }}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
                ) : (
                  <><Send size={18} /> Send Money</>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700">
                💡 <strong>Tip:</strong> Use a demo account number like <span className="font-mono">485700000001</span> to test transfers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                />
              </div>
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold font-display" style={{ color: '#0A1628' }}>All Transactions</h3>
              <span className="text-sm text-slate-400">{pagination.total} total</span>
            </div>

            {txLoading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-30" />
                <p>No transactions found</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                      {getTxIcon(tx)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-slate-800 truncate">{tx.description || tx.type}</p>
                          {tx.flagged && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex-shrink-0">⚠ Flagged</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{getCounterparty(tx)} • {format(new Date(tx.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm">{getTxAmount(tx)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                          tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                        }`}>{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
                    <div className="flex gap-2">
                      <button onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page === 1}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition">
                        <ChevronRight size={16} />
                      </button>
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
