'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp,
  Eye, EyeOff, Plus, Send, Download, CreditCard, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jul', balance: 4200 }, { month: 'Aug', balance: 6800 },
  { month: 'Sep', balance: 5200 }, { month: 'Oct', balance: 9100 },
  { month: 'Nov', balance: 7800 }, { month: 'Dec', balance: 11200 },
  { month: 'Jan', balance: 15420 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        api.get('/account'),
        api.get('/transactions?limit=5'),
      ]);
      setAccount(accRes.data.data);
      setTransactions(txRes.data.data.transactions);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try {
      await api.post('/transactions/deposit', { amount: parseFloat(amount) });
      toast.success(`$${amount} deposited successfully!`);
      setDepositModal(false);
      setAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try {
      await api.post('/transactions/withdraw', { amount: parseFloat(amount) });
      toast.success(`$${amount} withdrawn successfully!`);
      setWithdrawModal(false);
      setAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getTxIcon = (tx) => {
    if (tx.type === 'DEPOSIT') return <ArrowDownLeft size={16} className="text-green-600" />;
    if (tx.type === 'WITHDRAWAL') return <ArrowUpRight size={16} className="text-red-500" />;
    return <ArrowLeftRight size={16} className="text-blue-500" />;
  };

  const getTxAmount = (tx) => {
    const isCredit = tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT';
    const color = isCredit ? 'text-green-600' : 'text-red-500';
    const sign = isCredit ? '+' : '-';
    return <span className={`font-semibold ${color}`}>{sign}${tx.amount.toFixed(2)}</span>;
  };

  const Modal = ({ title, onClose, onConfirm, confirmLabel, confirmColor }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <h3 className="text-xl font-bold font-display mb-1" style={{ color: '#0A1628' }}>{title}</h3>
        <p className="text-slate-500 text-sm mb-5">Current balance: <span className="font-semibold text-slate-700">${account?.balance?.toFixed(2)}</span></p>
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">$</span>
          <input
            type="number" min="1" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-xl border-2 border-slate-200 focus:outline-none focus:border-yellow-400 text-slate-900"
            placeholder="0.00" autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} disabled={actionLoading}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: confirmColor }}>
            {actionLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your financial overview</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1e2d5a 60%, #0A1628 100%)',
        minHeight: 200
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, #F0B429 0%, transparent 50%)'
        }} />
        <div className="relative p-6 lg:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-bold font-display text-white">
                  {balanceVisible ? `$${account?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                </h2>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-white/50 hover:text-white transition">
                  {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Acc: {account?.accountNumber?.replace(/(\d{4})(\d{4})(\d{5})/, '$1 $2 $3')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Account type</p>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(240,180,41,0.2)', color: '#F0B429' }}>
                {account?.accountType}
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Deposit', icon: Plus, onClick: () => setDepositModal(true), primary: true },
              { label: 'Withdraw', icon: Download, onClick: () => setWithdrawModal(true) },
              { label: 'Transfer', icon: Send, href: '/dashboard/transfer' },
            ].map(({ label, icon: Icon, onClick, href, primary }) => {
              const cls = `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 active:scale-95`;
              const style = primary
                ? { background: '#F0B429', color: '#0A1628' }
                : { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' };
              if (href) return (
                <Link key={label} href={href} className={cls} style={style}>
                  <Icon size={15} />{label}
                </Link>
              );
              return (
                <button key={label} onClick={onClick} className={cls} style={style}>
                  <Icon size={15} />{label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Currency', value: account?.currency || 'USD', icon: TrendingUp, color: '#6366f1' },
          { label: 'Account Type', value: account?.accountType, icon: CreditCard, color: '#F0B429' },
          { label: 'Status', value: account?.isActive ? 'Active' : 'Inactive', icon: ArrowDownLeft, color: '#22c55e' },
          { label: 'KYC Status', value: user?.kyc?.status || 'Pending', icon: ArrowUpRight, color: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
            <p className="text-lg font-bold font-display" style={{ color: '#0A1628' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold font-display text-lg" style={{ color: '#0A1628' }}>Balance History</h3>
              <p className="text-slate-400 text-sm">Last 7 months</p>
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <TrendingUp size={14} /> +12.4%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A1628" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0A1628" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Balance']}
                contentStyle={{ background: '#0A1628', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="balance" stroke="#0A1628" strokeWidth={2.5} fill="url(#balanceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold font-display text-lg mb-4" style={{ color: '#0A1628' }}>Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Send Money', desc: 'Transfer to any account', icon: Send, href: '/dashboard/transfer', color: '#6366f1' },
              { label: 'My Cards', desc: 'View & manage cards', icon: CreditCard, href: '/dashboard/cards', color: '#F0B429' },
              { label: 'Deposit Funds', desc: 'Add money to wallet', icon: Plus, onClick: () => setDepositModal(true), color: '#22c55e' },
            ].map(({ label, desc, icon: Icon, href, onClick, color }) => {
              const content = (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0A1628' }}>{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 transition" />
                </div>
              );
              if (href) return <Link key={label} href={href}>{content}</Link>;
              return <div key={label} onClick={onClick}>{content}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold font-display text-lg" style={{ color: '#0A1628' }}>Recent Transactions</h3>
          <Link href="/dashboard/transfer" className="text-sm font-medium hover:underline" style={{ color: '#F0B429' }}>View all</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f8fafc' }}>
                  {getTxIcon(tx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{tx.description || tx.type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                </div>
                <div className="text-right">
                  {getTxAmount(tx)}
                  <p className="text-xs text-slate-400 mt-0.5">{tx.status}</p>
                </div>
                {tx.flagged && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">⚠ Flagged</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {depositModal && <Modal title="Deposit Funds" onClose={() => { setDepositModal(false); setAmount(''); }} onConfirm={handleDeposit} confirmLabel="Deposit" confirmColor="#22c55e" />}
      {withdrawModal && <Modal title="Withdraw Funds" onClose={() => { setWithdrawModal(false); setAmount(''); }} onConfirm={handleWithdraw} confirmLabel="Withdraw" confirmColor="#ef4444" />}
    </div>
  );
}
