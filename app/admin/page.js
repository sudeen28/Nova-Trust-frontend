'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Users, ArrowLeftRight, AlertTriangle, Shield, LogOut, LayoutDashboard, Camera, Landmark, Zap, Smartphone, FileText, Search, Plus, Edit2, Trash2, RotateCcw, DollarSign, ChevronDown, ChevronUp, X, Save, Check, XCircle, Menu } from 'lucide-react';
import { format } from 'date-fns';

// ── SMALL COMPONENTS ──────────────────────────────────────────────
const Badge = ({children,type='gray'})=><span className={`badge badge-${type}`}>{children}</span>;
const Spinner = ()=><div className="spinner mx-auto"/>;

const Modal = ({title,onClose,children,wide=false})=>(
  <div className="modal-wrap" style={{zIndex:200}}>
    <div className="modal" style={{maxWidth:wide?680:440}}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-white text-base">{title}</h3>
        <button onClick={onClose} style={{color:'rgba(255,255,255,0.3)'}} className="hover:text-white transition"><X size={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

const lc = "block text-xs font-semibold tracking-widest mb-1.5";
const ls = {color:'rgba(255,255,255,0.35)'};
const ic = "inp px-3 py-2.5 rounded-xl text-sm";
const ic2 = "inp px-3 py-2 rounded-lg text-xs";

// ── MAIN ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({stats:null,users:[],transactions:[],loans:[],deposits:[],fraud:[],logs:[]});
  const [dloading, setDloading] = useState(true);
  const [search, setSearch] = useState('');
  const [txFilters, setTxFilters] = useState({type:'',status:'',startDate:'',endDate:'',minAmount:'',maxAmount:'',userId:''});
  const [sideOpen, setSideOpen] = useState(false);

  // Modals
  const [editUser, setEditUser] = useState(null);
  const [balanceModal, setBalanceModal] = useState(null);
  const [addTxModal, setAddTxModal] = useState(null);
  const [editTxModal, setEditTxModal] = useState(null);
  const [createAccModal, setCreateAccModal] = useState(null);
  const [zelleModal, setZelleModal] = useState(null);
  const [cashModal, setCashModal] = useState(null);
  const [loanModal, setLoanModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
    {id:'deposits',icon:Camera,label:'Deposits'},
    {id:'fraud',icon:AlertTriangle,label:'Fraud'},
    {id:'logs',icon:FileText,label:'Audit Log'},
  ];

  const Sidebar = ()=>(
    <div className="flex flex-col h-full" style={{background:'#0F0F0F',borderRight:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="px-4 py-5 flex items-center gap-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={16} color="#000"/></div>
        <div><p className="font-display font-bold text-white text-sm">NOVA TRUST</p><p className="text-xs" style={{color:'rgba(255,255,255,0.25)'}}>Admin Console</p></div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({id,icon:Icon,label})=>(
          <button key={id} onClick={()=>{setTab(id);setSideOpen(false);}} className={`nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${tab===id||tab==='userdetail'&&id==='users'?'active':''}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
        <div className="divider my-3"/>
        <Link href="/dashboard" className="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"><Users size={15}/>My Account</Link>
      </nav>
      <div className="px-3 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="px-3 py-2 mb-2 rounded-xl" style={{background:'rgba(255,255,255,0.03)'}}>
          <p className="text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs" style={{color:'rgba(255,255,255,0.25)'}}>Administrator</p>
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
          <div><label className={lc} style={ls}>TYPE</label><select value={f.type} onChange={e=>setF({...f,type:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{['DEPOSIT','WITHDRAWAL','TRANSFER','PAYMENT','ZELLE','CASHAPP','BILL_PAYMENT','LOAN_DISBURSEMENT','LOAN_REPAYMENT','MOBILE_DEPOSIT'].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className={lc} style={ls}>STATUS</label><select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{['COMPLETED','PENDING','FAILED'].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className={lc} style={ls}>AMOUNT ($)</label><input type="number" min="0.01" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder="0.00"/></div>
          <div><label className={lc} style={ls}>DATE (OPTIONAL)</label><input type="datetime-local" value={f.createdAt} onChange={e=>setF({...f,createdAt:e.target.value})} className={ic}/></div>
          <div className="col-span-2"><label className={lc} style={ls}>DESCRIPTION</label><input type="text" value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={ic} placeholder="Transaction note"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setAddTxModal(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Plus size={13}/>Create</button></div>
      </Modal>
    );
  };

  const EditTxModal = ()=>{
    const [f,setF] = useState({amount:editTxModal?.amount||'',status:editTxModal?.status||'',description:editTxModal?.description||'',createdAt:''});
    const save = ()=>action(()=>api.put(`/admin/transactions/${editTxModal.id}`,f),'Updated').then(()=>setEditTxModal(null));
    return (
      <Modal title="Edit Transaction" onClose={()=>setEditTxModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>AMOUNT ($)</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic}/></div>
          <div><label className={lc} style={ls}>STATUS</label><select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm">{['PENDING','COMPLETED','FAILED','REVERSED'].map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label className={lc} style={ls}>DESCRIPTION</label><input type="text" value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={ic}/></div>
          <div><label className={lc} style={ls}>DATE OVERRIDE</label><input type="datetime-local" value={f.createdAt} onChange={e=>setF({...f,createdAt:e.target.value})} className={ic}/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setEditTxModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Save</button></div>
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
    const [f,setF] = useState({status:'APPROVED',amount:loanModal?.amount||'',interestRate:loanModal?.interestRate||8.5,termMonths:loanModal?.termMonths||12,rejectionReason:''});
    const save = ()=>action(()=>api.patch(`/admin/loans/${loanModal.id}/review`,f),`Loan ${f.status.toLowerCase()}`).then(()=>setLoanModal(null));
    return (
      <Modal title="Review Loan" onClose={()=>setLoanModal(null)}>
        <div className="p-3 rounded-xl mb-4" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <p className="text-xs text-white font-semibold">{loanModal?.user?.firstName} {loanModal?.user?.lastName}</p>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.35)'}}>Requested: ${loanModal?.amount?.toLocaleString()} • {loanModal?.purpose}</p>
        </div>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>DECISION</label><select value={f.status} onChange={e=>setF({...f,status:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm"><option value="APPROVED">APPROVE</option><option value="REJECTED">REJECT</option></select></div>
          {f.status==='APPROVED'&&<>
            <div className="grid grid-cols-3 gap-2">
              <div><label className={lc} style={ls}>AMOUNT</label><input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} className={ic} placeholder={loanModal?.amount}/></div>
              <div><label className={lc} style={ls}>RATE %</label><input type="number" step="0.1" value={f.interestRate} onChange={e=>setF({...f,interestRate:e.target.value})} className={ic}/></div>
              <div><label className={lc} style={ls}>MONTHS</label><input type="number" value={f.termMonths} onChange={e=>setF({...f,termMonths:e.target.value})} className={ic}/></div>
            </div>
          </>}
          {f.status==='REJECTED'&&<div><label className={lc} style={ls}>REASON</label><input type="text" value={f.rejectionReason} onChange={e=>setF({...f,rejectionReason:e.target.value})} className={ic} placeholder="Reason for rejection"/></div>}
        </div>
        <div className="flex gap-3"><button onClick={()=>setLoanModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${f.status==='APPROVED'?'btn-primary':' btn-danger'}`}>{f.status==='APPROVED'?<Check size={13}/>:<XCircle size={13}/>}{f.status==='APPROVED'?'Approve':'Reject'}</button></div>
      </Modal>
    );
  };

  // ── TABS CONTENT ──────────────────────────────────────────────────
  const Dashboard = ()=>{
    const s = data.stats;
    if(!s) return <div className="p-8 text-center" style={{color:'rgba(255,255,255,0.2)'}}>Loading...</div>;
    return (
      <div className="space-y-5">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>OVERVIEW</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Admin Dashboard</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{l:'Total Users',v:s.totalUsers,sub:`${s.activeUsers} active`},{l:'Transactions',v:s.totalTransactions,sub:'All time'},{l:'Pending Loans',v:s.pendingLoans,sub:'Needs review'},{l:'Fraud Flags',v:s.fraudFlags,sub:'Unresolved'}].map(x=>(
            <div key={x.l} className="card p-5"><p className="text-xs mb-2" style={{color:'rgba(255,255,255,0.3)'}}>{x.l}</p><p className="font-display text-3xl font-bold text-white">{x.v}</p><p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.2)'}}>{x.sub}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[{l:'Total Deposited',v:s.totalDeposited,c:'#22c55e'},{l:'Total Withdrawn',v:s.totalWithdrawn,c:'#ef4444'},{l:'Total Transferred',v:s.totalTransferred,c:'#FF6A00'}].map(x=>(
            <div key={x.l} className="card p-5"><p className="text-xs mb-1" style={{color:'rgba(255,255,255,0.3)'}}>{x.l}</p><p className="font-display text-2xl font-bold" style={{color:x.c}}>${(x.v||0).toLocaleString('en-US',{minimumFractionDigits:2})}</p></div>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">Recent Transactions</h3></div>
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>From</th><th>To</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{(data.transactions||[]).slice(0,8).map(tx=>(
              <tr key={tx.id}>
                <td className="font-mono text-xs" style={{color:'rgba(255,255,255,0.3)'}}>{tx.reference?.slice(0,8)}...</td>
                <td><Badge type="gray">{tx.type}</Badge></td>
                <td className="font-semibold text-white">${tx.amount?.toFixed(2)}</td>
                <td style={{color:'rgba(255,255,255,0.5)'}}>{tx.fromAccount?.user?`${tx.fromAccount.user.firstName} ${tx.fromAccount.user.lastName}`:'—'}</td>
                <td style={{color:'rgba(255,255,255,0.5)'}}>{tx.toAccount?.user?`${tx.toAccount.user.firstName} ${tx.toAccount.user.lastName}`:'—'}</td>
                <td><Badge type={tx.status==='COMPLETED'?'green':tx.status==='REVERSED'?'blue':'yellow'}>{tx.status}</Badge></td>
                <td style={{color:'rgba(255,255,255,0.3)'}}>{format(new Date(tx.createdAt),'MMM d, HH:mm')}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    );
  };

  const UsersTab = ()=>(
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>MANAGEMENT</p><h1 className="font-display text-2xl font-bold text-white mt-0.5">Users</h1></div>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.3)'}}/><input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchData()} className="inp pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-64"/></div>
      </div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>User</th><th>Email</th><th>Accounts</th><th>Tier</th><th>KYC</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={7} className="text-center py-8" style={{color:'rgba(255,255,255,0.2)'}}>Loading...</td></tr>
          :data.users.map(u=>(
            <tr key={u.id}>
              <td><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00'}}>{u.firstName?.[0]}{u.lastName?.[0]}</div><span className="font-medium text-white text-xs whitespace-nowrap">{u.firstName} {u.lastName}</span></div></td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{u.email}</td>
              <td><div className="flex flex-wrap gap-1">{(u.accounts||[]).map(a=><span key={a.id} className="badge badge-gray">{a.accountType}</span>)}</div></td>
              <td><Badge type={u.tier==='VIP'?'orange':u.tier==='ELITE'?'blue':'gray'}>{u.tier||'STANDARD'}</Badge></td>
              <td><Badge type={u.kyc?.status==='APPROVED'?'green':u.kyc?.status==='SUBMITTED'?'blue':'yellow'}>{u.kyc?.status||'PENDING'}</Badge></td>
              <td><Badge type={u.status==='ACTIVE'?'green':u.status==='FROZEN'?'blue':'red'}>{u.status}</Badge></td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={()=>openUser(u.id)} className="p-1.5 rounded-lg transition" style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)'}} title="Full profile"><Users size={12}/></button>
                  <button onClick={()=>setEditUser(u)} className="p-1.5 rounded-lg transition" style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.5)'}} title="Edit"><Edit2 size={12}/></button>
                  <button onClick={()=>setBalanceModal({userId:u.id,name:`${u.firstName} ${u.lastName}`,balance:u.accounts?.[0]?.balance||0,accountId:u.accounts?.[0]?.id||'',accounts:u.accounts})} className="p-1.5 rounded-lg transition" style={{background:'rgba(255,106,0,0.1)',color:'#FF6A00'}} title="Balance"><DollarSign size={12}/></button>
                  <button onClick={()=>action(()=>api.patch(`/admin/users/${u.id}/status`,{status:u.status==='ACTIVE'?'FROZEN':'ACTIVE'}),u.status==='ACTIVE'?'Frozen':'Activated')} className="p-1.5 rounded-lg transition" style={{background:'rgba(99,102,241,0.1)',color:'#818cf8'}} title="Freeze/Unfreeze">{u.status==='ACTIVE'?<XCircle size={12}/>:<Check size={12}/>}</button>
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
          <button onClick={()=>setAddTxModal(true)} className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"><Plus size={12}/>Add Tx</button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>TYPE</label>
            <select value={txFilters.type} onChange={e=>setTxFilters({...txFilters,type:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs">
              <option value="">All Types</option>
              {['DEPOSIT','WITHDRAWAL','TRANSFER','ZELLE','CASHAPP','BILL_PAYMENT','LOAN_DISBURSEMENT','LOAN_REPAYMENT','MOBILE_DEPOSIT'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>STATUS</label>
            <select value={txFilters.status} onChange={e=>setTxFilters({...txFilters,status:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs">
              <option value="">All</option>{['COMPLETED','PENDING','FAILED','REVERSED'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>FROM DATE</label><input type="date" value={txFilters.startDate} onChange={e=>setTxFilters({...txFilters,startDate:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>TO DATE</label><input type="date" value={txFilters.endDate} onChange={e=>setTxFilters({...txFilters,endDate:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>MIN AMOUNT</label><input type="number" placeholder="0" value={txFilters.minAmount} onChange={e=>setTxFilters({...txFilters,minAmount:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>MAX AMOUNT</label><input type="number" placeholder="∞" value={txFilters.maxAmount} onChange={e=>setTxFilters({...txFilters,maxAmount:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs"/></div>
          <div><label className="block text-xs font-semibold tracking-widest mb-1" style={{color:'rgba(255,255,255,0.25)'}}>USER ID</label><input type="text" placeholder="Filter by user" value={txFilters.userId} onChange={e=>setTxFilters({...txFilters,userId:e.target.value})} className="inp px-2 py-2 rounded-lg text-xs font-mono"/></div>
          <div className="flex items-end gap-2">
            <button onClick={fetchData} className="btn-primary flex-1 py-2 rounded-lg text-xs">Apply</button>
            <button onClick={()=>setTxFilters({type:'',status:'',startDate:'',endDate:'',minAmount:'',maxAmount:'',userId:''})} className="btn-ghost px-3 py-2 rounded-lg text-xs">Clear</button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>From</th><th>To</th><th>Flagged</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {dloading?<tr><td colSpan={9} className="text-center py-8" style={{color:'rgba(255,255,255,0.2)'}}>Loading...</td></tr>
          :(data.transactions||[]).map(tx=>(
            <tr key={tx.id}>
              <td className="font-mono" style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{tx.reference?.slice(0,8)}...</td>
              <td><Badge type="gray">{tx.type}</Badge></td>
              <td className="font-semibold text-white">${tx.amount?.toFixed(2)}</td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{tx.fromAccount?.user?`${tx.fromAccount.user.firstName} ${tx.fromAccount.user.lastName}`:'—'}</td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{tx.toAccount?.user?`${tx.toAccount.user.firstName} ${tx.toAccount.user.lastName}`:'—'}</td>
              <td>{tx.flagged?<span style={{color:'#f87171',fontSize:11}}>⚠ Yes</span>:<span style={{color:'rgba(255,255,255,0.2)',fontSize:11}}>—</span>}</td>
              <td><Badge type={tx.status==='COMPLETED'?'green':tx.status==='REVERSED'?'blue':'yellow'}>{tx.status}</Badge></td>
              <td style={{color:'rgba(255,255,255,0.3)',fontSize:11,whiteSpace:'nowrap'}}>{format(new Date(tx.createdAt),'MMM d, HH:mm')}</td>
              <td><div className="flex gap-1">
                <button onClick={()=>setEditTxModal(tx)} className="p-1.5 rounded-lg" style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.4)'}} title="Edit"><Edit2 size={11}/></button>
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
          {dloading?<tr><td colSpan={9} className="text-center py-8" style={{color:'rgba(255,255,255,0.2)'}}>Loading...</td></tr>
          :(data.loans||[]).map(l=>(
            <tr key={l.id}>
              <td><p className="text-xs font-semibold text-white">{l.user?.firstName} {l.user?.lastName}</p><p style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{l.user?.email}</p></td>
              <td className="font-semibold text-white">${l.amount?.toLocaleString()}</td>
              <td style={{color:'rgba(255,255,255,0.5)',fontSize:12}}>{l.interestRate}%</td>
              <td style={{color:'rgba(255,255,255,0.5)',fontSize:12}}>{l.termMonths}mo</td>
              <td style={{color:'rgba(255,255,255,0.5)',fontSize:12}}>${l.monthlyPayment?.toFixed(2)}</td>
              <td style={{fontSize:12}}><span style={{color:'#4ade80'}}>${l.amountRepaid?.toFixed(2)}</span><span style={{color:'rgba(255,255,255,0.3)'}}> / ${l.totalRepayable?.toFixed(2)}</span></td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12,maxWidth:120}} className="truncate">{l.purpose||'—'}</td>
              <td><Badge type={l.status==='ACTIVE'?'green':l.status==='PAID'?'blue':l.status==='PENDING'?'yellow':'red'}>{l.status}</Badge></td>
              <td>{l.status==='PENDING'&&<button onClick={()=>setLoanModal(l)} className="btn-primary px-3 py-1.5 rounded-lg text-xs">Review</button>}</td>
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
          {dloading?<tr><td colSpan={7} className="text-center py-8" style={{color:'rgba(255,255,255,0.2)'}}>Loading...</td></tr>
          :(data.deposits||[]).map(d=>(
            <tr key={d.id}>
              <td><p className="text-xs font-semibold text-white">{d.user?.firstName} {d.user?.lastName}</p><p style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{d.user?.email}</p></td>
              <td className="font-semibold text-white">${d.amount?.toFixed(2)}</td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{d.bankName||'—'}</td>
              <td className="font-mono" style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{d.chequeNumber||'—'}</td>
              <td><Badge type={d.status==='APPROVED'?'green':d.status==='REJECTED'?'red':'yellow'}>{d.status}</Badge></td>
              <td style={{color:'rgba(255,255,255,0.3)',fontSize:11}}>{format(new Date(d.createdAt),'MMM d, yyyy')}</td>
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
      {(data.fraud||[]).length===0?<div className="card flex flex-col items-center py-16" style={{color:'rgba(255,255,255,0.2)'}}><AlertTriangle size={32} className="mb-3 opacity-30"/><p>No unresolved flags</p></div>:(data.fraud||[]).map(f=>(
        <div key={f.id} className="card p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(239,68,68,0.1)',color:'#f87171'}}><AlertTriangle size={16}/></div>
            <div>
              <div className="flex items-center gap-2 mb-1"><p className="text-sm font-semibold text-white">{f.user?.firstName} {f.user?.lastName}</p><Badge type={f.severity==='HIGH'?'red':f.severity==='MEDIUM'?'yellow':'gray'}>{f.severity}</Badge></div>
              <p className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>{f.reason}</p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.25)'}}>{f.user?.email} · {format(new Date(f.createdAt),'MMM d, yyyy HH:mm')}</p>
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
              <td><p className="text-xs font-semibold text-white">{l.admin?.firstName} {l.admin?.lastName}</p></td>
              <td><Badge type="orange">{l.action}</Badge></td>
              <td className="font-mono" style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{l.targetId?.slice(0,12)||'—'}</td>
              <td style={{color:'rgba(255,255,255,0.4)',fontSize:12,maxWidth:200}} className="truncate">{l.details||'—'}</td>
              <td style={{color:'rgba(255,255,255,0.3)',fontSize:11,whiteSpace:'nowrap'}}>{format(new Date(l.createdAt),'MMM d, HH:mm')}</td>
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
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={()=>setTab('users')} className="btn-ghost p-2 rounded-xl text-xs">← Back</button>
          <div><p className="text-xs font-semibold tracking-widest" style={{color:'rgba(255,106,0,0.7)'}}>CLIENT PROFILE</p><h1 className="font-display text-xl font-bold text-white mt-0.5">{u.firstName} {u.lastName}</h1></div>
        </div>

        {/* Header card */}
        <div className="card p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00'}}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display font-bold text-white">{u.firstName} {u.lastName}</h2>
              <Badge type={u.tier==='VIP'?'orange':u.tier==='ELITE'?'blue':'gray'}>{u.tier||'STANDARD'}</Badge>
              <Badge type={u.status==='ACTIVE'?'green':u.status==='FROZEN'?'blue':'red'}>{u.status}</Badge>
            </div>
            <p className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>{u.email} · {u.phone||'No phone'}</p>
            <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>Joined {format(new Date(u.createdAt),'MMM d, yyyy')} · Total Balance: <span style={{color:'#4ade80'}}>${totalBal.toLocaleString('en-US',{minimumFractionDigits:2})}</span></p>
            {u.adminNotes&&<div className="mt-2 p-2 rounded-lg text-xs" style={{background:'rgba(255,106,0,0.05)',color:'rgba(255,106,0,0.6)',border:'1px solid rgba(255,106,0,0.1)'}}><span className="font-semibold">Note: </span>{u.adminNotes}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setEditUser(u)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Edit2 size={12}/>Edit</button>
            <button onClick={()=>setBalanceModal({userId:u.id,name:`${u.firstName} ${u.lastName}`,balance:u.accounts?.[0]?.balance||0,accountId:u.accounts?.[0]?.id||'',accounts:u.accounts})} className="btn-primary px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><DollarSign size={12}/>Balance</button>
            <button onClick={()=>setAddTxModal(true)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Plus size={12}/>Add Tx</button>
            <button onClick={()=>setZelleModal({userId:u.id})} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Zap size={12}/>Zelle</button>
            <button onClick={()=>setCashModal({userId:u.id})} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Smartphone size={12}/>CashApp</button>
            <button onClick={()=>setCreateAccModal(u.id)} className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"><Plus size={12}/>Account</button>
          </div>
        </div>

        {/* Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(u.accounts||[]).map(a=>(
            <div key={a.id} className="card p-4">
              <div className="flex items-center justify-between mb-2"><Badge type={a.accountType==='SAVINGS'?'green':a.accountType==='INVESTMENT'?'blue':'orange'}>{a.accountType}</Badge><Badge type={a.isActive?'green':'red'}>{a.isActive?'Active':'Inactive'}</Badge></div>
              <p className="font-display text-xl font-bold text-white">${a.balance.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
              <p className="font-mono text-xs mt-1" style={{color:'rgba(255,255,255,0.25)'}}>{a.accountNumber}</p>
            </div>
          ))}
        </div>

        {/* Loans */}
        {(u.loansAsDebtor||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">Loans</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Amount</th><th>Rate</th><th>Term</th><th>Repaid</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{u.loansAsDebtor.map(l=>(
                <tr key={l.id}>
                  <td className="font-semibold text-white">${l.amount?.toLocaleString()}</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{l.interestRate}%</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{l.termMonths}mo</td>
                  <td style={{fontSize:12}}><span style={{color:'#4ade80'}}>${l.amountRepaid?.toFixed(2)}</span> / ${l.totalRepayable?.toFixed(2)}</td>
                  <td><Badge type={l.status==='ACTIVE'?'green':l.status==='PAID'?'blue':l.status==='PENDING'?'yellow':'red'}>{l.status}</Badge></td>
                  <td>{l.status==='PENDING'&&<button onClick={()=>setLoanModal(l)} className="btn-primary px-2 py-1 rounded-lg text-xs">Review</button>}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {/* Zelle */}
        {(u.zelleTransfers||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">Zelle History</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Direction</th><th>Amount</th><th>Recipient</th><th>Memo</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{u.zelleTransfers.map(z=>(
                <tr key={z.id}>
                  <td><Badge type={z.direction==='RECEIVED'?'green':'red'}>{z.direction}</Badge></td>
                  <td className="font-semibold" style={{color:z.direction==='RECEIVED'?'#4ade80':'#f87171'}}>{z.direction==='RECEIVED'?'+':'-'}${z.amount?.toFixed(2)}</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{z.recipientName||z.recipientEmail||z.recipientPhone||'—'}</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>{z.memo||'—'}</td>
                  <td><Badge type="green">{z.status}</Badge></td>
                  <td style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{format(new Date(z.createdAt),'MMM d, HH:mm')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {/* CashApp */}
        {(u.cashAppTransfers||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">Cash App History</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Direction</th><th>Amount</th><th>$Cashtag</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>{u.cashAppTransfers.map(c=>(
                <tr key={c.id}>
                  <td><Badge type={c.direction==='RECEIVED'?'green':'red'}>{c.direction}</Badge></td>
                  <td className="font-semibold" style={{color:c.direction==='RECEIVED'?'#4ade80':'#f87171'}}>{c.direction==='RECEIVED'?'+':'-'}${c.amount?.toFixed(2)}</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{c.cashtag||'—'}</td>
                  <td style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>{c.note||'—'}</td>
                  <td style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{format(new Date(c.createdAt),'MMM d, HH:mm')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {/* Bill Payments */}
        {(u.billPayments||[]).length>0&&(
          <div className="card overflow-hidden">
            <div className="px-5 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><h3 className="font-display font-semibold text-white text-sm">Bill Payments</h3></div>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Biller</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{u.billPayments.map(b=>(
                <tr key={b.id}>
                  <td className="font-medium text-white text-xs">{b.billerName}</td>
                  <td><Badge type="gray">{b.billType}</Badge></td>
                  <td className="font-semibold text-white">${b.amount?.toFixed(2)}</td>
                  <td><Badge type="green">{b.status}</Badge></td>
                  <td style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{format(new Date(b.createdAt),'MMM d')}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}
      </div>
    );
  };

  const CreateAccModal = ()=>{
    const [f,setF] = useState({accountType:'SAVINGS',balance:0});
    const save = ()=>action(()=>api.post(`/admin/users/${createAccModal}/accounts`,f),'Account created').then(()=>setCreateAccModal(null));
    return (
      <Modal title="Create Account" onClose={()=>setCreateAccModal(null)}>
        <div className="space-y-3 mb-4">
          <div><label className={lc} style={ls}>TYPE</label><select value={f.accountType} onChange={e=>setF({...f,accountType:e.target.value})} className="inp px-3 py-2.5 rounded-xl text-sm"><option>CHECKING</option><option>SAVINGS</option><option>INVESTMENT</option></select></div>
          <div><label className={lc} style={ls}>OPENING BALANCE ($)</label><input type="number" min="0" value={f.balance} onChange={e=>setF({...f,balance:e.target.value})} className={ic} placeholder="0.00"/></div>
        </div>
        <div className="flex gap-3"><button onClick={()=>setCreateAccModal(null)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button><button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Create</button></div>
      </Modal>
    );
  };

  const tabContent = {dashboard:<Dashboard/>,users:<UsersTab/>,transactions:<TxTab/>,loans:<LoansTab/>,deposits:<DepositsTab/>,fraud:<FraudTab/>,logs:<LogsTab/>,userdetail:<UserDetailTab/>};

  return (
    <div className="flex h-screen" style={{background:'#0B0B0B'}}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0"><Sidebar/></div>

      {/* Mobile sidebar */}
      {sideOpen&&(
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)'}} onClick={()=>setSideOpen(false)}/>
          <div className="relative w-56 z-50"><Sidebar/></div>
          <button onClick={()=>setSideOpen(false)} className="absolute top-4 right-4 z-50 p-2 rounded-xl" style={{background:'rgba(255,255,255,0.08)',color:'white'}}><X size={18}/></button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3" style={{background:'#0F0F0F',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <button onClick={()=>setSideOpen(true)} className="p-2 rounded-xl" style={{color:'rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.05)'}}><Menu size={18}/></button>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={12} color="#000"/></div><span className="font-display font-bold text-white text-sm">ADMIN</span></div>
          <div className="w-6"/>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">{tabContent[tab]||<Dashboard/>}</main>
      </div>

      {/* Modals */}
      {editUser&&<EditUserModal/>}
      {balanceModal&&<BalanceModal/>}
      {addTxModal&&<AddTxModal/>}
      {editTxModal&&<EditTxModal/>}
      {zelleModal&&<ZelleModal/>}
      {cashModal&&<CashModal/>}
      {loanModal&&<LoanModal/>}
      {createAccModal&&<CreateAccModal/>}
    </div>
  );
}
