'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Shield, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const TIERS = {
  STANDARD: { label:'Standard', color:'#64748b', gradient:'linear-gradient(135deg,#334155,#475569)', text:'#e2e8f0', accent:'#94a3b8' },
  GOLD:     { label:'Gold',     color:'#b45309', gradient:'linear-gradient(135deg,#78350f,#b45309,#d97706)', text:'#fef3c7', accent:'#fbbf24' },
  PLATINUM: { label:'Platinum', color:'#475569', gradient:'linear-gradient(135deg,#1e293b,#334155,#64748b)', text:'#f1f5f9', accent:'#e2e8f0' },
  BLACK:    { label:'Black',    color:'#1a1a1a', gradient:'linear-gradient(135deg,#000,#1a1a1a,#2d2d2d)', text:'#FF6A00', accent:'#FF6A00' },
};

const CARD_S = { background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' };
const INP    = { display:'block', width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #ddd', borderRadius:9, fontSize:13, color:'#1a1a1a', outline:'none', boxSizing:'border-box', fontFamily:'inherit' };

function Card3D({ card }) {
  const [flipped, setFlipped] = useState(false);
  const parts   = (card.network || 'VISA|STANDARD').split('|');
  const network = parts[0];
  const tier    = parts[1] || 'STANDARD';
  const t       = TIERS[tier] || TIERS.STANDARD;
  const num     = card.cardNumber || '';

  return (
    <div onClick={() => setFlipped(f => !f)} style={{width:280, height:170, perspective:1000, cursor:'pointer', userSelect:'none'}}>
      <div style={{width:'100%', height:'100%', position:'relative', transformStyle:'preserve-3d', transition:'transform 0.6s cubic-bezier(0.4,0,0.2,1)', transform:flipped?'rotateY(180deg)':'rotateY(0deg)'}}>
        {/* Front */}
        <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', borderRadius:16, overflow:'hidden', background:t.gradient, boxShadow:'0 16px 48px rgba(0,0,0,0.3)'}}>
          <div style={{position:'absolute', inset:0, backgroundImage:'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)', pointerEvents:'none'}}/>
          <div style={{position:'absolute', bottom:-20, right:-20, width:140, height:140, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)'}}/>
          <div style={{position:'relative', padding:20, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', boxSizing:'border-box'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <p style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:12, color:t.text, letterSpacing:'0.08em', margin:0}}>NOVA TRUST</p>
                <p style={{fontSize:9, color:'rgba(255,255,255,0.4)', margin:'2px 0 0', letterSpacing:'0.1em'}}>{t.label.toUpperCase()}</p>
              </div>
              <div style={{width:26, height:18, borderRadius:4, background:'rgba(255,255,255,0.15)'}}/>
            </div>
            <div>
              <p style={{fontFamily:'monospace', fontSize:14, letterSpacing:'0.2em', color:t.text, margin:'0 0 8px', textShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
                {flipped ? num.replace(/(\d{4})/g,'$1 ').trim() : (num ? '•••• •••• •••• '+num.slice(-4) : '•••• •••• •••• ••••')}
              </p>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                <div>
                  <p style={{fontSize:8, color:'rgba(255,255,255,0.4)', margin:'0 0 2px', letterSpacing:'0.06em'}}>CARD HOLDER</p>
                  <p style={{fontSize:10, color:t.text, fontWeight:600, margin:0}}>{card.cardHolder}</p>
                </div>
                <div>
                  <p style={{fontSize:8, color:'rgba(255,255,255,0.4)', margin:'0 0 2px', letterSpacing:'0.06em'}}>EXPIRES</p>
                  <p style={{fontSize:10, color:t.text, fontWeight:600, margin:0}}>{String(card.expiryMonth).padStart(2,'0')}/{String(card.expiryYear).slice(-2)}</p>
                </div>
                <p style={{fontSize:14, fontWeight:800, color:t.accent, margin:0, fontFamily:'Poppins,sans-serif'}}>{network}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Back */}
        <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:16, overflow:'hidden', background:t.gradient, boxShadow:'0 16px 48px rgba(0,0,0,0.3)'}}>
          <div style={{height:44, background:'rgba(0,0,0,0.6)', marginTop:22}}/>
          <div style={{padding:'14px 20px'}}>
            <div style={{background:'rgba(255,255,255,0.1)', borderRadius:6, padding:'8px 12px', display:'flex', justifyContent:'flex-end'}}>
              <p style={{fontFamily:'monospace', fontSize:13, color:t.text, letterSpacing:'0.12em', margin:0}}>{card.cvv || '•••'}</p>
            </div>
            <p style={{fontSize:8, color:'rgba(255,255,255,0.4)', marginTop:4, textAlign:'right'}}>CVV</p>
          </div>
        </div>
      </div>
      <p style={{textAlign:'center', fontSize:10, color:'#aaa', marginTop:6}}>Click to flip</p>
    </div>
  );
}

export default function CardsAdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [cards, setCards]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [modal, setModal]         = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [filterUser, setFilterUser] = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [userAccounts, setUserAccounts] = useState([]);

  const blankForm = { userId:'', accountId:'', cardTier:'STANDARD', network:'VISA', expiryMonth:String(new Date().getMonth()+1), expiryYear:String(new Date().getFullYear()+4), limit:'5000', issuedAt:'' };
  const [form, setForm] = useState(blankForm);

  useEffect(() => { if (!loading && (!user || user.role !== 'ADMIN')) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user?.role === 'ADMIN') { fetchCards(); fetchUsers(); } }, [user, filterUser]);

  const fetchCards = async () => {
    setFetching(true);
    try {
      const p = filterUser ? `?userId=${filterUser}` : '';
      const { data } = await api.get(`/admin/cards${p}`);
      setCards(data.data);
    } catch { toast.error('Failed to load'); }
    finally { setFetching(false); }
  };

  const fetchUsers = async () => {
    try { const { data } = await api.get('/admin/users?limit=100'); setUsers(data.data.users); } catch {}
  };

  const loadUserAccounts = async (uid) => {
    if (!uid) return;
    try {
      const { data } = await api.get(`/admin/users/${uid}`);
      const accs = data.data.accounts || [];
      setUserAccounts(accs);
      if (accs[0]) setForm(p => ({...p, accountId: accs[0].id}));
    } catch {}
  };

  const submitCreate = async () => {
    if (!form.userId) return toast.error('Select a client');
    try { await api.post('/admin/cards', form); toast.success('Card issued!'); setModal(null); fetchCards(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const submitEdit = async () => {
    try { await api.put(`/admin/cards/${editTarget.id}`, form); toast.success('Card updated!'); setModal(null); fetchCards(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteCard = async (id) => {
    if (!confirm('Delete this card permanently?')) return;
    try { await api.delete(`/admin/cards/${id}`); toast.success('Deleted'); fetchCards(); }
    catch { toast.error('Failed'); }
  };

  const getTier = (card) => (card.network || 'VISA|STANDARD').split('|')[1] || 'STANDARD';
  const getNet  = (card) => (card.network || 'VISA|STANDARD').split('|')[0];

  const Overlay = ({ title, onClose, onSubmit, label, children }) => (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div style={{background:'#fff', borderRadius:18, width:'100%', maxWidth:540, maxHeight:'92vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 0'}}>
          <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:17, color:'#1a1a1a', margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#999'}}><X size={20}/></button>
        </div>
        <div style={{padding:'20px 24px'}}>{children}</div>
        <div style={{padding:'0 24px 24px', display:'flex', gap:10}}>
          <button onClick={onClose} style={{flex:1, padding:'11px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#555', fontWeight:600, cursor:'pointer', fontSize:13}}>Cancel</button>
          <button onClick={onSubmit} style={{flex:1, padding:'11px', borderRadius:9, border:'none', background:'#FF6A00', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13}}>{label}</button>
        </div>
      </div>
    </div>
  );

  const Row = ({label, children}) => (
    <div>
      <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>{label}</label>
      {children}
    </div>
  );

  const previewTier = TIERS[form.cardTier] || TIERS.STANDARD;

  if (loading || !user) return null;

  return (
    <div style={{minHeight:'100vh', background:'#f5f6fa', display:'flex'}}>
      {/* Sidebar */}
      <div style={{width:220, background:'#0F0F0F', flexShrink:0, display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:32, height:32, borderRadius:10, background:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center'}}><Shield size={16} color="#000"/></div>
          <div><p style={{fontFamily:'Poppins,sans-serif', fontWeight:700, color:'white', fontSize:13, margin:0}}>NOVA TRUST</p><p style={{fontSize:10, color:'rgba(255,255,255,0.3)', margin:0}}>Admin</p></div>
        </div>
        <nav style={{flex:1, padding:'12px 8px'}}>
          {[
            {href:'/admin',label:'Overview'},
            {href:'/admin',label:'Users'},
            {href:'/admin',label:'Transactions'},
            {href:'/admin',label:'Loans'},
            {href:'/admin/cards',label:'Virtual Cards',active:true},
            {href:'/admin/notifications',label:'Notifications'},
            {href:'/admin',label:'Deposits'},
          ].map(item => (
            <Link key={item.label} href={item.href} style={{display:'block', padding:'9px 12px', borderRadius:10, marginBottom:2, fontSize:13, fontWeight:600, textDecoration:'none', color:item.active?'#FF6A00':'rgba(255,255,255,0.4)', background:item.active?'rgba(255,106,0,0.1)':'transparent', borderRight:item.active?'2px solid #FF6A00':'2px solid transparent'}}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <button onClick={async()=>{await logout();router.push('/login');}} style={{width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'none', background:'transparent', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:13}}><LogOut size={14}/>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1, overflow:'auto', padding:'28px 24px'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          {/* Header */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12}}>
            <div>
              <p style={{fontSize:11, fontWeight:600, color:'#FF6A00', letterSpacing:'0.08em', marginBottom:4}}>ADMIN</p>
              <h1 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:24, color:'#1a1a1a', margin:0}}>Virtual Cards</h1>
            </div>
            <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
              <div style={{display:'flex', border:'1px solid #e5e7eb', borderRadius:9, overflow:'hidden'}}>
                {['grid','table'].map(m => (
                  <button key={m} onClick={() => setViewMode(m)} style={{padding:'8px 14px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:viewMode===m?'#FF6A00':'#fff', color:viewMode===m?'#fff':'#555', textTransform:'capitalize'}}>{m}</button>
                ))}
              </div>
              <button onClick={() => { setForm(blankForm); setUserAccounts([]); setModal('create'); }}
                style={{display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, border:'none', background:'#FF6A00', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer'}}>
                <Plus size={15}/>Issue Card
              </button>
            </div>
          </div>

          {/* Filter + Legend */}
          <div style={{...CARD_S, padding:'14px 18px', marginBottom:20, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{...INP, maxWidth:260}}>
              <option value="">All Clients</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {Object.entries(TIERS).map(([k,t]) => (
                <span key={k} style={{display:'flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:100, background:'#f3f4f6', fontSize:11, fontWeight:700, color:t.color}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:t.color, display:'inline-block'}}/>
                  {t.label}
                </span>
              ))}
            </div>
            <p style={{fontSize:13, color:'#888', marginLeft:'auto'}}>{cards.length} cards</p>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:20}}>
              {fetching ? [1,2,3].map(i => <div key={i} style={{height:280, borderRadius:18, background:'#e5e7eb'}}/>)
              : cards.length === 0 ? <div style={{gridColumn:'1/-1', padding:60, textAlign:'center', color:'#aaa'}}>No cards issued yet</div>
              : cards.map(card => {
                const tier = getTier(card);
                const t = TIERS[tier] || TIERS.STANDARD;
                const lim = card.limit;
                return (
                  <div key={card.id} style={{background:'#fff', borderRadius:18, padding:20, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                    <Card3D card={card}/>
                    <div style={{marginTop:14}}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                        <div>
                          <p style={{fontWeight:700, fontSize:14, color:'#1a1a1a', margin:0}}>{card.account?.user?.firstName} {card.account?.user?.lastName}</p>
                          <p style={{fontSize:11, color:'#999', margin:'2px 0 0'}}>{card.account?.user?.email}</p>
                        </div>
                        <span style={{padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:card.status==='ACTIVE'?'#f0fdf4':card.status==='FROZEN'?'#eff6ff':'#fef2f2', color:card.status==='ACTIVE'?'#16a34a':card.status==='FROZEN'?'#2563eb':'#dc2626'}}>{card.status}</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:12}}>
                        <span>Limit: ${lim?.toLocaleString()}</span>
                        <span>{format(new Date(card.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div style={{display:'flex', gap:8}}>
                        <button onClick={() => { setEditTarget(card); const pts=(card.network||'VISA|STANDARD').split('|'); setForm({cardHolder:card.cardHolder, network:pts[0], cardTier:pts[1]||'STANDARD', expiryMonth:String(card.expiryMonth), expiryYear:String(card.expiryYear), limit:String(card.limit||5000), status:card.status}); setModal('edit'); }}
                          style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:9, border:'1px solid #e5e7eb', background:'#fff', color:'#555', cursor:'pointer', fontSize:13, fontWeight:600}}>
                          <Edit2 size={14}/>Edit
                        </button>
                        <button onClick={() => deleteCard(card.id)} style={{padding:'9px 14px', borderRadius:9, border:'1px solid #fca5a5', background:'#fef2f2', color:'#dc2626', cursor:'pointer'}}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div style={{...CARD_S, overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
                  <thead>
                    <tr style={{background:'#f9fafb'}}>
                      {['User','Last 4','Tier','Network','Holder','Expiry','Limit','Status','Issued','Actions'].map(h => (
                        <th key={h} style={{padding:'12px 14px', textAlign:'left', fontWeight:600, color:'#555', fontSize:11, letterSpacing:'0.06em', whiteSpace:'nowrap', borderBottom:'1px solid #e5e7eb'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? <tr><td colSpan={10} style={{padding:40, textAlign:'center', color:'#aaa'}}>Loading...</td></tr>
                    : cards.length === 0 ? <tr><td colSpan={10} style={{padding:40, textAlign:'center', color:'#aaa'}}>No cards</td></tr>
                    : cards.map((card, i) => {
                      const tier = getTier(card);
                      const t = TIERS[tier] || TIERS.STANDARD;
                      const net = getNet(card);
                      const lim = card.limit;
                      return (
                        <tr key={card.id} style={{background:i%2===0?'#fff':'#fafafa'}}>
                          <td style={{padding:'11px 14px', borderBottom:'1px solid #f0f0f0'}}>
                            <p style={{fontWeight:600, color:'#1a1a1a', margin:0}}>{card.account?.user?.firstName} {card.account?.user?.lastName}</p>
                            <p style={{fontSize:11, color:'#999', margin:0}}>{card.account?.user?.email}</p>
                          </td>
                          <td style={{padding:'11px 14px', fontFamily:'monospace', fontSize:12, color:'#555', borderBottom:'1px solid #f0f0f0'}}>••••{card.cardNumber?.slice(-4)}</td>
                          <td style={{padding:'11px 14px', borderBottom:'1px solid #f0f0f0'}}><span style={{padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700, background:t.color+'18', color:t.color}}>{tier}</span></td>
                          <td style={{padding:'11px 14px', fontWeight:600, color:'#1a1a1a', borderBottom:'1px solid #f0f0f0'}}>{net}</td>
                          <td style={{padding:'11px 14px', color:'#555', borderBottom:'1px solid #f0f0f0', whiteSpace:'nowrap'}}>{card.cardHolder}</td>
                          <td style={{padding:'11px 14px', color:'#555', borderBottom:'1px solid #f0f0f0'}}>{String(card.expiryMonth).padStart(2,'0')}/{String(card.expiryYear).slice(-2)}</td>
                          <td style={{padding:'11px 14px', borderBottom:'1px solid #f0f0f0'}}>${lim?.toLocaleString()}</td>
                          <td style={{padding:'11px 14px', borderBottom:'1px solid #f0f0f0'}}><span style={{padding:'3px 8px', borderRadius:100, fontSize:11, fontWeight:600, background:card.status==='ACTIVE'?'#f0fdf4':card.status==='FROZEN'?'#eff6ff':'#fef2f2', color:card.status==='ACTIVE'?'#16a34a':card.status==='FROZEN'?'#2563eb':'#dc2626'}}>{card.status}</span></td>
                          <td style={{padding:'11px 14px', color:'#888', fontSize:12, borderBottom:'1px solid #f0f0f0', whiteSpace:'nowrap'}}>{format(new Date(card.createdAt),'MMM d, yyyy')}</td>
                          <td style={{padding:'11px 14px', borderBottom:'1px solid #f0f0f0'}}>
                            <div style={{display:'flex', gap:6}}>
                              <button onClick={() => { setEditTarget(card); const pts=(card.network||'VISA|STANDARD').split('|'); setForm({cardHolder:card.cardHolder, network:pts[0], cardTier:pts[1]||'STANDARD', expiryMonth:String(card.expiryMonth), expiryYear:String(card.expiryYear), limit:String(card.limit||5000), status:card.status}); setModal('edit'); }}
                                style={{padding:'5px 10px', borderRadius:7, border:'1px solid #e5e7eb', background:'#fff', color:'#555', cursor:'pointer', fontSize:12}}><Edit2 size={11}/></button>
                              <button onClick={() => deleteCard(card.id)} style={{padding:'5px 10px', borderRadius:7, border:'1px solid #fca5a5', background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:12}}><Trash2 size={11}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modal === 'create' && (
        <Overlay title="Issue Virtual Card" onClose={() => setModal(null)} onSubmit={submitCreate} label="Issue Card">
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <Row label="CLIENT *">
              <select value={form.userId} onChange={e => { setForm(p=>({...p, userId:e.target.value})); loadUserAccounts(e.target.value); }} style={INP}>
                <option value="">Select client...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
              </select>
            </Row>
            {userAccounts.length > 0 && (
              <Row label="ACCOUNT">
                <select value={form.accountId} onChange={e => setForm(p=>({...p, accountId:e.target.value}))} style={INP}>
                  {userAccounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — ${a.balance?.toFixed(2)}</option>)}
                </select>
              </Row>
            )}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <Row label="CARD TIER">
                <select value={form.cardTier} onChange={e => setForm(p=>({...p, cardTier:e.target.value}))} style={INP}>
                  {Object.entries(TIERS).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </Row>
              <Row label="NETWORK">
                <select value={form.network} onChange={e => setForm(p=>({...p, network:e.target.value}))} style={INP}>
                  {['VISA','MASTERCARD','AMEX','DISCOVER'].map(n => <option key={n}>{n}</option>)}
                </select>
              </Row>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <Row label="EXPIRY MONTH">
                <select value={form.expiryMonth} onChange={e => setForm(p=>({...p, expiryMonth:e.target.value}))} style={INP}>
                  {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                </select>
              </Row>
              <Row label="EXPIRY YEAR">
                <select value={form.expiryYear} onChange={e => setForm(p=>({...p, expiryYear:e.target.value}))} style={INP}>
                  {Array.from({length:20},(_,i) => new Date().getFullYear()+i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Row>
            </div>
            <Row label="SPENDING LIMIT ($)">
              <input type="number" min="100" value={form.limit} onChange={e => setForm(p=>({...p, limit:e.target.value}))} style={INP} placeholder="5000"/>
            </Row>
            <Row label="ISSUANCE DATE (optional — allows historical dates from 1990)">
              <input type="date" value={form.issuedAt} onChange={e => setForm(p=>({...p, issuedAt:e.target.value}))} style={INP} min="1990-01-01"/>
            </Row>
            {/* Live preview */}
            <div style={{padding:16, borderRadius:12, background:'#f9fafb', border:'1px solid #e5e7eb'}}>
              <p style={{fontSize:11, fontWeight:600, color:'#888', marginBottom:12, letterSpacing:'0.06em'}}>LIVE PREVIEW</p>
              <div style={{display:'flex', justifyContent:'center'}}>
                <div style={{width:240, height:145, borderRadius:14, background:previewTier.gradient, padding:16, boxSizing:'border-box', boxShadow:'0 8px 24px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                  <p style={{fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:10, color:previewTier.text, margin:0, letterSpacing:'0.08em'}}>NOVA TRUST · {previewTier.label?.toUpperCase()}</p>
                  <div>
                    <p style={{fontFamily:'monospace', fontSize:12, letterSpacing:'0.18em', color:previewTier.text, margin:'0 0 6px'}}>•••• •••• •••• ••••</p>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                      <p style={{fontSize:9, color:'rgba(255,255,255,0.6)', margin:0}}>CLIENT NAME</p>
                      <p style={{fontSize:13, fontWeight:800, color:previewTier.accent, margin:0, fontFamily:'Poppins,sans-serif'}}>{form.network}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Overlay title="Edit Card" onClose={() => setModal(null)} onSubmit={submitEdit} label="Save Changes">
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <Row label="CARD HOLDER NAME">
              <input value={form.cardHolder||''} onChange={e => setForm(p=>({...p, cardHolder:e.target.value}))} style={INP} placeholder="JOHN DOE"/>
            </Row>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <Row label="TIER">
                <select value={form.cardTier||'STANDARD'} onChange={e => setForm(p=>({...p, cardTier:e.target.value}))} style={INP}>
                  {Object.entries(TIERS).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </Row>
              <Row label="NETWORK">
                <select value={form.network||'VISA'} onChange={e => setForm(p=>({...p, network:e.target.value}))} style={INP}>
                  {['VISA','MASTERCARD','AMEX','DISCOVER'].map(n => <option key={n}>{n}</option>)}
                </select>
              </Row>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <Row label="EXPIRY MONTH">
                <select value={form.expiryMonth||''} onChange={e => setForm(p=>({...p, expiryMonth:e.target.value}))} style={INP}>
                  {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                </select>
              </Row>
              <Row label="EXPIRY YEAR">
                <select value={form.expiryYear||''} onChange={e => setForm(p=>({...p, expiryYear:e.target.value}))} style={INP}>
                  {Array.from({length:20},(_,i) => new Date().getFullYear()+i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Row>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <Row label="LIMIT ($)">
                <input type="number" value={form.limit||''} onChange={e => setForm(p=>({...p, limit:e.target.value}))} style={INP}/>
              </Row>
              <Row label="STATUS">
                <select value={form.status||'ACTIVE'} onChange={e => setForm(p=>({...p, status:e.target.value}))} style={INP}>
                  {['ACTIVE','FROZEN','EXPIRED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
                </select>
              </Row>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
