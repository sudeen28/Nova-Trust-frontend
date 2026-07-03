'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Users, ArrowLeftRight, AlertTriangle, Shield, LogOut, LayoutDashboard, Camera, Landmark, Zap, Smartphone, FileText, Search, Plus, Edit2, Trash2, RotateCcw, DollarSign, X, Save, Check, XCircle, Menu, Key, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const Badge = ({children,type='gray'})=><span className={`badge badge-${type}`}>{children}</span>;
const Spinner = ()=><div className="spinner mx-auto"/>;

const Modal = ({title,onClose,children,wide=false})=>(
  <div className="modal-wrap" style={{zIndex:200}}>
    <div style={{
      background:'var(--s2)',
      border:'1px solid var(--border)',
      borderRadius:20,
      width:'100%',
      maxWidth:wide?680:440,
      maxHeight:'90vh',
      display:'flex',
      flexDirection:'column',
      overflow:'hidden',
    }}>
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{borderBottom:'1px solid var(--border)'}}>
        <h3 className="font-display font-bold text-base" style={{color:'var(--t1)'}}>{title}</h3>
        <button onClick={onClose} style={{color:'var(--t3)'}} className="transition p-1 rounded-lg"><X size={18}/></button>
      </div>
      <div className="overflow-y-auto px-6 py-5 flex-1">
        {children}
      </div>
    </div>
  </div>
);

const lc = "block text-xs font-semibold tracking-widest mb-1.5";
const ls = {color:'var(--t3)'};
const ic = "inp px-3 py-2.5 rounded-xl text-sm";
const ic2 = "inp px-3 py-2 rounded-lg text-xs";

const TX_TYPES = ['DEPOSIT','WITHDRAWAL','TRANSFER','PAYMENT','ZELLE','CASHAPP','BILL_PAYMENT','LOAN_DISBURSEMENT','LOAN_REPAYMENT','MOBILE_DEPOSIT'];

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({stats:null,users:[],transactions:[],loans:[],cards:[],deposits:[],fraud:[],logs:[]});
  const [dloading, setDloading] = useState(true);
  const [search, setSearch] = useState('');
  const [txFilters, setTxFilters] = useState({type:'',status:'',startDate:'',endDate:'',minAmount:'',maxAmount:'',userId:''});
  const [sideOpen, setSideOpen] = useState(false);

  // Modals
  const [editUser, setEditUser] = useState(null);
  const [balanceModal, setBalanceModal] = useState(null);
  const [addTxModal, setAddTxModal] = useState(null);
  const [editTxModal, setEditTxModal] = useState(null);
  const [bulkTxModal, setBulkTxModal] = useState(null);
  const [createAccModal, setCreateAccModal] = useState(null);
  const [zelleModal, setZelleModal] = useState(null);
  const [cashModal, setCashModal] = useState(null);
  const [loanModal, setLoanModal] = useState(null);
  const [createLoanModal, setCreateLoanModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPassModal, setResetPassModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(()=>{ if(!loading&&(!user||user.role!=='ADMIN')) router.push('/login'); },[user,loading,router]);
  useEffect(()=>{ if(user?.role==='ADMIN') fetchData(); },[user,tab]);

  const fetchData = useCallback(async()=>{
    setDloading(true);
    try{
      if(tab==='dashboard'){
        const r = await api.get('/admin/dashboard');
        setData(p=>({...p,stats:r.data.data.stats,transactions:r.data.data.recentTransactions,users:r.data.data.recentUsers}));
      } else if(tab==='users'){
        const r = await api.get(`/admin/users?limit=30${search?`&search=${search}`:''}`);
        setData(p=>({...p,users:r.data.data.users}));
      } else if(tab==='transactions'){
        const params = new URLSearchParams({limit:30,...Object.fromEntries(Object.entries(txFilters).filter(([,v])=>v))});
        const r = await api.get(`/admin/transactions?${params}`);
        setData(p=>({...p,transactions:r.data.data.transactions}));
      } else if(tab==='loans'){
        const r = await api.get('/admin/loans');
        setData(p=>({...p,loans:r.data.data}));
      } else if(tab==='deposits'){
        const r = await api.get('/admin/mobile-deposits');
        setData(p=>({...p,deposits:r.data.data}));
      } else if(tab==='cards'){
        const r = await api.get('/cards/admin/all');
        setData(p=>({...p,cards:r.data.data}));
      } else if(tab==='fraud'){
        const r = await api.get('/admin/fraud-flags');
        setData(p=>({...p,fraud:r.data.data}));
      } else if(tab==='logs'){
        const r = await api.get('/admin/logs');
        setData(p=>({...p,logs:r.data.data}));
      }
    }catch{ toast.error('Failed to load'); }
    finally{ setDloading(false); }
  },[tab,search,txFilters]);

  const openUser = async(id)=>{
    try{ const r = await api.get(`/admin/users/${id}`); setSelectedUser(r.data.data); setTab('userdetail'); }
    catch{ toast.error('Failed to load user'); }
  };

  const action = async(fn,msg)=>{ try{ await fn(); toast.success(msg); fetchData(); }catch(err){ toast.error(err.response?.data?.message||'Failed'); } };

  if(loading||!user) return <div className="min-h-screen flex items-center justify-center" style={{background:'#0B0B0B'}}><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'#FF6A00',borderTopColor:'transparent'}}/></div>;

  const navItems = [
    {id:'dashboard',icon:LayoutDashboard,label:'Overview'},
    {id:'users',icon:Users,label:'Users'},
    {id:'transactions',icon:ArrowLeftRight,label:'Transactions'},
    {id:'loans',icon:Landmark,label:'Loans'},
    {id:'cards',icon:CreditCard,label:'Cards'},
    {id:'deposits',icon:Camera,label:'Deposits'},
    {id:'fraud',icon:AlertTriangle,label:'Fraud'},
    {id:'logs',icon:FileText,label:'Audit Log'},
  ];

  const quickLinks = [
    {href:'/admin/setup-account', label:'⚡ Setup Account',  color:'#FF6A00'},
    {href:'/admin/cards',         label:'💳 Virtual Cards',  color:'var(--t2)'},
    {href:'/admin/notifications', label:'🔔 Notifications',  color:'var(--t2)'},
  ];

  const Sidebar = ()=>(
    <div className="flex flex-col h-full" style={{background:'#0F0F0F',borderRight:'1px solid var(--border)'}}>
      <div className="px-4 py-5 flex items-center gap-3" style={{borderBottom:'1px solid var(--border)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={16} color="#000"/></div>
        <div><p className="font-display font-bold text-white text-sm">NOVA TRUST</p><p className="text-xs" style={{color:'var(--t3)'}}>Admin Console</p></div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({id,icon:Icon,label})=>(
          <button key={id} onClick={()=>{setTab(id);setSideOpen(false);}} className={`nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${tab===id||tab==='userdetail'&&id==='users'?'active':''}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
        <div className="divider my-3"/>
        <p className="text-xs font-semibold px-3 mb-2" style={{color:'var(--t3)',letterSpacing:'0.08em'}}>QUICK LINKS</p>
        {quickLinks.map(l=>(
          <Link key={l.href} href={l.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{color:l.color, textDecoration:'none'}}>
            {l.label}
          </Link>
        ))}
        <div className="divider my-3"/>
        <Link href="/dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"><Users size={15}/>My Account</Link>
      </nav>
      <div className="px-3 py-4" style={{borderTop:'1px solid var(--border)'}}>
        <div className="px-3 py-2 mb-2 rounded-xl" style={{background:'var(--s3)'}}>
          <p className="text-xs font-semibold" style={{color:'var(--t1)'}}>{user?.firstName} {user?.lastName}</p>
          <p className="text-xs" style={{color:'var(--t3)'}}>Administrator</p>
        </div>
        <button onClick={async()=>{await logout();router.push('/login');}} className="btn-ghost w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium"><LogOut size={13}/>Sign out</button>
      </div>
    </div>
  );

  // ── MODALS ────────────────────────────────────────────────────────

  const EditUserModal = ()=>{
    const [f,setF] = useState({...editUser,adminNotes:editUser?.adminNotes||''});
    const save = ()=>action(()=>api.put(`/admin/users/${f.id}`,f),'User updated').then(()=>setEditUser(null));
    return (
      <Modal title="Edit User" onClose={()=>setEditUser(null)} wide>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[['FIRST NAME','firstName'],['LAST NAME','lastName'],['EMAIL','email','email'],['PHONE','phone'],['ADDRESS','address'],['CITY','city'],['COUNTRY','country']].map(([l,k,t='text'])=>(
            <div key={k} className={k==='address'||k==='email'?'col-span-2':''}>
              <label className={lc} style={ls}>{l}</label>
              <input type={t} value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})} className={ic}/>
            </div>
          ))}
          <div><label className={lc} style={ls}>STATUS</label>
            <select value={f.status||'ACTIVE'} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
              {['ACTIVE','SUSPENDED','FROZEN','CLOSED'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lc} style={ls}>TIER</label>
            <select value={f.tier||'STANDARD'} onChange={e=>setF({...f,tier:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
              {['STANDARD','ELITE','PRIVATE','VIP'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lc} style={ls}>ROLE</label>
            <select value={f.role||'USER'} onChange={e=>setF({...f,role:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
              {['USER','ADMIN'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4"><label className={lc} style={ls}>ADMIN NOTES (PRIVATE)</label>
          <textarea value={f.adminNotes} onChange={e=>setF({...f,adminNotes:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm w-full" rows={3} placeholder="Internal notes not visible to user..."/>
        </div>
        <div className="flex gap-3"><button onClick={()=>setEditUser(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Save size={13}/>Save</button></div>
      </Modal>
    );
  };

  const BalanceModal = ()=>{
    const [bal,setBal] = useState(balanceModal?.balance||'');
    const [reason,setReason] = useState('');
    const [accId,setAccId] = useState(balanceModal?.accountId||'');
    const save = ()=>action(()=>api.patch(`/admin/users/${balanceModal.userId}/balance`,{balance:bal,reason,accountId:accId}),'Balance updated').then(()=>setBalanceModal(null));
    return (
      <Modal title="Edit Balance" onClose={()=>setBalanceModal(null)}>
        <p className="text-xs mb-4" style={{color:'rgba(255,255,255,0.35)'}}>{balanceModal?.name}</p>
        {balanceModal?.accounts?.length>1&&<div className="mb-3"><label className={lc} style={ls}>ACCOUNT</label><select value={accId} onChange={e=>setAccId(e.target.value)} className="inp px-3 py-2.5 rounded-xl text-sm">{balanceModal.accounts.map(a=><option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}</select></div>}
        <div className="mb-3"><label className={lc} style={ls}>NEW BALANCE ($)</label><input type="number" min="0" step="0.01" value={bal} onChange={e=>setBal(e.target.value)} className="inp px-4 py-4 rounded-xl text-2xl font-bold"/></div>
        <div className="mb-4"><label className={lc} style={ls}>REASON</label><input type="text" value={reason} onChange={e=>setReason(e.target.value)} className={ic} placeholder="Reason for adjustment"/></div>
        <div className="flex gap-3"><button onClick={()=>setBalanceModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Update</button></div>
      </Modal>
    );
  };

  const AddTxModal = ()=>{
    const [f,setF] = useState({userId:'',accountId:'',type:'DEPOSIT',amount:'',description:'',status:'COMPLETED',createdAt:''});
    const [userAccounts,setUserAccounts] = useState([]);
    const loadAccounts = async(uid)=>{ if(!uid) return; try{ const r=await api.get(`/admin/users/${uid}`); setUserAccounts(r.data.data.accounts||[]); if(r.data.data.accounts?.[0]) setF(p=>({...p,accountId:r.data.data.accounts[0].id})); }catch{} };
    const save = ()=>action(()=>api.post('/admin/transactions',f),'Transaction created').then(()=>setAddTxModal(false));
    return (
      <Modal title="Add Transaction" onClose={()=>setAddTxModal(false)} wide>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2"><label className={lc} style={ls}>USER ID</label><div className="flex gap-2"><input type="text" value={f.userId} onChange={e=>setF({...f,userId:e.target.value})} className={`${ic} flex-1`} placeholder="Paste user ID"/><button onClick={()=>loadAccounts(f.userId)} className="btn-ghost px-3 py-2.5 rounded-xl text-xs">Load</button></div></div>
          {userAccounts.length>0&&<div className="col-span-2"><label className={lc} style={ls}>ACCOUNT</label><select value={f.accountId} onChange={e=>setF({...f,accountId:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{userAccounts.map(a=><option key={a.id} value={a.id}>{a.accountType} — ${a.balance.toFixed(2)}</option>)}</select></div>}
          <div><label className={lc} style={ls}>TYPE</label><select value={f.type} onChange={e=>setF({...f,type:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{TX_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className={lc} style={ls}>STATUS</label><select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{['COMPLETED','PENDING','FAILED'].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className={lc} style={ls}>AMOUNT ($)</label><input type="number" min="0.01" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder="0.00"/></div>
          <div><label className={lc} style={ls}>DATE (OPTIONAL)</label><input type="datetime-local" value={f.createdAt} onChange={e=>setF({...f,createdAt:e.target.value})} className={ic}/></div>
          <div className="col-span-2"><label className={lc} style={ls}>DESCRIPTION</label><input type="text" value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={ic} placeholder="Transaction note"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setAddTxModal(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Plus size={13}/>Create</button></div>
      </Modal>
    );
  };

  // Fixed: api.patch (not api.put)
  const EditTxModal = ()=>{
    const [f,setF] = useState({amount:editTxModal?.amount||'',type:editTxModal?.type||'',status:editTxModal?.status||'',description:editTxModal?.description||'',date:''});
    const save = ()=>action(()=>api.patch(`/admin/transactions/${editTxModal.id}`,f),'Updated').then(()=>setEditTxModal(null));
    return (
      <Modal title="Edit Transaction" onClose={()=>setEditTxModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>TYPE</label><select value={f.type} onChange={e=>setF({...f,type:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{TX_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className={lc} style={ls}>AMOUNT ($)</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic}/></div>
          <div><label className={lc} style={ls}>STATUS</label><select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{['PENDING','COMPLETED','FAILED','REVERSED'].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className={lc} style={ls}>DESCRIPTION</label><input type="text" value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={ic}/></div>
          <div><label className={lc} style={ls}>DATE OVERRIDE</label><input type="datetime-local" value={f.date} onChange={e=>setF({...f,date:e.target.value})} className={ic}/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setEditTxModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Save</button></div>
      </Modal>
    );
  };

  // ── BULK TX MODAL ────────────────────────────────────────────────
  const BulkTxModal = ()=>{
    const emptyRow = ()=>({type:'DEPOSIT',amount:'',description:'',date:'',reference:''});
    const [mode,setMode] = useState('manual'); // 'manual' | 'generate'
    const [userId,setUserId] = useState(bulkTxModal?.userId||'');
    const [rows,setRows] = useState([emptyRow()]);
    const [gen,setGen] = useState({
      startDate:'', endDate:'',
      minCount:5, maxCount:15,
      minAmount:10, maxAmount:2000,
      status:'COMPLETED',
      types:[...TX_TYPES],
    });
    const [result,setResult] = useState(null);
    const [saving,setSaving] = useState(false);

    const addRow = ()=>setRows(r=>[...r,emptyRow()]);
    const removeRow = i=>setRows(r=>r.filter((_,idx)=>idx!==i));
    const updateRow = (i,key,val)=>setRows(r=>r.map((row,idx)=>idx===i?{...row,[key]:val}:row));

    const toggleGenType = (t)=>setGen(g=>({
      ...g,
      types: g.types.includes(t) ? g.types.filter(x=>x!==t) : [...g.types,t],
    }));

    const submitManual = async()=>{
      if(!userId) return toast.error('User ID is required');
      const transactions = rows
        .filter(r=>r.amount&&r.type)
        .map(r=>({
          type:r.type,
          amount:parseFloat(r.amount),
          ...(r.description&&{description:r.description}),
          ...(r.date&&{date:r.date}),
          ...(r.reference&&{reference:r.reference}),
        }));
      if(!transactions.length) return toast.error('Add at least one transaction with an amount');
      setSaving(true);
      try{
        const res = await api.post(`/admin/users/${userId}/transactions/bulk`,{transactions});
        setResult(res.data);
        toast.success(`${res.data.summary.created} of ${res.data.summary.total} created`);
        fetchData();
      }catch(err){
        toast.error(err.response?.data?.message||'Failed');
      }finally{
        setSaving(false);
      }
    };

    const submitGenerate = async()=>{
      if(!userId) return toast.error('User ID is required');
      if(!gen.startDate||!gen.endDate) return toast.error('Start and end date are required');
      if(new Date(gen.startDate) > new Date(gen.endDate)) return toast.error('Start date must be before end date');
      if(!gen.types.length) return toast.error('Select at least one transaction type');
      const minC = parseInt(gen.minCount), maxC = parseInt(gen.maxCount);
      if(!minC||!maxC||minC<1||maxC<minC) return toast.error('Check min/max count');
      setSaving(true);
      try{
        const res = await api.post(`/admin/users/${userId}/transactions/generate-demo`,{
          startDate:gen.startDate,
          endDate:gen.endDate,
          minCount:minC,
          maxCount:maxC,
          minAmount:parseFloat(gen.minAmount),
          maxAmount:parseFloat(gen.maxAmount),
          status:gen.status,
          types:gen.types,
        });
        setResult(res.data);
        toast.success(`${res.data.summary.created} of ${res.data.summary.total} demo transactions created`);
        fetchData();
      }catch(err){
        toast.error(err.response?.data?.message||'Failed');
      }finally{
        setSaving(false);
      }
    };

    const filledCount = rows.filter(r=>r.amount).length;

    if(result) return (
      <Modal title="Bulk Create Results" onClose={()=>setBulkTxModal(null)} wide>
        <div className="grid grid-cols-3 gap-4 text-center mb-5 p-4 rounded-xl" style={{background:'var(--s3)',border:'1px solid var(--border)'}}>
          <div><p className="font-display text-3xl font-bold text-white">{result.summary.total}</p><p className="text-xs mt-1" style={{color:'var(--t3)'}}>TOTAL</p></div>
          <div><p className="font-display text-3xl font-bold" style={{color:'#4ade80'}}>{result.summary.created}</p><p className="text-xs mt-1" style={{color:'var(--t3)'}}>CREATED</p></div>
          <div><p className="font-display text-3xl font-bold" style={{color:result.summary.failed>0?'#f87171':'var(--t3)'}}>{result.summary.failed}</p><p className="text-xs mt-1" style={{color:'var(--t3)'}}>FAILED</p></div>
        </div>
        {result.failed?.length>0&&(
          <div className="mb-4">
            <p className="text-xs font-semibold tracking-widest mb-2" style={{color:'#f87171'}}>FAILED ROWS</p>
            <div className="space-y-2">
              {result.failed.map((f,i)=>(
                <div key={i} className="px-3 py-2 rounded-xl text-xs flex items-start gap-2" style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',color:'#f87171'}}>
                  <span className="font-bold flex-shrink-0">{f.index!==undefined?`Row ${f.index+1}:`:''}</span>
                  <span>{f.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={()=>setBulkTxModal(null)} className="btn-primary w-full py-2.5 rounded-xl text-sm">Done</button>
      </Modal>
    );

    return (
      <Modal title="Bulk Add Transactions" onClose={()=>setBulkTxModal(null)} wide>
        <div className="mb-4">
          <label className={lc} style={ls}>USER ID</label>
          <input type="text" value={userId} onChange={e=>setUserId(e.target.value)} className={ic} placeholder="Paste user ID"/>
        </div>

        <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{background:'var(--s3)',border:'1px solid var(--border)'}}>
          <button onClick={()=>setMode('manual')} className="flex-1 py-2 rounded-lg text-xs font-semibold transition" style={mode==='manual'?{background:'#FF6A00',color:'#000'}:{color:'var(--t2)'}}>Manual Rows</button>
          <button onClick={()=>setMode('generate')} className="flex-1 py-2 rounded-lg text-xs font-semibold transition" style={mode==='generate'?{background:'#FF6A00',color:'#000'}:{color:'var(--t2)'}}>Generate Demo Data</button>
        </div>

        {mode==='manual'?(
          <>
            <div className="space-y-2 mb-3" style={{maxHeight:360,overflowY:'auto'}}>
              {rows.map((row,i)=>(
                <div key={i} className="p-3 rounded-xl" style={{background:'var(--s3)',border:'1px solid var(--border)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold" style={{color:'var(--t3)'}}>ROW {i+1}</p>
                    {rows.length>1&&<button onClick={()=>removeRow(i)} className="p-1 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}}><X size={11}/></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={lc} style={ls}>TYPE</label>
                      <select value={row.type} onChange={e=>updateRow(i,'type',e.target.value)} className="inp px-2 py-2 rounded-lg text-xs">
                        {TX_TYPES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lc} style={ls}>AMOUNT ($) *</label>
                      <input type="number" min="0.01" value={row.amount} onChange={e=>updateRow(i,'amount',e.target.value)} className={ic2} placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={lc} style={ls}>DESCRIPTION</label>
                      <input type="text" value={row.description} onChange={e=>updateRow(i,'description',e.target.value)} className={ic2} placeholder="Note"/>
                    </div>
                    <div>
                      <label className={lc} style={ls}>DATE</label>
                      <input type="datetime-local" value={row.date} onChange={e=>updateRow(i,'date',e.target.value)} className={ic2}/>
                    </div>
                  </div>
                  <div>
                    <label className={lc} style={ls}>REFERENCE (OPTIONAL — auto-generated if blank)</label>
                    <input type="text" value={row.reference} onChange={e=>updateRow(i,'reference',e.target.value)} className={ic2} placeholder="e.g. PAY-001"/>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addRow} className="btn-ghost w-full py-2 rounded-xl text-xs mb-4 flex items-center justify-center gap-2">
              <Plus size={12}/>Add Another Row
            </button>

            <div className="flex gap-3">
              <button onClick={()=>setBulkTxModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={submitManual} disabled={saving} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving?'Creating...':<><Check size={13}/>Create {filledCount||rows.length} Tx</>}
              </button>
            </div>
          </>
        ):(
          <>
            <div className="p-3 rounded-xl mb-4 text-xs" style={{background:'rgba(255,106,0,0.06)',border:'1px solid rgba(255,106,0,0.15)',color:'rgba(255,106,0,0.85)'}}>
              Randomly generates a batch of transactions spread across the date range below — for populating demo/staging accounts with realistic-looking history.
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={lc} style={ls}>FROM DATE</label><input type="date" value={gen.startDate} onChange={e=>setGen({...gen,startDate:e.target.value})} className={ic}/></div>
              <div><label className={lc} style={ls}>TO DATE</label><input type="date" value={gen.endDate} onChange={e=>setGen({...gen,endDate:e.target.value})} className={ic}/></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={lc} style={ls}>MIN COUNT</label><input type="number" min="1" value={gen.minCount} onChange={e=>setGen({...gen,minCount:e.target.value})} className={ic}/></div>
              <div><label className={lc} style={ls}>MAX COUNT (≤500)</label><input type="number" min="1" max="500" value={gen.maxCount} onChange={e=>setGen({...gen,maxCount:e.target.value})} className={ic}/></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={lc} style={ls}>MIN AMOUNT ($)</label><input type="number" min="0.01" value={gen.minAmount} onChange={e=>setGen({...gen,minAmount:e.target.value})} className={ic}/></div>
              <div><label className={lc} style={ls}>MAX AMOUNT ($)</label><input type="number" min="0.01" value={gen.maxAmount} onChange={e=>setGen({...gen,maxAmount:e.target.value})} className={ic}/></div>
            </div>

            <div className="mb-3"><label className={lc} style={ls}>STATUS</label>
              <select value={gen.status} onChange={e=>setGen({...gen,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
                {['COMPLETED','PENDING'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className={lc} style={ls}>TRANSACTION TYPES TO INCLUDE</label>
              <div className="flex flex-wrap gap-2">
                {TX_TYPES.map(t=>(
                  <button key={t} onClick={()=>toggleGenType(t)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition" style={gen.types.includes(t)?{background:'rgba(255,106,0,0.15)',color:'#FF6A00',border:'1px solid rgba(255,106,0,0.3)'}:{background:'var(--s3)',color:'var(--t3)',border:'1px solid var(--border)'}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={()=>setBulkTxModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={submitGenerate} disabled={saving} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving?'Generating...':<><Zap size={13}/>Generate Demo Data</>}
              </button>
            </div>
          </>
        )}
      </Modal>
    );
  };

  const ZelleModal = ()=>{
    const [f,setF] = useState({userId:zelleModal?.userId||'',amount:'',direction:'SENT',recipientEmail:'',recipientPhone:'',recipientName:'',memo:''});
    const save = ()=>action(()=>api.post('/admin/zelle',f),'Zelle created').then(()=>setZelleModal(null));
    return (
      <Modal title="Add Zelle Transfer" onClose={()=>setZelleModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>USER ID</label><input type="text" value={f.userId} onChange={e=>setF({...f,userId:e.target.value})} className={ic} placeholder="User ID"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lc} style={ls}>DIRECTION</label><select value={f.direction} onChange={e=>setF({...f,direction:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm"><option value="SENT">SENT</option><option value="RECEIVED">RECEIVED</option></select></div>
            <div><label className={lc} style={ls}>AMOUNT</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder="0.00"/></div>
          </div>
          <div><label className={lc} style={ls}>RECIPIENT</label><input type="text" value={f.recipientName} onChange={e=>setF({...f,recipientName:e.target.value})} className={ic} placeholder="Name"/></div>
          <div><label className={lc} style={ls}>EMAIL/PHONE</label><input type="text" value={f.recipientEmail} onChange={e=>setF({...f,recipientEmail:e.target.value})} className={ic} placeholder="email@example.com"/></div>
          <div><label className={lc} style={ls}>MEMO</label><input type="text" value={f.memo} onChange={e=>setF({...f,memo:e.target.value})} className={ic} placeholder="Note"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setZelleModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Zap size={13}/>Create</button></div>
      </Modal>
    );
  };

  const CashModal = ()=>{
    const [f,setF] = useState({userId:cashModal?.userId||'',amount:'',direction:'SENT',cashtag:'',recipientName:'',note:''});
    const save = ()=>action(()=>api.post('/admin/cashapp',f),'CashApp created').then(()=>setCashModal(null));
    return (
      <Modal title="Add Cash App Transfer" onClose={()=>setCashModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>USER ID</label><input type="text" value={f.userId} onChange={e=>setF({...f,userId:e.target.value})} className={ic} placeholder="User ID"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lc} style={ls}>DIRECTION</label><select value={f.direction} onChange={e=>setF({...f,direction:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm"><option value="SENT">SENT</option><option value="RECEIVED">RECEIVED</option></select></div>
            <div><label className={lc} style={ls}>AMOUNT</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder="0.00"/></div>
          </div>
          <div><label className={lc} style={ls}>$CASHTAG</label><input type="text" value={f.cashtag} onChange={e=>setF({...f,cashtag:e.target.value})} className={ic} placeholder="$cashtag"/></div>
          <div><label className={lc} style={ls}>NAME</label><input type="text" value={f.recipientName} onChange={e=>setF({...f,recipientName:e.target.value})} className={ic} placeholder="Full name"/></div>
          <div><label className={lc} style={ls}>NOTE</label><input type="text" value={f.note} onChange={e=>setF({...f,note:e.target.value})} className={ic} placeholder="Note"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setCashModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Smartphone size={13}/>Create</button></div>
      </Modal>
    );
  };

  const LoanModal = ()=>{
    const [f,setF] = useState({
      status:loanModal?.status||'PENDING',
      amount:loanModal?.amount||'',
      interestRate:loanModal?.interestRate??8.5,
      termMonths:loanModal?.termMonths||12,
      amountRepaid:loanModal?.amountRepaid??0,
      purpose:loanModal?.purpose||'',
      rejectionReason:'',
      approvedAt:'',
      nextPaymentDate:'',
    });
    const save = ()=>action(()=>api.patch(`/admin/loans/${loanModal.id}`,f),`Loan updated`).then(()=>{
      setLoanModal(null);
      if(tab==='userdetail'&&selectedUser?.id===loanModal.userId) openUser(selectedUser.id);
    });
    return (
      <Modal title="Edit Loan" onClose={()=>setLoanModal(null)}>
        <div className="p-3 rounded-xl mb-4" style={{background:'var(--s3)',border:'1px solid var(--border)'}}>
          <p className="text-xs text-white font-semibold">{loanModal?.user?.firstName} {loanModal?.user?.lastName}</p>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.35)'}}>Current: ${loanModal?.amount?.toLocaleString()} • {loanModal?.purpose||'No purpose given'}</p>
        </div>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>STATUS</label>
            <select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAID">PAID</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={lc} style={ls}>AMOUNT</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic}/></div>
            <div><label className={lc} style={ls}>RATE %</label><input type="number" step="0.1" value={f.interestRate} onChange={e=>setF({...f,interestRate:e.target.value})} className={ic}/></div>
            <div><label className={lc} style={ls}>MONTHS</label><input type="number" value={f.termMonths} onChange={e=>setF({...f,termMonths:e.target.value})} className={ic}/></div>
          </div>
          {f.status==='PAID'&&(
            <div><label className={lc} style={ls}>AMOUNT REPAID ($) — leave blank to mark fully repaid</label><input type="number" value={f.amountRepaid} onChange={e=>setF({...f,amountRepaid:e.target.value})} className={ic} placeholder="Full amount"/></div>
          )}
          {f.status!=='PAID'&&(
            <div><label className={lc} style={ls}>AMOUNT REPAID SO FAR ($)</label><input type="number" value={f.amountRepaid} onChange={e=>setF({...f,amountRepaid:e.target.value})} className={ic}/></div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lc} style={ls}>APPROVAL DATE</label><input type="datetime-local" value={f.approvedAt} onChange={e=>setF({...f,approvedAt:e.target.value})} className={ic}/></div>
            <div><label className={lc} style={ls}>NEXT PAYMENT DATE</label><input type="datetime-local" value={f.nextPaymentDate} onChange={e=>setF({...f,nextPaymentDate:e.target.value})} className={ic}/></div>
          </div>
          <div><label className={lc} style={ls}>PURPOSE</label><input type="text" value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} className={ic}/></div>
          {f.status==='REJECTED'&&<div><label className={lc} style={ls}>REJECTION REASON</label><input type="text" value={f.rejectionReason} onChange={e=>setF({...f,rejectionReason:e.target.value})} className={ic} placeholder="Reason for rejection"/></div>}
        </div>
        <div className="flex gap-3"><button onClick={()=>setLoanModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Save size={13}/>Save</button></div>
      </Modal>
    );
  };

  const CreateLoanModal = ()=>{
    const [f,setF] = useState({
      amount:'', interestRate:8.5, termMonths:12, purpose:'',
      status:'PENDING', approvedAt:'', nextPaymentDate:'',
    });
    const save = ()=>action(()=>api.post(`/admin/users/${createLoanModal.userId}/loans`,f),'Loan created').then(()=>{
      setCreateLoanModal(null);
      if(tab==='userdetail'&&selectedUser?.id===createLoanModal.userId) openUser(selectedUser.id);
    });
    return (
      <Modal title="Create Loan" onClose={()=>setCreateLoanModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>STATUS</label>
            <select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={lc} style={ls}>AMOUNT ($)</label><input type="number" min="0.01" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder="0.00"/></div>
            <div><label className={lc} style={ls}>RATE %</label><input type="number" step="0.1" value={f.interestRate} onChange={e=>setF({...f,interestRate:e.target.value})} className={ic}/></div>
            <div><label className={lc} style={ls}>MONTHS</label><input type="number" value={f.termMonths} onChange={e=>setF({...f,termMonths:e.target.value})} className={ic}/></div>
          </div>
          {f.status==='ACTIVE'&&<div><label className={lc} style={ls}>APPROVAL DATE (OPTIONAL — defaults to now)</label><input type="datetime-local" value={f.approvedAt} onChange={e=>setF({...f,approvedAt:e.target.value})} className={ic}/></div>}
          <div><label className={lc} style={ls}>NEXT PAYMENT DATE</label><input type="datetime-local" value={f.nextPaymentDate} onChange={e=>setF({...f,nextPaymentDate:e.target.value})} className={ic}/></div>
          <div><label className={lc} style={ls}>PURPOSE</label><input type="text" value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})} className={ic} placeholder="e.g. Home renovation"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setCreateLoanModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Plus size={13}/>Create Loan</button></div>
      </Modal>
    );
  };

  const ResetPasswordModal = ({user, onClose, onDone}) => {
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async() => {
      if (pass.length < 8) return toast.error('Min 8 characters');
      setLoading(true);
      try { await api.patch(`/admin/users/${user.id}/reset-password`,{newPassword:pass}); toast.success('Password reset!'); onDone(); }
      catch(err) { toast.error(err.response?.data?.message||'Failed'); }
      finally { setLoading(false); }
    };
    return (
      <div className="modal-wrap" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:380}}>
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-white text-base">Reset Password</h3><button onClick={onClose} style={{color:'var(--t3)'}}><X size={18}/></button></div>
          <p className="text-sm mb-4" style={{color:'var(--t2)'}}>Set new password for <strong className="text-white">{user.firstName} {user.lastName}</strong></p>
          <label className={lc} style={ls}>NEW PASSWORD</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className={ic} placeholder="Min 8 characters" style={{marginBottom:16}}/>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">{loading?'Saving...':'Reset Password'}</button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteUserModal = ({user, onClose, onDone}) => {
    const [loading, setLoading] = useState(false);
    const confirm = async() => {
      setLoading(true);
      try { await api.delete(`/admin/users/${user.id}`); toast.success('User deleted'); onDone(); }
      catch(err) { toast.error(err.response?.data?.message||'Failed'); }
      finally { setLoading(false); }
    };
    return (
      <div className="modal-wrap" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:380}}>
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-white text-base">Delete User</h3><button onClick={onClose} style={{color:'var(--t3)'}}><X size={18}/></button></div>
          <div className="mb-4 p-3 rounded-xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
            <p className="text-sm" style={{color:'#f87171'}}>⚠️ This will permanently delete <strong>{user.firstName} {user.lastName}</strong> and all their data including accounts, transactions, cards, and loans. This cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
            <button onClick={confirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'}}>{loading?'Deleting...':'Yes, Delete User'}</button>
          </div>
        </div>
      </div>
    );
  };

  // ── TABS ──────────────────────────────────────────────────────────

  const Dashboard = ()=>{
    const s = data.stats;
    if(!s) return <div className="p-8 text-center" style={{color:'var(--t3)'}}>Loading...</div>;
    return (
      <div className="space-y-5">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>OVERVIEW</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Admin Dashboard</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{l:'Total Users',v:s.totalUsers,sub:`${s.activeUsers} active`},{l:'Transactions',v:s.totalTransactions,sub:'All time'},{l:'Pending Loans',v:s.pendingLoans,sub:'Needs review'},{l:'Fraud Flags',v:s.fraudFlags,sub:'Unresolved'}].map(x=>(
            <div key={x.l} className="card p-5"><p className="text-xs mb-2" style={{color:'var(--t3)'}}>{x.l}</p><p className="font-display text-3xl font-bold text-white">{x.v}</p><p className="text-xs mt-1" style={{color:'var(--t3)'}}>{x.sub}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[{l:'Total Deposited',v:s.totalDeposited,c:'#22c55e'},{l:'Total Withdrawn',v:s.totalWithdrawn,c:'#ef4444'},{l:'Total Transferred',v:s.totalTransferred,c:'#FF6A00'}].map(x=>(
            <div key={x.l} className="card p-5"><p className="text-xs mb-1" style={{color:'var(--t3)'}}>{x.l}</p><p className="font-display text-2xl font-bold" style={{color:x.c}}>${(x.v||0).toLocaleString('en-US',{minimumFractionDigits:2})}</p></div>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{borderBottom:'1px solid var(--border)'}}><h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Recent Transactions</h3></div>
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>From</th><th>To</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{(data.transactions||[]).slice(0,8).map(tx=>(
              <tr key={tx.id}>
                <td className="font-mono text-xs" style={{color:'var(--t3)'}}>{tx.reference?.slice(0,8)}...</td>
                <td><Badge type="gray">{tx.type}</Badge></td>
                <td className="font-semibold" style={{color:'var(--t1)'}}>${tx.amount?.toFixed(2)}</td>
                <td style={{color:'var(--t2)'}}>{tx.fromAccount?.user?`${tx.fromAccount.user.firstName} ${tx.fromAccount.user.lastName}`:'—'}</td>
                <td style={{color:'var(--t2)'}}>{tx.toAccount?.user?`${tx.toAccount.user.firstName} ${tx.toAccount.user.lastName}`:'—'}</td>
                <td><Badge type={tx.status==='COMPLETED'?'green':tx.status==='REVERSED'?'blue':'yellow'}>{tx.status}</Badge></td>
                <td style={{color:'var(--t3)'}}>{format(new Date(tx.createdAt),'MMM d, HH:mm')}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    );
  };

  const UsersTab = ()=>(
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>MANAGEMENT</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Users</h1></div>
        <div className="flex gap-3 flex-wrap items-center">
          <Link href="/admin/setup-account" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:10,background:'#FF6A00',color:'#000',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap',boxShadow:'0 4px 16px rgba(255,106,0,0.35)'}}>
            <span>⚡</span> Setup New Account
          </Link>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--t3)'}}/><input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchData()} className="inp pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-64"/></div>
        </div>
      </div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>User</th><th>Email</th><th>Accounts</th><th>Tier</th><th>KYC</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
          :data.users.map(u=>(
            <tr key={u.id}>
              <td><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00'}}>{u.firstName?.[0]}{u.lastName?.[0]}</div><span className="font-medium text-white text-xs whitespace-nowrap">{u.firstName} {u.lastName}</span></div></td>
              <td style={{color:'var(--t2)',fontSize:12}}>{u.email}</td>
              <td><div className="flex flex-wrap gap-1">{(u.accounts||[]).map(a=><span key={a.id} className="badge badge-gray">{a.accountType}</span>)}</div></td>
              <td><Badge type={u.tier==='VIP'?'orange':u.tier==='ELITE'?'blue':'gray'}>{u.tier||'STANDARD'}</Badge></td>
              <td><Badge type={u.kyc?.status==='APPROVED'?'green':u.kyc?.status==='SUBMITTED'?'blue':'yellow'}>{u.kyc?.status||'PENDING'}</Badge></td>
              <td><Badge type={u.status==='ACTIVE'?'green':u.status==='FROZEN'?'blue':'red'}>{u.status}</Badge></td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={()=>openUser(u.id)} className="p-1.5 rounded-lg transition" style={{background:'var(--s3)',color:'var(--t2)'}} title="Full profile"><Users size={12}/></button>
                  <button onClick={()=>setEditUser(u)} className="p-1.5 rounded-lg transition" style={{background:'var(--s3)',color:'var(--t2)'}} title="Edit"><Edit2 size={12}/></button>
                  <button onClick={()=>setBalanceModal({userId:u.id,name:`${u.firstName} ${u.lastName}`,balance:u.accounts?.[0]?.balance||0,accountId:u.accounts?.[0]?.id||'',accounts:u.accounts})} className="p-1.5 rounded-lg transition" style={{background:'rgba(255,106,0,0.1)',color:'#FF6A00'}} title="Balance"><DollarSign size={12}/></button>
                  <button onClick={()=>action(()=>api.patch(`/admin/users/${u.id}/status`,{status:u.status==='ACTIVE'?'FROZEN':'ACTIVE'}),u.status==='ACTIVE'?'Frozen':'Activated')} className="p-1.5 rounded-lg transition" style={{background:'rgba(99,102,241,0.1)',color:'#818cf8'}} title="Freeze/Unfreeze">{u.status==='ACTIVE'?<XCircle size={12}/>:<Check size={12}/>}</button>
                  <button onClick={()=>setResetPassModal(u)} className="p-1.5 rounded-lg transition" style={{background:'rgba(251,191,36,0.1)',color:'#fbbf24'}} title="Reset Password"><Key size={12}/></button>
                  <button onClick={()=>setDeleteConfirm(u)} className="p-1.5 rounded-lg transition" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}} title="Delete User"><Trash2 size={12}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );

  const TxTab = ()=>(
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>LEDGER</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Transactions</h1></div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setZelleModal({})} className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"><Zap size={12}/>Zelle</button>
          <button onClick={()=>setCashModal({})} className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"><Smartphone size={12}/>CashApp</button>
          <button onClick={()=>setAddTxModal(true)} className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"><Plus size={12}/>Add Tx</button>
          <button onClick={()=>setBulkTxModal({})} className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"><Plus size={12}/>Bulk Add</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>TYPE</label>
            <select value={txFilters.type} onChange={e=>setTxFilters({...txFilters,type:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs">
              <option value="">All Types</option>
              {TX_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>STATUS</label>
            <select value={txFilters.status} onChange={e=>setTxFilters({...txFilters,status:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs">
              <option value="">All</option>{['COMPLETED','PENDING','FAILED','REVERSED'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>FROM DATE</label><input type="date" value={txFilters.startDate} onChange={e=>setTxFilters({...txFilters,startDate:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>TO DATE</label><input type="date" value={txFilters.endDate} onChange={e=>setTxFilters({...txFilters,endDate:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>MIN AMOUNT</label><input type="number" placeholder="0" value={txFilters.minAmount} onChange={e=>setTxFilters({...txFilters,minAmount:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>MAX AMOUNT</label><input type="number" placeholder="∞" value={txFilters.maxAmount} onChange={e=>setTxFilters({...txFilters,maxAmount:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'var(--t3)'}}>USER ID</label><input type="text" placeholder="Filter by user" value={txFilters.userId} onChange={e=>setTxFilters({...txFilters,userId:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs font-mono"/></div>
          <div className="flex items-end gap-2">
            <button onClick={fetchData} className="btn-primary flex-1 py-2 rounded-lg text-xs">Apply</button>
            <button onClick={()=>setTxFilters({type:'',status:'',startDate:'',endDate:'',minAmount:'',maxAmount:'',userId:''})} className="btn-ghost px-3 py-2 rounded-lg text-xs">Clear</button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>From</th><th>To</th><th>Flagged</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={9} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
          :(data.transactions||[]).map(tx=>(
            <tr key={tx.id}>
              <td className="font-mono" style={{fontSize:11,color:'var(--t3)'}}>{tx.reference?.slice(0,8)}...</td>
              <td><Badge type="gray">{tx.type}</Badge></td>
              <td className="font-semibold" style={{color:'var(--t1)'}}>${tx.amount?.toFixed(2)}</td>
              <td style={{color:'var(--t2)',fontSize:12}}>{tx.fromAccount?.user?`${tx.fromAccount.user.firstName} ${tx.fromAccount.user.lastName}`:'—'}</td>
              <td style={{color:'var(--t2)',fontSize:12}}>{tx.toAccount?.user?`${tx.toAccount.user.firstName} ${tx.toAccount.user.lastName}`:'—'}</td>
              <td>{tx.flagged?<span style={{color:'#f87171',fontSize:11}}>⚠ Yes</span>:<span style={{color:'var(--t3)',fontSize:11}}>—</span>}</td>
              <td><Badge type={tx.status==='COMPLETED'?'green':tx.status==='REVERSED'?'blue':'yellow'}>{tx.status}</Badge></td>
              <td style={{color:'var(--t3)',fontSize:11,whiteSpace:'nowrap'}}>{format(new Date(tx.createdAt),'MMM d, HH:mm')}</td>
              <td><div className="flex gap-1">
                <button onClick={()=>setEditTxModal(tx)} className="p-1.5 rounded-lg" style={{background:'var(--s3)',color:'var(--t2)'}} title="Edit"><Edit2 size={11}/></button>
                {tx.type==='TRANSFER'&&tx.status==='COMPLETED'&&<button onClick={()=>action(()=>api.patch(`/admin/transactions/${tx.id}/reverse`),'Reversed')} className="p-1.5 rounded-lg" style={{background:'rgba(99,102,241,0.1)',color:'#818cf8'}} title="Reverse"><RotateCcw size={11}/></button>}
                <button onClick={()=>{ if(confirm('Delete?')) action(()=>api.delete(`/admin/transactions/${tx.id}`),'Deleted'); }} className="p-1.5 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}} title="Delete"><Trash2 size={11}/></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );

  const LoansTab = ()=>(
    <div className="space-y-4">
      <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>CREDIT</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Loan Management</h1></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Client</th><th>Amount</th><th>Rate</th><th>Term</th><th>Monthly</th><th>Repaid</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={9} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
          :(data.loans||[]).map(l=>(
            <tr key={l.id}>
              <td><p className="text-xs font-semibold" style={{color:'var(--t1)'}}>{l.user?.firstName} {l.user?.lastName}</p><p style={{fontSize:11,color:'var(--t3)'}}>{l.user?.email}</p></td>
              <td className="font-semibold" style={{color:'var(--t1)'}}>${l.amount?.toLocaleString()}</td>
              <td style={{color:'var(--t2)',fontSize:12}}>{l.interestRate}%</td>
              <td style={{color:'var(--t2)',fontSize:12}}>{l.termMonths}mo</td>
              <td style={{color:'var(--t2)',fontSize:12}}>${l.monthlyPayment?.toFixed(2)}</td>
              <td style={{fontSize:12}}><span style={{color:'#4ade80'}}>${l.amountRepaid?.toFixed(2)}</span><span style={{color:'var(--t3)'}}> / ${l.totalRepayable?.toFixed(2)}</span></td>
              <td style={{color:'var(--t2)',fontSize:12,maxWidth:120}} className="truncate">{l.purpose||'—'}</td>
              <td><Badge type={l.status==='ACTIVE'?'green':l.status==='PAID'?'blue':l.status==='PENDING'?'yellow':'red'}>{l.status}</Badge></td>
              <td><button onClick={()=>setLoanModal(l)} className="btn-primary px-3 py-1.5 rounded-lg text-xs">{l.status==='PENDING'?'Review':'Edit'}</button></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );

  const DepositsTab = ()=>(
    <div className="space-y-4">
      <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>DEPOSITS</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Mobile Deposits</h1></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Client</th><th>Amount</th><th>Bank</th><th>Cheque #</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
          :(data.deposits||[]).map(d=>(
            <tr key={d.id}>
              <td><p className="text-xs font-semibold" style={{color:'var(--t1)'}}>{d.user?.firstName} {d.user?.lastName}</p><p style={{fontSize:11,color:'var(--t3)'}}>{d.user?.email}</p></td>
              <td className="font-semibold" style={{color:'var(--t1)'}}>${d.amount?.toFixed(2)}</td>
              <td style={{color:'var(--t2)',fontSize:12}}>{d.bankName||'—'}</td>
              <td className="font-mono" style={{fontSize:11,color:'var(--t2)'}}>{d.chequeNumber||'—'}</td>
              <td><Badge type={d.status==='APPROVED'?'green':d.status==='REJECTED'?'red':'yellow'}>{d.status}</Badge></td>
              <td style={{color:'var(--t3)',fontSize:11}}>{format(new Date(d.createdAt),'MMM d, yyyy')}</td>
              <td>{d.status==='PENDING'&&<div className="flex gap-1">
                <button onClick={()=>action(()=>api.patch(`/admin/mobile-deposits/${d.id}/review`,{status:'APPROVED'}),'Approved')} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{background:'rgba(34,197,94,0.12)',color:'#4ade80'}}>Approve</button>
                <button onClick={()=>{ const r=prompt('Reason:'); if(r!==null) action(()=>api.patch(`/admin/mobile-deposits/${d.id}/review`,{status:'REJECTED',rejectionReason:r}),'Rejected'); }} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}}>Reject</button>
              </div>}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );

  const FraudTab = ()=>(
    <div className="space-y-4">
      <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>SECURITY</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Fraud Flags</h1></div>
      {(data.fraud||[]).length===0?<div className="card flex flex-col items-center py-16" style={{color:'var(--t3)'}}><AlertTriangle size={32} className="mb-3 opacity-30"/><p>No unresolved flags</p></div>:(data.fraud||[]).map(f=>(
        <div key={f.id} className="card p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}}><AlertTriangle size={16}/></div>
            <div>
              <div className="flex items-center gap-2 mb-1"><p className="text-sm font-semibold" style={{color:'var(--t1)'}}>{f.user?.firstName} {f.user?.lastName}</p><Badge type={f.severity==='HIGH'?'red':f.severity==='MEDIUM'?'yellow':'gray'}>{f.severity}</Badge></div>
              <p className="text-xs" style={{color:'var(--t2)'}}>{f.reason}</p>
              <p className="text-xs mt-1" style={{color:'var(--t3)'}}>{f.user?.email} · {format(new Date(f.createdAt),'MMM d, yyyy HH:mm')}</p>
            </div>
          </div>
          <button onClick={()=>action(()=>api.patch(`/admin/fraud-flags/${f.id}/resolve`),'Resolved')} className="px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 flex items-center gap-1.5" style={{background:'rgba(34,197,94,0.1)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.15)'}}><Check size={12}/>Resolve</button>
        </div>
      ))}
    </div>
  );

  const LogsTab = ()=>(
    <div className="space-y-4">
      <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>AUDIT</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Activity Log</h1></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>Details</th><th>Time</th></tr></thead>
        <tbody>
          {(data.logs||[]).map(l=>(
            <tr key={l.id}>
              <td><p className="text-xs font-semibold" style={{color:'var(--t1)'}}>{l.admin?.firstName} {l.admin?.lastName}</p></td>
              <td><Badge type="orange">{l.action}</Badge></td>
              <td className="font-mono" style={{fontSize:11,color:'var(--t3)'}}>{l.targetId?.slice(0,12)||'—'}</td>
              <td style={{color:'var(--t2)',fontSize:12,maxWidth:200}} className="truncate">{l.details||'—'}</td>
              <td style={{color:'var(--t3)',fontSize:11,whiteSpace:'nowrap'}}>{format(new Date(l.createdAt),'MMM d, HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );

  const UserDetailTab = ()=>{
    if(!selectedUser) return null;
    const u = selectedUser;
    const totalBal = (u.accounts||[]).reduce((s,a)=>s+a.balance,0);

    // ── Per-user transaction history (separate from the global TxTab list) ──
    const [txList,setTxList] = useState([]);
    const [txLoading,setTxLoading] = useState(true);
    const fetchUserTx = useCallback(async()=>{
      setTxLoading(true);
      try{
        const r = await api.get(`/admin/transactions?userId=${u.id}&limit=100`);
        setTxList(r.data.data.transactions||[]);
      }catch{ toast.error('Failed to load transaction history'); }
      finally{ setTxLoading(false); }
    },[u.id]);
    // Refetch whenever the user changes, or any tx-affecting modal opens/closes
    useEffect(()=>{ fetchUserTx(); },[fetchUserTx, editTxModal, bulkTxModal, addTxModal, balanceModal]);
    const txAction = async(fn,msg)=>{ try{ await fn(); toast.success(msg); fetchUserTx(); }catch(err){ toast.error(err.response?.data?.message||'Failed'); } };

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={()=>setTab('users')} className="btn-ghost p-2 rounded-xl text-xs">← Back</button>
          <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>CLIENT PROFILE</p><h1 className="font-display text-xl font-bold text-white mt-0.5">{u.firstName} {u.lastName}</h1></div>
        </div>
        <div className="card p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00'}}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display font-bold text-white">{u.firstName} {u.lastName}</h2>
              <Badge type={u.tier==='VIP'?'orange':u.tier==='ELITE'?'blue':'gray'}>{u.tier||'STANDARD'}</Badge>
              <Badge type={u.status==='ACTIVE'?'green':u.status==='FROZEN'?'blue':'red'}>{u.status}</Badge>
            </div>
            <p className="text-xs" style={{color:'var(--t2)'}}>{u.email} · {u.phone||'No phone'}</p>
            <p className="text-xs mt-0.5" style={{color:'var(--t3)'}}>Joined {format(new Date(u.createdAt),'MMM d, yyyy')} · Total Balance: <span style={{color:'#4ade80'}}>${totalBal.toLocaleString('en-US',{minimumFractionDigits:2})}</span></p>
            {u.adminNotes&&<div className="mt-2 p-2 rounded-lg text-xs" style={{background:'rgba(255,106,0,0.05)',color:'rgba(255,106,0,0.6)',border:'1px solid rgba(255,106,0,0.1)'}}><span className="font-semibold">Note: </span>{u.adminNotes}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setEditUser(u)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Edit2 size={12}/>Edit</button>
            <button onClick={()=>setBalanceModal({userId:u.id,name:`${u.firstName} ${u.lastName}`,balance:u.accounts?.[0]?.balance||0,accountId:u.accounts?.[0]?.id||'',accounts:u.accounts})} className="btn-primary px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><DollarSign size={12}/>Balance</button>
            <button onClick={()=>setAddTxModal(true)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Plus size={12}/>Add Tx</button>
            <button onClick={()=>setBulkTxModal({userId:u.id})} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5" style={{background:'rgba(255,106,0,0.1)',color:'#FF6A00'}}><Plus size={12}/>Bulk Tx</button>
            <button onClick={()=>setZelleModal({userId:u.id})} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Zap size={12}/>Zelle</button>
            <button onClick={()=>setCashModal({userId:u.id})} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Smartphone size={12}/>CashApp</button>
            <button onClick={()=>setCreateAccModal(u.id)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Plus size={12}/>Account</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(u.accounts||[]).map(a=>(
            <div key={a.id} className="card p-4">
              <div className="flex items-center justify-between mb-2"><Badge type={a.accountType==='SAVINGS'?'green':a.accountType==='INVESTMENT'?'blue':'orange'}>{a.accountType}</Badge><Badge type={a.isActive?'green':'red'}>{a.isActive?'Active':'Inactive'}</Badge></div>
              <p className="font-display text-xl font-bold text-white">${a.balance.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
              <p className="font-mono text-xs mt-1" style={{color:'var(--t3)'}}>{a.accountNumber}</p>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between" style={{borderBottom:'1px solid var(--border)'}}>
            <h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Transaction History</h3>
            <div className="flex gap-2">
              <button onClick={()=>setAddTxModal(true)} className="btn-ghost px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"><Plus size={11}/>Add Tx</button>
              <button onClick={()=>setBulkTxModal({userId:u.id})} className="btn-ghost px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{background:'rgba(255,106,0,0.1)',color:'#FF6A00'}}><Plus size={11}/>Bulk / Generate</button>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Flagged</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {txLoading?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
              :txList.length===0?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>No transactions yet</td></tr>
              :txList.map(tx=>(
                <tr key={tx.id}>
                  <td className="font-mono" style={{fontSize:11,color:'var(--t3)'}}>{tx.reference?.slice(0,8)}...</td>
                  <td><Badge type="gray">{tx.type}</Badge></td>
                  <td className="font-semibold" style={{color:'var(--t1)'}}>${tx.amount?.toFixed(2)}</td>
                  <td>{tx.flagged?<span style={{color:'#f87171',fontSize:11}}>⚠ Yes</span>:<span style={{color:'var(--t3)',fontSize:11}}>—</span>}</td>
                  <td><Badge type={tx.status==='COMPLETED'?'green':tx.status==='REVERSED'?'blue':'yellow'}>{tx.status}</Badge></td>
                  <td style={{color:'var(--t3)',fontSize:11,whiteSpace:'nowrap'}}>{format(new Date(tx.createdAt),'MMM d, HH:mm')}</td>
                  <td><div className="flex gap-1">
                    <button onClick={()=>setEditTxModal(tx)} className="p-1.5 rounded-lg" style={{background:'var(--s3)',color:'var(--t2)'}} title="Edit"><Edit2 size={11}/></button>
                    {tx.type==='TRANSFER'&&tx.status==='COMPLETED'&&<button onClick={()=>txAction(()=>api.patch(`/admin/transactions/${tx.id}/reverse`),'Reversed')} className="p-1.5 rounded-lg" style={{background:'rgba(99,102,241,0.1)',color:'#818cf8'}} title="Reverse"><RotateCcw size={11}/></button>}
                    <button onClick={()=>{ if(confirm('Delete this transaction?')) txAction(()=>api.delete(`/admin/transactions/${tx.id}`),'Deleted'); }} className="p-1.5 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}} title="Delete"><Trash2 size={11}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between" style={{borderBottom:'1px solid var(--border)'}}>
            <h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Loans</h3>
            <button onClick={()=>setCreateLoanModal({userId:u.id})} className="btn-ghost px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{background:'rgba(255,106,0,0.1)',color:'#FF6A00'}}><Plus size={11}/>New Loan</button>
          </div>
          {(u.loans||[]).length===0?(
            <div className="py-8 text-center text-xs" style={{color:'var(--t3)'}}>No loans yet</div>
          ):(
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Amount</th><th>Rate</th><th>Term</th><th>Disbursed</th><th>Next Payment</th><th>Repaid</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{(u.loans||[]).map(l=>(
                <tr key={l.id}>
                  <td className="font-semibold" style={{color:'var(--t1)'}}>${l.amount?.toLocaleString()}</td>
                  <td style={{fontSize:12,color:'var(--t2)'}}>{l.interestRate}%</td>
                  <td style={{fontSize:12,color:'var(--t2)'}}>{l.termMonths}mo</td>
                  <td style={{fontSize:11,color:'var(--t3)'}}>{l.approvedAt?format(new Date(l.approvedAt),'MMM d, yyyy'):'—'}</td>
                  <td style={{fontSize:11,color:'var(--t3)'}}>{l.nextPaymentDate?format(new Date(l.nextPaymentDate),'MMM d, yyyy'):'—'}</td>
                  <td style={{fontSize:12}}><span style={{color:'#22c55e'}}>${l.amountRepaid?.toFixed(2)}</span><span style={{color:'var(--t3)'}}> / ${l.totalRepayable?.toFixed(2)}</span></td>
                  <td><Badge type={l.status==='ACTIVE'?'green':l.status==='PAID'?'blue':l.status==='PENDING'?'yellow':'red'}>{l.status}</Badge></td>
                  <td><button onClick={()=>setLoanModal(l)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{background:'var(--orangeD)',color:'var(--orange)',border:'1px solid rgba(255,106,0,0.2)'}}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>

        {(u.zelleTransfers||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid var(--border)'}}><h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Zelle History</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Direction</th><th>Amount</th><th>Recipient</th><th>Memo</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{u.zelleTransfers.map(z=>(
                <tr key={z.id}>
                  <td><Badge type={z.direction==='RECEIVED'?'green':'red'}>{z.direction}</Badge></td>
                  <td className="font-semibold" style={{color:z.direction==='RECEIVED'?'#4ade80':'#f87171'}}>{z.direction==='RECEIVED'?'+':'-'}${z.amount?.toFixed(2)}</td>
                  <td style={{fontSize:12,color:'var(--t2)'}}>{z.recipientName||z.recipientEmail||z.recipientPhone||'—'}</td>
                  <td style={{fontSize:12,color:'var(--t3)'}}>{z.memo||'—'}</td>
                  <td><Badge type="green">{z.status}</Badge></td>
                  <td style={{fontSize:11,color:'var(--t3)'}}>{format(new Date(z.createdAt),'MMM d, HH:mm')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {(u.cashAppTransfers||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid var(--border)'}}><h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Cash App History</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Direction</th><th>Amount</th><th>$Cashtag</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>{u.cashAppTransfers.map(c=>(
                <tr key={c.id}>
                  <td><Badge type={c.direction==='RECEIVED'?'green':'red'}>{c.direction}</Badge></td>
                  <td className="font-semibold" style={{color:c.direction==='RECEIVED'?'#4ade80':'#f87171'}}>{c.direction==='RECEIVED'?'+':'-'}${c.amount?.toFixed(2)}</td>
                  <td style={{fontSize:12,color:'var(--t2)'}}>{c.cashtag||'—'}</td>
                  <td style={{fontSize:12,color:'var(--t3)'}}>{c.note||'—'}</td>
                  <td style={{fontSize:11,color:'var(--t3)'}}>{format(new Date(c.createdAt),'MMM d, HH:mm')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {(u.billPayments||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid var(--border)'}}><h3 className="font-display font-semibold text-sm" style={{color:'var(--t1)'}}>Bill Payments</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Biller</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{u.billPayments.map(b=>(
                <tr key={b.id}>
                  <td className="font-medium text-white text-xs">{b.billerName}</td>
                  <td><Badge type="gray">{b.billType}</Badge></td>
                  <td className="font-semibold" style={{color:'var(--t1)'}}>${b.amount?.toFixed(2)}</td>
                  <td><Badge type="green">{b.status}</Badge></td>
                  <td style={{fontSize:11,color:'var(--t3)'}}>{format(new Date(b.createdAt),'MMM d')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}
      </div>
    );
  };

  const CURRENCIES = [
    {code:'USD', label:'USD — US Dollar'},
    {code:'EUR', label:'EUR — Euro'},
    {code:'GBP', label:'GBP — British Pound'},
    {code:'CAD', label:'CAD — Canadian Dollar'},
    {code:'AUD', label:'AUD — Australian Dollar'},
    {code:'JPY', label:'JPY — Japanese Yen'},
  ];

  const CreateAccModal = ()=>{
    const [f,setF] = useState({accountType:'SAVINGS',balance:0,currency:'USD'});
    const save = ()=>action(()=>api.post(`/admin/users/${createAccModal}/accounts`,f),'Account created').then(()=>setCreateAccModal(null));
    return (
      <Modal title="Create Account" onClose={()=>setCreateAccModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>TYPE</label><select value={f.accountType} onChange={e=>setF({...f,accountType:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm"><option>CHECKING</option><option>SAVINGS</option><option>INVESTMENT</option></select></div>
          <div><label className={lc} style={ls}>CURRENCY</label><select value={f.currency} onChange={e=>setF({...f,currency:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}</select></div>
          <div><label className={lc} style={ls}>OPENING BALANCE</label><input type="number" min="0" value={f.balance} onChange={e=>setF({...f,balance:e.target.value})} className={ic} placeholder="0.00"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setCreateAccModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Create</button></div>
      </Modal>
    );
  };

  const ResetPassModal = ()=>{
    const [newPass, setNewPass] = useState('');
    const [show, setShow] = useState(false);
    const save = async()=>{
      if(!newPass||newPass.length<8) return toast.error('Min 8 characters');
      try { await api.patch(`/admin/users/${resetPassModal.id}/reset-password`,{newPassword:newPass}); toast.success('Password reset successfully'); setResetPassModal(null); }
      catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    };
    return (
      <Modal title="Reset User Password" onClose={()=>setResetPassModal(null)}>
        <p className="text-xs mb-4" style={{color:'var(--t2)'}}>{resetPassModal?.firstName} {resetPassModal?.lastName} · {resetPassModal?.email}</p>
        <div className="mb-5">
          <label className={lc} style={ls}>NEW PASSWORD</label>
          <div className="relative">
            <input type={show?'text':'password'} value={newPass} onChange={e=>setNewPass(e.target.value)} className={ic} placeholder="Min 8 characters"/>
            <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)'}}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setResetPassModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Reset Password</button>
        </div>
      </Modal>
    );
  };

  const CardsTab = ()=>{
    const approveCard = (id) => action(() => api.patch(`/cards/admin/${id}/approve`), 'Card approved!');
    const rejectCard = async (id) => {
      const reason = prompt('Rejection reason:');
      if (reason === null) return;
      action(() => api.patch(`/cards/admin/${id}/reject`, { reason }), 'Card rejected');
    };
    return (
      <div className="space-y-4">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>CARDS</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Card Applications</h1></div>
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Client</th><th>Type</th><th>Network</th><th>Account</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
          <tbody>
            {dloading?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>Loading...</td></tr>
            :(data.cards||[]).length===0?<tr><td colSpan={7} className="text-center py-8" style={{color:'var(--t3)'}}>No card applications</td></tr>
            :(data.cards||[]).map(c=>(
              <tr key={c.id}>
                <td><p className="text-xs font-semibold" style={{color:'var(--t1)'}}>{c.account?.user?.firstName} {c.account?.user?.lastName}</p><p style={{fontSize:11,color:'var(--t3)'}}>{c.account?.user?.email}</p></td>
                <td><Badge type="gray">{c.type}</Badge></td>
                <td style={{color:'var(--t2)',fontSize:12}}>{c.network}</td>
                <td style={{fontSize:11,color:'var(--t3)',fontFamily:'monospace'}}>{c.account?.accountNumber}</td>
                <td><Badge type={c.status==='ACTIVE'?'green':c.status==='FROZEN'?'blue':c.status==='REJECTED'?'red':'yellow'}>{c.status}</Badge></td>
                <td style={{fontSize:11,color:'var(--t3)',whiteSpace:'nowrap'}}>{format(new Date(c.createdAt),'MMM d, yyyy')}</td>
                <td>{c.status==='PENDING'&&<div className="flex gap-2">
                  <button onClick={()=>approveCard(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:'rgba(34,197,94,0.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.2)'}}>Approve</button>
                  <button onClick={()=>rejectCard(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:'rgba(239,68,68,0.1)',color:'#f87171',border:'1px solid rgba(239,68,68,0.15)'}}>Reject</button>
                </div>}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
    );
  };

  const tabContent = {dashboard:<Dashboard/>,users:<UsersTab/>,transactions:<TxTab/>,loans:<LoansTab/>,cards:<CardsTab/>,deposits:<DepositsTab/>,fraud:<FraudTab/>,logs:<LogsTab/>,userdetail:<UserDetailTab/>};

  return (
    <div className="flex h-screen" style={{background:'var(--bg)'}}>
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0"><Sidebar/></div>

      {sideOpen&&(
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)'}} onClick={()=>setSideOpen(false)}/>
          <div className="relative w-56 z-50"><Sidebar/></div>
          <button onClick={()=>setSideOpen(false)} className="absolute top-4 right-4 z-50 p-2 rounded-xl" style={{background:'rgba(255,255,255,0.08)',color:'white'}}><X size={18}/></button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-4 py-3" style={{background:'#0F0F0F',borderBottom:'1px solid var(--border)'}}>
          <button onClick={()=>setSideOpen(true)} className="p-2 rounded-xl" style={{color:'var(--t2)',background:'var(--s3)'}}><Menu size={18}/></button>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={12} color="#000"/></div><span className="font-display font-bold text-white text-sm">ADMIN</span></div>
          <div className="w-6"/>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7" style={{background:'var(--bg)',color:'var(--t1)'}}>{tabContent[tab]||<Dashboard/>}</main>
      </div>

      {/* Modals */}
      {editUser&&<EditUserModal/>}
      {resetPassModal&&<ResetPassModal/>}
      {resetPassModal&&(
        <ResetPasswordModal user={resetPassModal} onClose={()=>setResetPassModal(null)} onDone={()=>{setResetPassModal(null);fetchData();}}/>
      )}
      {deleteConfirm&&(
        <DeleteUserModal user={deleteConfirm} onClose={()=>setDeleteConfirm(null)} onDone={()=>{setDeleteConfirm(null);fetchData();}}/>
      )}
      {balanceModal&&<BalanceModal/>}
      {addTxModal&&<AddTxModal/>}
      {editTxModal&&<EditTxModal/>}
      {bulkTxModal&&<BulkTxModal/>}
      {zelleModal&&<ZelleModal/>}
      {cashModal&&<CashModal/>}
      {loanModal&&<LoanModal/>}
      {createLoanModal&&<CreateLoanModal/>}
      {createAccModal&&<CreateAccModal/>}
    </div>
  );
}