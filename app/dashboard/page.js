'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Send, Plus,
  Download, Eye, EyeOff, RefreshCw, TrendingUp, Landmark,
  DollarSign, PiggyBank, BarChart2, Zap, Smartphone, Camera, Trash2, Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chartData = [
  {m:'Aug',i:3200,o:1800},{m:'Sep',i:4100,o:2200},{m:'Oct',i:3800,o:2900},
  {m:'Nov',i:5200,o:2100},{m:'Dec',i:4600,o:3300},{m:'Jan',i:6100,o:2800},
];

const ACCOUNT_ICONS  = { CHECKING: DollarSign, SAVINGS: PiggyBank, INVESTMENT: BarChart2 };
const ACCOUNT_COLORS = { CHECKING: '#FF6A00', SAVINGS: '#22c55e', INVESTMENT: '#6366f1' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts]         = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modal, setModal]               = useState(null); // 'withdraw' only now
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false);
  const [amount, setAmount]             = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        api.get('/account'),
        api.get('/transactions?limit=8'),
      ]);
      setAccounts(accRes.data.data);
      setTransactions(txRes.data.data.transactions);
      if (accRes.data.data.length > 0) setSelectedAccount(accRes.data.data[0].id);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try {
      await api.post(`/transactions/withdraw`, { amount: parseFloat(amount) });
      toast.success('Withdrawal successful');
      setModal(null); setAmount(''); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const createAccount = async (type) => {
    setCreatingAccount(type);
    try { await api.post('/account', { accountType: type }); toast.success(`${type} account created!`); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreatingAccount(false); }
  };

  const deleteAccount = async (acc) => {
    if (!confirm(`Remove ${acc.accountType} account (${acc.accountNumber})? Balance must be $0.\n\nThis will not affect transaction history.`)) return;
    try {
      await api.delete(`/account/${acc.id}`);
      toast.success(`${acc.accountType} account removed`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove account'); }
  };

  const isCredit = (tx) => tx.toAccount?.userId === user?.id || ['DEPOSIT','LOAN_DISBURSEMENT','MOBILE_DEPOSIT'].includes(tx.type);

  const txIcon = (type) => {
    const s = { color: 'var(--t3)' };
    if (type === 'ZELLE')    return <Zap size={13} style={s} />;
    if (type === 'CASHAPP')  return <Smartphone size={13} style={s} />;
    if (['DEPOSIT','LOAN_DISBURSEMENT','MOBILE_DEPOSIT'].includes(type)) return <ArrowDownLeft size={13} style={{color:'#22c55e'}} />;
    return <ArrowUpRight size={13} style={{color:'#ef4444'}} />;
  };

  const missingTypes = ['CHECKING','SAVINGS','INVESTMENT'].filter(t => !accounts.find(a => a.accountType === t));

  const Modal = () => (
    <div className="modal-wrap">
      <div className="modal">
        <h3 className="font-display font-bold text-lg mb-1" style={{color:'var(--t1)'}}>Withdraw Funds</h3>
        <p className="text-xs mb-4" style={{color:'var(--t3)'}}>
          Balance: <span style={{color:'var(--t2)'}}>${accounts[0]?.balance?.toFixed(2)}</span>
        </p>
        {accounts.length > 1 && (
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}
            className="inp px-3 py-2.5 rounded-xl text-sm mb-4">
            {accounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}
          </select>
        )}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{color:'var(--t3)'}}>$</span>
          <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
            className="inp pl-10 pr-4 py-4 rounded-xl text-2xl font-bold" placeholder="0.00" autoFocus />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setModal(null); setAmount(''); }} className="btn-ghost flex-1 py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={handleAction} disabled={actionLoading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color:      '#dc2626',
              border:     '1px solid rgba(239,68,68,0.3)',
            }}>
            {actionLoading ? <div className="spinner mx-auto" /> : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Move Money between your own accounts ──────────────────────────────
  const MoveMoneyModal = () => {
    const [fromId, setFromId] = useState(accounts[0]?.id || '');
    const [toId, setToId]     = useState(accounts.find(a => a.id !== accounts[0]?.id)?.id || '');
    const [mAmount, setMAmount] = useState('');
    const [busy, setBusy] = useState(false);

    const fromAcc = accounts.find(a => a.id === fromId);

    const submit = async () => {
      if (!fromId || !toId) return toast.error('Choose both accounts');
      if (fromId === toId) return toast.error('Choose two different accounts');
      if (!mAmount || parseFloat(mAmount) <= 0) return toast.error('Enter a valid amount');
      setBusy(true);
      try {
        await api.post('/transactions/internal-transfer', { fromAccountId: fromId, toAccountId: toId, amount: parseFloat(mAmount) });
        toast.success('Transfer complete');
        setMoveMoneyOpen(false); setMAmount(''); fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      finally { setBusy(false); }
    };

    return (
      <div className="modal-wrap">
        <div className="modal">
          <h3 className="font-display font-bold text-lg mb-1" style={{color:'var(--t1)'}}>Move Money</h3>
          <p className="text-xs mb-4" style={{color:'var(--t3)'}}>Transfer between your own accounts</p>

          <label className="text-xs font-semibold tracking-widest mb-1.5 block" style={{color:'var(--t3)'}}>FROM</label>
          <select value={fromId} onChange={e => setFromId(e.target.value)} className="inp px-3 py-2.5 rounded-xl text-sm mb-3">
            {accounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}
          </select>

          <label className="text-xs font-semibold tracking-widest mb-1.5 block" style={{color:'var(--t3)'}}>TO</label>
          <select value={toId} onChange={e => setToId(e.target.value)} className="inp px-3 py-2.5 rounded-xl text-sm mb-4">
            {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}
          </select>

          <div className="relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{color:'var(--t3)'}}>$</span>
            <input type="number" min="0.01" max={fromAcc?.balance} value={mAmount} onChange={e => setMAmount(e.target.value)}
              className="inp pl-10 pr-4 py-4 rounded-xl text-2xl font-bold" placeholder="0.00" autoFocus />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMoveMoneyOpen(false)} className="btn-ghost flex-1 py-3 rounded-xl text-sm">Cancel</button>
            <button onClick={submit} disabled={busy}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              style={{background:'rgba(255,106,0,0.15)', color:'#FF6A00', border:'1px solid rgba(255,106,0,0.25)'}}>
              {busy ? <div className="spinner mx-auto" /> : 'Transfer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="p-5 lg:p-7 space-y-4">
      {[180, 120, 120, 200].map((h, i) => <div key={i} className="skeleton rounded-2xl" style={{height: h}} />)}
    </div>
  );

  return (
    <div className="p-5 lg:p-7 space-y-5 anim-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest" style={{color:'var(--orange)'}}>
            {(() => {
              const h = new Date().getHours();
              if (h >= 5  && h < 12) return `GOOD MORNING, ${user?.firstName?.toUpperCase()}`;
              if (h >= 12 && h < 17) return `GOOD AFTERNOON, ${user?.firstName?.toUpperCase()}`;
              if (h >= 17 && h < 21) return `GOOD EVENING, ${user?.firstName?.toUpperCase()}`;
              return `GOOD NIGHT, ${user?.firstName?.toUpperCase()}`;
            })()}
          </p>
          <h1 className="font-display text-2xl font-bold mt-0.5" style={{color:'var(--t1)'}}>Account Overview</h1>
        </div>
        <button onClick={fetchData} className="btn-ghost p-2.5 rounded-xl"><RefreshCw size={15}/></button>
      </div>

      {/* Total Balance Hero Card — always dark for readability */}
      <div className="balance-card relative rounded-2xl overflow-hidden p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg,#141414 0%,#1a1208 55%,#141414 100%)',
          border: '1px solid rgba(255,106,0,0.18)',
          boxShadow: '0 0 60px rgba(255,106,0,0.04)',
        }}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 90% 50%, rgba(255,106,0,0.08) 0%, transparent 55%)',pointerEvents:'none'}} />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{color:'rgba(255,255,255,0.4)'}}>TOTAL ASSETS</p>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{color:'#FFFFFF'}}>
              {balanceVisible ? `$${totalBalance.toLocaleString('en-US',{minimumFractionDigits:2})}` : '•••••••••'}
            </h2>
            <button onClick={() => setBalanceVisible(!balanceVisible)} style={{color:'rgba(255,255,255,0.3)'}} className="mt-1">
              {balanceVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/mobile-deposit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5"
              style={{background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)'}}>
              <Camera size={13}/>Deposit
            </Link>
            <button onClick={() => setModal('withdraw')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5"
              style={{background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
              <Download size={13}/>Withdraw
            </button>
            {accounts.length > 1 && (
              <button onClick={() => setMoveMoneyOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5"
                style={{background:'rgba(129,140,248,0.12)', color:'#818cf8', border:'1px solid rgba(129,140,248,0.2)'}}>
                <Repeat size={13}/>Move Money
              </button>
            )}
            <Link href="/dashboard/transfer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5"
              style={{background:'rgba(255,106,0,0.15)', color:'#FF6A00', border:'1px solid rgba(255,106,0,0.25)'}}>
              <Send size={13}/>Transfer
            </Link>
            <Link href="/dashboard/payments"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5"
              style={{background:'rgba(99,102,241,0.12)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)'}}>
              <DollarSign size={13}/>Pay Bills
            </Link>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div>
        <p className="text-xs font-semibold tracking-widest mb-3" style={{color:'var(--t3)'}}>ACCOUNT BREAKDOWN</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const Icon  = ACCOUNT_ICONS[acc.accountType] || DollarSign;
            const color = ACCOUNT_COLORS[acc.accountType] || '#FF6A00';
            return (
              <div key={acc.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${color}18`, color}}>
                      <Icon size={16}/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{color:'var(--t3)'}}>{acc.accountType}</p>
                      <p className="text-xs font-mono" style={{color:'var(--t3)'}}>{acc.accountNumber?.slice(-6)}</p>
                    </div>
                  </div>
                  {acc.interestRate > 0 && <span className="badge badge-green">{acc.interestRate}% APY</span>}
                </div>
                <p className="font-display text-2xl font-bold" style={{color:'var(--t1)'}}>
                  {balanceVisible ? `$${acc.balance.toLocaleString('en-US',{minimumFractionDigits:2})}` : '••••••'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs" style={{color:'var(--t3)'}}>
                    {acc.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-12 rounded-full" style={{background:`${color}40`}}>
                      <div className="h-full rounded-full" style={{width:'70%', background:color}} />
                    </div>
                    {accounts[0]?.id !== acc.id && (
                      <button onClick={() => deleteAccount(acc)}
                        className="p-1 rounded-lg transition"
                        style={{color:'var(--t3)'}}
                        title="Remove account">
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Open new account buttons */}
          {missingTypes.map(type => {
            const Icon  = ACCOUNT_ICONS[type];
            const color = ACCOUNT_COLORS[type];
            return (
              <button key={type} onClick={() => createAccount(type)} disabled={!!creatingAccount}
                className="card p-5 text-left transition hover:-translate-y-0.5 disabled:opacity-50"
                style={{borderStyle:'dashed'}}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${color}10`, color:'var(--t3)'}}>
                    <Icon size={16}/>
                  </div>
                  <p className="text-xs font-semibold" style={{color:'var(--t3)'}}>{type}</p>
                </div>
                <p className="text-sm font-semibold" style={{color:'var(--t3)'}}>
                  {creatingAccount === type ? 'Creating...' : '+ Open Account'}
                </p>
                <p className="text-xs mt-1" style={{color:'var(--t3)'}}>
                  {type === 'SAVINGS' ? '2.5% APY' : type === 'INVESTMENT' ? '7.0% APY' : 'No fees'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold tracking-widest mb-3" style={{color:'var(--t3)'}}>QUICK ACTIONS</p>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {label:'Transfer', icon:ArrowLeftRight, href:'/dashboard/transfer',            color:'#FF6A00'},
            {label:'Zelle',    icon:Zap,            href:'/dashboard/payments?tab=zelle',  color:'#7C3AED'},
            {label:'Cash App', icon:Smartphone,     href:'/dashboard/payments?tab=cashapp',color:'#16a34a'},
            {label:'Loans',    icon:Landmark,       href:'/dashboard/loans',               color:'#6366f1'},
            {label:'Pay Bills',icon:DollarSign,     href:'/dashboard/payments?tab=bills',  color:'#d97706'},
            {label:'Deposit',  icon:Camera,         href:'/dashboard/mobile-deposit',      color:'#0891b2'},
          ].map(({label,icon:Icon,href,color}) => (
            <Link key={label} href={href}
              className="card flex flex-col items-center justify-center py-4 gap-2 transition hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${color}15`, color}}>
                <Icon size={17}/>
              </div>
              <p className="text-xs font-medium" style={{color:'var(--t2)'}}>{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Chart */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold tracking-widest" style={{color:'var(--t3)'}}>CASH FLOW</p>
              <h3 className="font-display font-semibold mt-0.5" style={{color:'var(--t1)'}}>Income vs Spending</h3>
            </div>
            <span className="badge badge-green"><TrendingUp size={10}/>+18.4%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={8} barGap={4}>
              <XAxis dataKey="m" tick={{fontSize:11, fill:'var(--t3)'}} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{background:'var(--s2)', border:'1px solid var(--border)', borderRadius:10, fontSize:12, color:'var(--t1)'}}
                formatter={(v,n) => [`$${v.toLocaleString()}`, n==='i'?'Income':'Spending']}
              />
              <Bar dataKey="i" fill="rgba(255,106,0,0.7)" radius={[4,4,0,0]}/>
              <Bar dataKey="o" fill="rgba(239,68,68,0.4)"  radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[{l:'Income',c:'rgba(255,106,0,0.7)'},{l:'Spending',c:'rgba(239,68,68,0.5)'}].map(x => (
              <div key={x.l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:x.c}}/>
                <p className="text-xs" style={{color:'var(--t3)'}}>{x.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border)'}}>
            <h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Recent Activity</h3>
            <Link href="/dashboard/transfer" className="text-xs font-semibold" style={{color:'var(--orange)'}}>All →</Link>
          </div>
          <div className="px-4 py-2">
            {transactions.length === 0 ? (
              <div className="py-10 text-center" style={{color:'var(--t3)'}}>
                <ArrowLeftRight size={24} className="mx-auto mb-2 opacity-30"/>
                <p className="text-xs">No activity yet</p>
              </div>
            ) : transactions.map(tx => {
              const credit = isCredit(tx);
              const color  = credit ? '#22c55e' : '#ef4444';
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3" style={{borderBottom:'1px solid var(--border)'}}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:credit?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)'}}>
                    {txIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{color:'var(--t1)'}}>{tx.description || tx.type}</p>
                    <p className="text-xs" style={{color:'var(--t3)'}}>{format(new Date(tx.createdAt),'MMM d')}</p>
                  </div>
                  <p className="text-xs font-semibold flex-shrink-0" style={{color}}>{credit?'+':'-'}${tx.amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && <Modal/>}
      {moveMoneyOpen && <MoveMoneyModal/>}
    </div>
  );
}