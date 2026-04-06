'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Send, Plus, Download, Eye, EyeOff, RefreshCw, Landmark, DollarSign, PiggyBank, BarChart2, Zap, Smartphone, Camera, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ACCOUNT_ICONS  = { CHECKING: DollarSign, SAVINGS: PiggyBank, INVESTMENT: BarChart2 };
const ACCOUNT_COLORS = { CHECKING: '#FF6A00',  SAVINGS: '#22c55e', INVESTMENT: '#6366f1'  };

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts]           = useState([]);
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modal, setModal]                 = useState(null); // 'deposit' | 'withdraw'
  const [amount, setAmount]               = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.allSettled([
        api.get('/account'),
        api.get('/transactions?limit=8'),
      ]);

      if (accRes.status === 'fulfilled') {
        const accs = accRes.value.data.data;
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccount(accs[0].id);
      }

      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data.data.transactions || []);
      }
    } catch (err) {
      // Silent fail — don't show error modal on load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try {
      const payload = { amount: parseFloat(amount), accountId: selectedAccount };
      await api.post(`/transactions/${modal}`, payload);
      toast.success(`${modal === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`);
      setModal(null); setAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setActionLoading(false);
    }
  };

  const createAccount = async (type) => {
    setCreatingAccount(type);
    try {
      await api.post('/account', { accountType: type });
      toast.success(`${type} account opened!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  const isCredit = (tx) => {
    const myAccountIds = accounts.map(a => a.id);
    return myAccountIds.includes(tx.toAccountId) || tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' || tx.type === 'MOBILE_DEPOSIT';
  };

  const txColor = (tx) => isCredit(tx) ? '#22c55e' : '#ef4444';
  const txSign  = (tx) => isCredit(tx) ? '+' : '-';
  const txIcon  = (type) => {
    if (type === 'ZELLE')   return <Zap size={13}/>;
    if (type === 'CASHAPP') return <Smartphone size={13}/>;
    if (['DEPOSIT','LOAN_DISBURSEMENT','MOBILE_DEPOSIT'].includes(type)) return <ArrowDownLeft size={13}/>;
    return <ArrowUpRight size={13}/>;
  };

  const accountTypes  = ['CHECKING','SAVINGS','INVESTMENT'];
  const existingTypes = accounts.map(a => a.accountType);
  const missingTypes  = accountTypes.filter(t => !existingTypes.includes(t));

  const ActionModal = () => (
    <div className="modal-wrap">
      <div className="modal">
        <p className="text-xs font-semibold tracking-widest mb-1" style={{color:'#FF6A00'}}>
          {modal === 'deposit' ? 'ADD FUNDS' : 'WITHDRAW FUNDS'}
        </p>
        <h3 className="font-display font-bold text-white text-lg mb-3">
          {modal === 'deposit' ? 'Deposit' : 'Withdraw'}
        </h3>
        {accounts.length > 1 && (
          <div className="mb-3">
            <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{color:'rgba(255,255,255,0.35)'}}>ACCOUNT</label>
            <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="inp px-3 py-3 rounded-xl text-sm">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}
            </select>
          </div>
        )}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span>
          <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
            className="inp pl-9 pr-4 py-4 rounded-xl text-2xl font-bold w-full" placeholder="0.00" autoFocus/>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setModal(null); setAmount(''); }} className="btn-ghost flex-1 py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={handleAction} disabled={actionLoading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
            style={{
              background: modal === 'deposit' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: modal === 'deposit' ? '#4ade80' : '#f87171',
              border: `1px solid ${modal === 'deposit' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
            }}>
            {actionLoading ? <div className="spinner mx-auto" style={{borderTopColor: modal==='deposit'?'#4ade80':'#f87171'}}/> : modal === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-6 lg:p-8 space-y-5">
      {[120, 80, 80, 160].map((h, i) => <div key={i} className="skeleton rounded-2xl" style={{height:h}}/>)}
    </div>
  );

  return (
    <div className="p-5 lg:p-7 space-y-5 anim-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>PRIVATE PORTFOLIO</p>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">Account Overview</h1>
        </div>
        <button onClick={fetchData} className="btn-ghost p-2.5 rounded-xl"><RefreshCw size={15}/></button>
      </div>

      {/* Total Balance Hero */}
      <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#141414 0%,#1a1208 60%,#141414 100%)', border:'1px solid rgba(255,106,0,0.15)', boxShadow:'0 0 60px rgba(255,106,0,0.04)'}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 85% 50%, rgba(255,106,0,0.07) 0%, transparent 55%)'}}/>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 pointer-events-none" style={{background:'#FF6A00', transform:'translate(30%,-30%)'}}/>

        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{color:'rgba(255,255,255,0.3)'}}>TOTAL ASSETS UNDER MANAGEMENT</p>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-display font-bold text-white" style={{fontSize:'clamp(2rem, 5vw, 3.2rem)'}}>
              {balanceVisible ? `$${totalBalance.toLocaleString('en-US',{minimumFractionDigits:2})}` : '•••••••••'}
            </h2>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="mt-1 transition" style={{color:'rgba(255,255,255,0.2)'}}>
              {balanceVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <p className="text-xs mb-6" style={{color:'rgba(255,255,255,0.25)'}}>
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''} · {user?.tier || 'STANDARD'} Client
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {[
              {label:'Deposit',   icon:Plus,      action:()=>setModal('deposit'),  style:{background:'rgba(34,197,94,0.12)', color:'#4ade80',  border:'1px solid rgba(34,197,94,0.2)'}},
              {label:'Withdraw',  icon:Download,  action:()=>setModal('withdraw'), style:{background:'rgba(239,68,68,0.1)',  color:'#f87171',  border:'1px solid rgba(239,68,68,0.15)'}},
              {label:'Transfer',  icon:Send,      href:'/dashboard/transfer',       style:{background:'rgba(255,106,0,0.12)',color:'#FF6A00',  border:'1px solid rgba(255,106,0,0.2)'}},
              {label:'Pay Bills', icon:DollarSign,href:'/dashboard/payments',       style:{background:'rgba(99,102,241,0.12)',color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)'}},
            ].map(({label,icon:Icon,action,href,style}) => {
              const cls = "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5 active:translate-y-0";
              if (href) return <Link key={label} href={href} className={cls} style={style}><Icon size={13}/>{label}</Link>;
              return <button key={label} onClick={action} className={cls} style={style}><Icon size={13}/>{label}</button>;
            })}
          </div>
        </div>
      </div>

      {/* Account breakdown cards */}
      <div>
        <p className="text-xs font-semibold tracking-widest mb-3" style={{color:'rgba(255,255,255,0.25)'}}>ACCOUNT BREAKDOWN</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const Icon  = ACCOUNT_ICONS[acc.accountType]  || DollarSign;
            const color = ACCOUNT_COLORS[acc.accountType] || '#FF6A00';
            const pct   = totalBalance > 0 ? (acc.balance / totalBalance * 100) : 0;
            return (
              <div key={acc.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${color}15`, color}}>
                      <Icon size={17}/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{color:'rgba(255,255,255,0.45)'}}>{acc.accountType}</p>
                      <p className="text-xs font-mono" style={{color:'rgba(255,255,255,0.2)'}}>{acc.accountNumber?.slice(-4).padStart(acc.accountNumber?.length,'•')?.slice(-12)}</p>
                    </div>
                  </div>
                  {acc.interestRate > 0 && (
                    <span className="badge badge-green" style={{fontSize:10}}>{acc.interestRate}% APY</span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-white mb-1">
                  {balanceVisible ? `$${acc.balance.toLocaleString('en-US',{minimumFractionDigits:2})}` : '••••••'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>{pct.toFixed(1)}% of total</p>
                  <span className="badge" style={{fontSize:10, background:acc.isActive?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:acc.isActive?'#4ade80':'#f87171', border:`1px solid ${acc.isActive?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`}}>
                    {acc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 rounded-full overflow-hidden" style={{height:2, background:'rgba(255,255,255,0.06)'}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:color}}/>
                </div>
              </div>
            );
          })}

          {/* Open new account cards */}
          {missingTypes.map(type => {
            const Icon  = ACCOUNT_ICONS[type]  || DollarSign;
            const color = ACCOUNT_COLORS[type] || '#FF6A00';
            return (
              <button key={type} onClick={() => createAccount(type)} disabled={!!creatingAccount}
                className="card p-5 text-left transition hover:-translate-y-0.5 disabled:opacity-40 w-full"
                style={{borderStyle:'dashed'}}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.2)'}}>
                    <Icon size={17}/>
                  </div>
                  <p className="text-xs font-semibold" style={{color:'rgba(255,255,255,0.25)'}}>{type}</p>
                </div>
                <p className="text-sm font-semibold" style={{color:'rgba(255,255,255,0.3)'}}>
                  {creatingAccount === type ? 'Opening...' : '+ Open Account'}
                </p>
                <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.15)'}}>
                  {type === 'SAVINGS' ? '2.5% APY' : type === 'INVESTMENT' ? '7.0% Est. Return' : 'No monthly fees'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions grid */}
      <div>
        <p className="text-xs font-semibold tracking-widest mb-3" style={{color:'rgba(255,255,255,0.25)'}}>QUICK ACTIONS</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            {label:'Transfer',   icon:ArrowLeftRight, href:'/dashboard/transfer',              color:'#FF6A00'},
            {label:'Zelle',      icon:Zap,            href:'/dashboard/payments?tab=zelle',    color:'#7c3aed'},
            {label:'Cash App',   icon:Smartphone,     href:'/dashboard/payments?tab=cashapp',  color:'#16a34a'},
            {label:'Loans',      icon:Landmark,       href:'/dashboard/loans',                 color:'#6366f1'},
            {label:'Pay Bills',  icon:DollarSign,     href:'/dashboard/payments?tab=bills',    color:'#f59e0b'},
            {label:'Deposit',    icon:Camera,         href:'/dashboard/mobile-deposit',         color:'#22c55e'},
          ].map(({label,icon:Icon,href,color}) => (
            <Link key={label} href={href}
              className="card flex flex-col items-center justify-center py-4 gap-2 transition hover:-translate-y-0.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${color}12`, color}}>
                <Icon size={17}/>
              </div>
              <p className="text-xs font-medium" style={{color:'rgba(255,255,255,0.4)'}}>{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions — no chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,255,255,0.25)'}}>RECENT ACTIVITY</p>
          <Link href="/dashboard/transfer" className="text-xs font-semibold" style={{color:'#FF6A00'}}>View all →</Link>
        </div>
        <div className="card overflow-hidden">
          {transactions.length === 0 ? (
            <div className="py-14 text-center" style={{color:'rgba(255,255,255,0.2)'}}>
              <ArrowLeftRight size={28} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div>
              {transactions.map((tx, i) => {
                const credit = isCredit(tx);
                const color  = txColor(tx);
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4" style={{borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${color}12`, color}}>
                      {txIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.description || tx.type}</p>
                      <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>{format(new Date(tx.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{color}}>{txSign(tx)}${tx.amount.toFixed(2)}</p>
                      <span className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>{tx.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modal && <ActionModal/>}
    </div>
  );
}
