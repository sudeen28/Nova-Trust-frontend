'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Send, Plus, Download, Eye, EyeOff, RefreshCw, TrendingUp, Landmark, DollarSign, PiggyBank, BarChart2, Zap, Smartphone, Camera } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chartData = [
  {m:'Aug',i:3200,o:1800},{m:'Sep',i:4100,o:2200},{m:'Oct',i:3800,o:2900},{m:'Nov',i:5200,o:2100},{m:'Dec',i:4600,o:3300},{m:'Jan',i:6100,o:2800},
];

const ACCOUNT_ICONS = { CHECKING: DollarSign, SAVINGS: PiggyBank, INVESTMENT: BarChart2 };
const ACCOUNT_COLORS = { CHECKING: '#FF6A00', SAVINGS: '#22c55e', INVESTMENT: '#6366f1' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([api.get('/account'), api.get('/transactions?limit=8')]);
      setAccounts(accRes.data.data);
      setTransactions(txRes.data.data.transactions);
      if (accRes.data.data.length > 0) setSelectedAccount(accRes.data.data[0].id);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try {
      await api.post(`/transactions/${modal}`, { amount: parseFloat(amount) });
      toast.success(`${modal === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`);
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

  const isCredit = (tx) => tx.toAccount?.userId === user?.id || tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' || tx.type === 'MOBILE_DEPOSIT';
  const txColor = (tx) => isCredit(tx) ? '#22c55e' : '#ef4444';

  const txIcon = (type) => {
    if (type === 'ZELLE') return <Zap size={13}/>;
    if (type === 'CASHAPP') return <Smartphone size={13}/>;
    if (['DEPOSIT','LOAN_DISBURSEMENT','MOBILE_DEPOSIT'].includes(type)) return <ArrowDownLeft size={13}/>;
    return <ArrowUpRight size={13}/>;
  };

  const Modal = () => (
    <div className="modal-wrap">
      <div className="modal">
        <h3 className="font-display font-bold text-white text-lg mb-1">{modal === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
        <p className="text-xs mb-4" style={{color:'rgba(255,255,255,0.35)'}}>Choose account and amount</p>
        {accounts.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-widest mb-1.5" style={{color:'rgba(255,255,255,0.35)'}}>ACCOUNT</label>
            <select value={selectedAccount} onChange={e=>setSelectedAccount(e.target.value)} className="inp px-3 py-3 rounded-xl text-sm">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}
            </select>
          </div>
        )}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{color:'rgba(255,255,255,0.2)'}}>$</span>
          <input type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} className="inp pl-9 pr-4 py-4 text-2xl font-bold rounded-xl" placeholder="0.00" autoFocus/>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{setModal(null);setAmount('');}} className="btn-ghost flex-1 py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={handleAction} disabled={actionLoading} className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
            style={{background: modal==='deposit'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', color: modal==='deposit'?'#4ade80':'#f87171', border:`1px solid ${modal==='deposit'?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}`}}>
            {actionLoading ? <div className="spinner mx-auto" style={{borderTopColor:modal==='deposit'?'#4ade80':'#f87171',borderColor:'rgba(255,255,255,0.2)'}}/> : modal==='deposit'?'Deposit':'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );

  const accountTypes = ['CHECKING','SAVINGS','INVESTMENT'];
  const existingTypes = accounts.map(a => a.accountType);
  const missingTypes = accountTypes.filter(t => !existingTypes.includes(t));

  if (loading) return (
    <div className="p-6 lg:p-8 space-y-5">
      {[100,80,80,200].map((h,i) => <div key={i} className="skeleton" style={{height:h}}/>)}
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
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#141414 0%,#1a1208 55%,#141414 100%)', border:'1px solid rgba(255,106,0,0.15)', boxShadow:'0 0 60px rgba(255,106,0,0.04)'}}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 90% 50%, rgba(255,106,0,0.07) 0%, transparent 55%)', pointerEvents:'none'}}/>
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{color:'rgba(255,255,255,0.3)'}}>TOTAL ASSETS UNDER MANAGEMENT</p>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-5xl font-bold text-white">{balanceVisible ? `$${totalBalance.toLocaleString('en-US',{minimumFractionDigits:2})}` : '•••••••••'}</h2>
            <button onClick={()=>setBalanceVisible(!balanceVisible)} style={{color:'rgba(255,255,255,0.2)'}} className="mt-1 transition hover:text-white">{balanceVisible?<EyeOff size={18}/>:<Eye size={18}/>}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              {label:'Deposit',icon:Plus,action:()=>setModal('deposit'),style:{background:'rgba(34,197,94,0.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.2)'}},
              {label:'Withdraw',icon:Download,action:()=>setModal('withdraw'),style:{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.15)'}},
              {label:'Transfer',icon:Send,href:'/dashboard/transfer',style:{background:'rgba(255,106,0,0.12)',color:'#FF6A00',border:'1px solid rgba(255,106,0,0.2)'}},
              {label:'Pay Bills',icon:DollarSign,href:'/dashboard/payments',style:{background:'rgba(99,102,241,0.12)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.2)'}},
            ].map(({label,icon:Icon,action,href,style})=>{
              const cls="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition hover:-translate-y-0.5";
              if(href) return <Link key={label} href={href} className={cls} style={style}><Icon size={13}/>{label}</Link>;
              return <button key={label} onClick={action} className={cls} style={style}><Icon size={13}/>{label}</button>;
            })}
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const Icon = ACCOUNT_ICONS[acc.accountType] || DollarSign;
          const color = ACCOUNT_COLORS[acc.accountType] || '#FF6A00';
          return (
            <div key={acc.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${color}15`,color}}><Icon size={16}/></div>
                  <div>
                    <p className="text-xs font-semibold" style={{color:'rgba(255,255,255,0.4)'}}>{acc.accountType}</p>
                    <p className="text-xs font-mono" style={{color:'rgba(255,255,255,0.2)'}}>{acc.accountNumber?.slice(-6)}</p>
                  </div>
                </div>
                {acc.interestRate > 0 && <span className="badge badge-green">{acc.interestRate}% APY</span>}
              </div>
              <p className="font-display text-2xl font-bold text-white">{balanceVisible?`$${acc.balance.toLocaleString('en-US',{minimumFractionDigits:2})}`:'••••••'}</p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.25)'}}>{acc.isActive?'Active':'Inactive'}</p>
            </div>
          );
        })}

        {/* Open new accounts */}
        {missingTypes.map(type => {
          const Icon = ACCOUNT_ICONS[type] || DollarSign;
          const color = ACCOUNT_COLORS[type] || '#FF6A00';
          return (
            <button key={type} onClick={()=>createAccount(type)} disabled={!!creatingAccount}
              className="card p-5 text-left transition hover:border-orange-DEFAULT group disabled:opacity-50"
              style={{borderStyle:'dashed'}}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${color}10`,color:'rgba(255,255,255,0.2)'}}><Icon size={16}/></div>
                <p className="text-xs font-semibold" style={{color:'rgba(255,255,255,0.25)'}}>{type}</p>
              </div>
              <p className="text-sm font-semibold" style={{color:'rgba(255,255,255,0.3)'}}>
                {creatingAccount===type?'Creating...':'+ Open Account'}
              </p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.15)'}}>
                {type==='SAVINGS'?'2.5% APY':type==='INVESTMENT'?'7.0% APY':'No fees'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Actions grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {label:'Transfer',icon:ArrowLeftRight,href:'/dashboard/transfer',color:'#FF6A00'},
          {label:'Zelle',icon:Zap,href:'/dashboard/payments?tab=zelle',color:'#6B3FA0'},
          {label:'Cash App',icon:Smartphone,href:'/dashboard/payments?tab=cashapp',color:'#00D632'},
          {label:'Loans',icon:Landmark,href:'/dashboard/loans',color:'#6366f1'},
          {label:'Pay Bills',icon:DollarSign,href:'/dashboard/payments?tab=bills',color:'#f59e0b'},
          {label:'Deposit',icon:Camera,href:'/dashboard/mobile-deposit',color:'#22c55e'},
        ].map(({label,icon:Icon,href,color})=>(
          <Link key={label} href={href} className="card flex flex-col items-center justify-center py-4 gap-2 transition hover:-translate-y-0.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition" style={{background:`${color}12`,color}}><Icon size={17}/></div>
            <p className="text-xs font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,255,255,0.2)'}}>CASH FLOW INSIGHTS</p>
              <h3 className="font-display font-semibold text-white mt-0.5">Income vs Spending</h3>
            </div>
            <span className="badge badge-green"><TrendingUp size={10}/>+18.4%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={8} barGap={4}>
              <XAxis dataKey="m" tick={{fontSize:11,fill:'rgba(255,255,255,0.2)'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,fontSize:12,color:'#fff'}} formatter={(v,n)=>[`$${v.toLocaleString()}`,n==='i'?'Income':'Spending']}/>
              <Bar dataKey="i" fill="rgba(255,106,0,0.7)" radius={[4,4,0,0]}/>
              <Bar dataKey="o" fill="rgba(239,68,68,0.4)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[{label:'Income',color:'rgba(255,106,0,0.7)'},{label:'Spending',color:'rgba(239,68,68,0.5)'}].map(l=>(
              <div key={l.label} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:l.color}}/><p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>{l.label}</p></div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <h3 className="font-display font-semibold text-white text-sm">Recent Activity</h3>
            <Link href="/dashboard/transfer" className="text-xs font-semibold" style={{color:'#FF6A00'}}>All →</Link>
          </div>
          <div className="px-4 py-2">
            {transactions.length === 0 ? (
              <div className="py-10 text-center" style={{color:'rgba(255,255,255,0.2)'}}>
                <ArrowLeftRight size={24} className="mx-auto mb-2 opacity-30"/><p className="text-xs">No activity yet</p>
              </div>
            ) : transactions.map(tx => {
              const credit = isCredit(tx);
              const color = txColor(tx);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${color}12`,color}}>{txIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-white">{tx.description||tx.type}</p>
                    <p className="text-xs" style={{color:'rgba(255,255,255,0.25)'}}>{format(new Date(tx.createdAt),'MMM d')}</p>
                  </div>
                  <p className="text-xs font-semibold flex-shrink-0" style={{color}}>{credit?'+':'-'}${tx.amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && <Modal/>}
    </div>
  );
}
