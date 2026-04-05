'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Users, ArrowLeftRight, AlertTriangle, Shield, LogOut,
  LayoutDashboard, UserCog, CheckCircle, XCircle, Camera,
  Ban, Edit2, DollarSign, RotateCcw, Plus, X, Save
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [mobileDeposits, setMobileDeposits] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [editUserModal, setEditUserModal] = useState(null);
  const [balanceModal, setBalanceModal] = useState(null);
  const [addTxModal, setAddTxModal] = useState(null);
  const [editTxModal, setEditTxModal] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user, tab]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      if (tab === 'dashboard') {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data.stats);
        setTransactions(data.data.recentTransactions);
        setUsers(data.data.recentUsers);
      } else if (tab === 'users') {
        const { data } = await api.get(`/admin/users?limit=20${search ? `&search=${search}` : ''}`);
        setUsers(data.data.users);
      } else if (tab === 'transactions') {
        const { data } = await api.get('/admin/transactions?limit=30');
        setTransactions(data.data.transactions);
      } else if (tab === 'fraud') {
        const { data } = await api.get('/admin/fraud-flags');
        setFraudFlags(data.data);
      } else if (tab === 'deposits') {
        const { data } = await api.get('/admin/mobile-deposits');
        setMobileDeposits(data.data);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setDataLoading(false); }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      toast.success(`User ${status.toLowerCase()}`);
      fetchData();
    } catch { toast.error('Action failed'); }
  };

  const resolveFraud = async (id) => {
    try {
      await api.patch(`/admin/fraud-flags/${id}/resolve`);
      toast.success('Flag resolved');
      fetchData();
    } catch { toast.error('Action failed'); }
  };

  const reverseTransaction = async (id) => {
    if (!confirm('Reverse this transaction? Funds will be returned.')) return;
    try {
      await api.patch(`/admin/transactions/${id}/reverse`);
      toast.success('Transaction reversed');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reviewDeposit = async (id, status) => {
    const reason = status === 'REJECTED' ? prompt('Rejection reason:') : null;
    try {
      await api.patch(`/admin/mobile-deposits/${id}/review`, { status, rejectionReason: reason });
      toast.success(`Deposit ${status.toLowerCase()}`);
      fetchData();
    } catch { toast.error('Action failed'); }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1628' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
    </div>
  );

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'deposits', icon: Camera, label: 'Mobile Deposits' },
    { id: 'fraud', icon: AlertTriangle, label: 'Fraud Flags' },
  ];

  // ── MODALS ────────────────────────────────────────────────────────────────

  const EditUserModal = () => {
    const [form, setForm] = useState({ ...editUserModal });
    const save = async () => {
      try {
        await api.put(`/admin/users/${form.id}`, form);
        toast.success('User updated');
        setEditUserModal(null);
        fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold font-display" style={{ color: '#0A1628' }}>Edit User</h3>
            <button onClick={() => setEditUserModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name', key: 'lastName' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Address', key: 'address' },
              { label: 'City', key: 'city' },
              { label: 'Country', key: 'country' },
            ].map(({ label, key, type = 'text' }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                <input type={type} value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none bg-white">
                  {['ACTIVE','SUSPENDED','FROZEN','CLOSED'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none bg-white">
                  {['USER','ADMIN'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setEditUserModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: '#0A1628', color: '#F0B429' }}>
              <Save size={14} />Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BalanceModal = () => {
    const [newBalance, setNewBalance] = useState(balanceModal?.balance || '');
    const [reason, setReason] = useState('');
    const save = async () => {
      try {
        await api.patch(`/admin/users/${balanceModal.id}/balance`, { balance: newBalance, reason });
        toast.success('Balance updated');
        setBalanceModal(null);
        fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display" style={{ color: '#0A1628' }}>Edit Balance</h3>
            <button onClick={() => setBalanceModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <p className="text-sm text-slate-500 mb-4">{balanceModal?.firstName} {balanceModal?.lastName}</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">New Balance ($)</label>
              <input type="number" min="0" step="0.01" value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Reason</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Promotional credit"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setBalanceModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#0A1628', color: '#F0B429' }}>Update</button>
          </div>
        </div>
      </div>
    );
  };

  const AddTransactionModal = () => {
    const [form, setForm] = useState({ userId: '', amount: '', type: 'DEPOSIT', description: '' });
    const save = async () => {
      try {
        await api.post('/admin/transactions/add', form);
        toast.success('Transaction added');
        setAddTxModal(false);
        fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold font-display" style={{ color: '#0A1628' }}>Add Transaction</h3>
            <button onClick={() => setAddTxModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">User ID</label>
              <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="Paste user ID"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none bg-white">
                {['DEPOSIT','WITHDRAWAL','PAYMENT'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
              <input type="number" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Bonus credit"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setAddTxModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#0A1628', color: '#F0B429' }}>Add</button>
          </div>
        </div>
      </div>
    );
  };

  const EditTxModal = () => {
    const [form, setForm] = useState({ amount: editTxModal?.amount || '', status: editTxModal?.status || '', description: editTxModal?.description || '' });
    const save = async () => {
      try {
        await api.put(`/admin/transactions/${editTxModal.id}`, form);
        toast.success('Transaction updated');
        setEditTxModal(null);
        fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold font-display" style={{ color: '#0A1628' }}>Edit Transaction</h3>
            <button onClick={() => setEditTxModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none bg-white">
                {['PENDING','COMPLETED','FAILED','REVERSED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setEditTxModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#0A1628', color: '#F0B429' }}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:flex w-60 flex-col flex-shrink-0 shadow-xl" style={{ background: '#0A1628' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0B429' }}>
              <Shield size={16} style={{ color: '#0A1628' }} />
            </div>
            <div>
              <p className="text-white font-bold font-display">Nova Trust</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === id ? 'nav-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <UserCog size={17} />My Account
          </Link>
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm font-medium">
            <LogOut size={16} />Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 animate-fade-in">

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Admin Overview</h1>
              {dataLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
              ) : stats && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users', value: stats.totalUsers, color: '#6366f1', sub: `${stats.activeUsers} active` },
                      { label: 'Transactions', value: stats.totalTransactions, color: '#F0B429', sub: 'All time' },
                      { label: 'Pending KYC', value: stats.pendingKYC, color: '#f59e0b', sub: 'Needs review' },
                      { label: 'Mobile Deposits', value: stats.pendingMobileDeposits, color: '#06b6d4', sub: 'Pending' },
                    ].map(({ label, value, color, sub }) => (
                      <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-sm text-slate-500 mb-2">{label}</p>
                        <p className="text-3xl font-bold font-display" style={{ color: '#0A1628' }}>{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Deposited', value: stats.totalDeposited, color: '#22c55e' },
                      { label: 'Total Withdrawn', value: stats.totalWithdrawn, color: '#ef4444' },
                      { label: 'Total Transferred', value: stats.totalTransferred, color: '#6366f1' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-sm text-slate-500 mb-1">{label}</p>
                        <p className="text-2xl font-bold font-display" style={{ color }}>${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>User Management</h1>
                <input type="text" placeholder="Search users..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 w-64" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50">
                      {['User', 'Email', 'Account No.', 'Balance', 'Type', 'KYC', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {dataLoading ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="table-row-hover">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#0A1628', color: '#F0B429' }}>
                                {u.firstName?.[0]}{u.lastName?.[0]}
                              </div>
                              <span className="font-medium text-slate-800 whitespace-nowrap">{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.account?.accountNumber}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">${u.account?.balance?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{u.account?.accountType}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.kyc?.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-600'}`}>
                              {u.kyc?.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : u.status === 'FROZEN' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-500'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setEditUserModal(u)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition" title="Edit user">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => setBalanceModal({ id: u.id, firstName: u.firstName, lastName: u.lastName, balance: u.account?.balance })}
                                className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition" title="Edit balance">
                                <DollarSign size={13} />
                              </button>
                              {u.status === 'ACTIVE' ? (
                                <button onClick={() => updateUserStatus(u.id, 'FROZEN')} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Freeze">
                                  <Ban size={13} />
                                </button>
                              ) : (
                                <button onClick={() => updateUserStatus(u.id, 'ACTIVE')} className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition" title="Activate">
                                  <CheckCircle size={13} />
                                </button>
                              )}
                              {u.status !== 'SUSPENDED' && (
                                <button onClick={() => updateUserStatus(u.id, 'SUSPENDED')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition" title="Suspend">
                                  <XCircle size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {tab === 'transactions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Transactions</h1>
                <button onClick={() => setAddTxModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                  style={{ background: '#0A1628', color: '#F0B429' }}>
                  <Plus size={16} />Add Transaction
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50">
                      {['Reference', 'Type', 'Amount', 'From', 'To', 'Flagged', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {dataLoading ? (
                        <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                      ) : transactions.map(tx => (
                        <tr key={tx.id} className="table-row-hover">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.reference?.slice(0, 8)}...</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{tx.type}</span></td>
                          <td className="px-4 py-3 font-bold">${tx.amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{tx.fromAccount?.user ? `${tx.fromAccount.user.firstName} ${tx.fromAccount.user.lastName}` : '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{tx.toAccount?.user ? `${tx.toAccount.user.firstName} ${tx.toAccount.user.lastName}` : '—'}</td>
                          <td className="px-4 py-3">{tx.flagged ? <span className="text-xs text-red-500 font-semibold">⚠ Yes</span> : <span className="text-xs text-green-600">No</span>}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${tx.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : tx.status === 'REVERSED' ? 'bg-purple-50 text-purple-700' : 'bg-yellow-50 text-yellow-600'}`}>{tx.status}</span></td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{format(new Date(tx.createdAt), 'MMM d, HH:mm')}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setEditTxModal(tx)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition" title="Edit">
                                <Edit2 size={13} />
                              </button>
                              {tx.type === 'TRANSFER' && tx.status === 'COMPLETED' && (
                                <button onClick={() => reverseTransaction(tx.id)} className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition" title="Reverse">
                                  <RotateCcw size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE DEPOSITS */}
          {tab === 'deposits' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Mobile Deposits</h1>
              {dataLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
              ) : mobileDeposits.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <Camera size={36} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-slate-600">No mobile deposits</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50">
                        {['User', 'Amount', 'Bank', 'Cheque #', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {mobileDeposits.map(d => (
                          <tr key={d.id} className="table-row-hover">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800">{d.user?.firstName} {d.user?.lastName}</p>
                              <p className="text-xs text-slate-400">{d.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">${d.amount?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{d.bankName || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.chequeNumber || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'APPROVED' ? 'bg-green-50 text-green-700' : d.status === 'REJECTED' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{format(new Date(d.createdAt), 'MMM d, yyyy')}</td>
                            <td className="px-4 py-3">
                              {d.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button onClick={() => reviewDeposit(d.id, 'APPROVED')}
                                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition">
                                    Approve
                                  </button>
                                  <button onClick={() => reviewDeposit(d.id, 'REJECTED')}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition">
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FRAUD FLAGS */}
          {tab === 'fraud' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Fraud Flags</h1>
              {dataLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
              ) : fraudFlags.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
                  <p className="font-bold text-slate-700">No unresolved flags</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fraudFlags.map(flag => (
                    <div key={flag.id} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={18} className="text-red-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-800">{flag.user?.firstName} {flag.user?.lastName}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${flag.severity === 'HIGH' ? 'bg-red-100 text-red-700' : flag.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{flag.severity}</span>
                            </div>
                            <p className="text-sm text-slate-600">{flag.reason}</p>
                            <p className="text-xs text-slate-400 mt-1">{flag.user?.email} • {format(new Date(flag.createdAt), 'MMM d, yyyy HH:mm')}</p>
                          </div>
                        </div>
                        <button onClick={() => resolveFraud(flag.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition flex-shrink-0">
                          <CheckCircle size={13} />Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {editUserModal && <EditUserModal />}
      {balanceModal && <BalanceModal />}
      {addTxModal && <AddTransactionModal />}
      {editTxModal && <EditTxModal />}
    </div>
  );
}
