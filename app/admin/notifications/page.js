'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Bell, Plus, Edit2, Trash2, X, Users, Shield, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const TYPE_STYLES = {
  INFO:        { bg:'#eff6ff', color:'#1d4ed8', label:'Info'        },
  SUCCESS:     { bg:'#f0fdf4', color:'#16a34a', label:'Success'     },
  WARNING:     { bg:'#fffbeb', color:'#d97706', label:'Warning'     },
  ERROR:       { bg:'#fef2f2', color:'#dc2626', label:'Error'       },
  TRANSACTION: { bg:'#fdf4ff', color:'#9333ea', label:'Transaction' },
};

const CARD = { background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' };
const INP  = { display:'block', width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #ddd', borderRadius:9, fontSize:13, color:'#1a1a1a', outline:'none', boxSizing:'border-box', fontFamily:'inherit' };

export default function NotificationsAdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [filterUser, setFilterUser] = useState('');
  const [selected, setSelected] = useState([]);
  const [form, setForm]     = useState({ userId:'', title:'', message:'', type:'INFO', scheduledAt:'' });
  const [bulkForm, setBulkForm] = useState({ userIds:[], title:'', message:'', type:'INFO', scheduledAt:'' });

  useEffect(() => { if (!loading && (!user || user.role !== 'ADMIN')) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user?.role === 'ADMIN') { fetchNotifications(); fetchUsers(); } }, [user, filterUser]);

  const fetchNotifications = async () => {
    setFetching(true);
    try {
      const params = filterUser ? `?userId=${filterUser}` : '';
      const { data } = await api.get(`/admin/notifications${params}`);
      setNotifications(data.data);
    } catch { toast.error('Failed to load'); }
    finally { setFetching(false); }
  };

  const fetchUsers = async () => {
    try { const { data } = await api.get('/admin/users?limit=100'); setUsers(data.data.users); } catch {}
  };

  const submitCreate = async () => {
    if (!form.userId || !form.title || !form.message) return toast.error('Fill all required fields');
    try { await api.post('/admin/notifications', form); toast.success('Notification sent!'); setModal(null); fetchNotifications(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const submitEdit = async () => {
    try { await api.put(`/admin/notifications/${editTarget.id}`, { title:form.title, message:form.message, type:form.type }); toast.success('Updated'); setModal(null); fetchNotifications(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteNotif = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try { await api.delete(`/admin/notifications/${id}`); toast.success('Deleted'); fetchNotifications(); }
    catch { toast.error('Failed'); }
  };

  const bulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length}?`)) return;
    try { await Promise.all(selected.map(id => api.delete(`/admin/notifications/${id}`))); toast.success('Deleted'); setSelected([]); fetchNotifications(); }
    catch { toast.error('Some failed'); }
  };

  const submitBulk = async () => {
    if (!bulkForm.userIds.length || !bulkForm.title || !bulkForm.message) return toast.error('Select users and fill all fields');
    try { await api.post('/admin/notifications/bulk', bulkForm); toast.success(`Sent to ${bulkForm.userIds.length} users!`); setModal(null); fetchNotifications(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === notifications.length ? [] : notifications.map(n=>n.id));

  const Modal = ({ title, onClose, onSubmit, submitLabel, children }) => (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 0'}}>
          <h3 style={{fontFamily:'Poppins,sans-serif',fontWeight:700,fontSize:17,color:'#1a1a1a',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#999'}}><X size={20}/></button>
        </div>
        <div style={{padding:'20px 24px'}}>{children}</div>
        <div style={{padding:'0 24px 24px',display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'10px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',color:'#555',fontWeight:600,cursor:'pointer',fontSize:13}}>Cancel</button>
          <button onClick={onSubmit} style={{flex:1,padding:'10px',borderRadius:9,border:'none',background:'#FF6A00',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );

  const FormFields = ({ f, setF, showUser=true }) => (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {showUser && (
        <div>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>USER *</label>
          <select value={f.userId} onChange={e=>setF({...f,userId:e.target.value})} style={INP}>
            <option value="">Select user...</option>
            {users.map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
          </select>
        </div>
      )}
      <div>
        <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>TITLE *</label>
        <input value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Notification title" style={INP}/>
      </div>
      <div>
        <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>MESSAGE *</label>
        <textarea value={f.message} onChange={e=>setF({...f,message:e.target.value})} placeholder="Message..." rows={3} style={{...INP,resize:'vertical'}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>TYPE</label>
          <select value={f.type} onChange={e=>setF({...f,type:e.target.value})} style={INP}>
            {Object.entries(TYPE_STYLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:6}}>SCHEDULE (OPTIONAL)</label>
          <input type="datetime-local" value={f.scheduledAt} onChange={e=>setF({...f,scheduledAt:e.target.value})} style={INP}/>
        </div>
      </div>
    </div>
  );

  if (loading || !user) return null;

  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',display:'flex'}}>
      <div style={{width:220,background:'#0F0F0F',flexShrink:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:'#FF6A00',display:'flex',alignItems:'center',justifyContent:'center'}}><Shield size={16} color="#000"/></div>
          <div><p style={{fontFamily:'Poppins,sans-serif',fontWeight:700,color:'white',fontSize:13,margin:0}}>NOVA TRUST</p><p style={{fontSize:10,color:'rgba(255,255,255,0.3)',margin:0}}>Admin</p></div>
        </div>
        <nav style={{flex:1,padding:'12px 8px'}}>
          {[{href:'/admin',label:'Overview'},{href:'/admin',label:'Users'},{href:'/admin',label:'Transactions'},{href:'/admin',label:'Loans'},{href:'/admin/notifications',label:'Notifications',active:true},{href:'/admin',label:'Deposits'}].map(item=>(
            <Link key={item.label} href={item.href} style={{display:'block',padding:'9px 12px',borderRadius:10,marginBottom:2,fontSize:13,fontWeight:600,textDecoration:'none',color:item.active?'#FF6A00':'rgba(255,255,255,0.4)',background:item.active?'rgba(255,106,0,0.1)':'transparent',borderRight:item.active?'2px solid #FF6A00':'2px solid transparent'}}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'12px 8px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <button onClick={async()=>{await logout();router.push('/login');}} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:10,border:'none',background:'transparent',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:13}}>
            <LogOut size={14}/>Sign out
          </button>
        </div>
      </div>

      <div style={{flex:1,overflow:'auto',padding:'28px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontSize:11,fontWeight:600,color:'#FF6A00',letterSpacing:'0.08em',marginBottom:4}}>ADMIN</p>
              <h1 style={{fontFamily:'Poppins,sans-serif',fontWeight:700,fontSize:24,color:'#1a1a1a',margin:0}}>Notifications</h1>
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {selected.length>0&&<button onClick={bulkDelete} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:9,border:'1.5px solid #fca5a5',background:'#fef2f2',color:'#dc2626',fontWeight:600,fontSize:13,cursor:'pointer'}}><Trash2 size={14}/>Delete ({selected.length})</button>}
              <button onClick={()=>setModal('bulk')} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',color:'#555',fontWeight:600,fontSize:13,cursor:'pointer'}}><Users size={14}/>Bulk Send</button>
              <button onClick={()=>{setForm({userId:'',title:'',message:'',type:'INFO',scheduledAt:''});setModal('create');}} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:9,border:'none',background:'#FF6A00',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}><Plus size={15}/>New Notification</button>
            </div>
          </div>

          <div style={{...CARD,padding:'14px 18px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{...INP,maxWidth:280}}>
              <option value="">All Users</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
            <p style={{fontSize:13,color:'#888'}}>{notifications.length} total</p>
          </div>

          <div style={{...CARD,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    <th style={{padding:'12px 14px',borderBottom:'1px solid #e5e7eb'}}><input type="checkbox" checked={selected.length===notifications.length&&notifications.length>0} onChange={toggleAll}/></th>
                    {['User','Title','Message','Type','Read','Date','Actions'].map(h=>(
                      <th key={h} style={{padding:'12px 14px',textAlign:'left',fontWeight:600,color:'#555',fontSize:11,letterSpacing:'0.06em',whiteSpace:'nowrap',borderBottom:'1px solid #e5e7eb'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fetching?<tr><td colSpan={8} style={{padding:40,textAlign:'center',color:'#aaa'}}>Loading...</td></tr>:
                   notifications.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:'center',color:'#aaa'}}>No notifications</td></tr>:
                   notifications.map((n,i)=>{
                    const ts=TYPE_STYLES[n.type]||TYPE_STYLES.INFO;
                    return (
                      <tr key={n.id} style={{background:i%2===0?'#fff':'#fafafa'}}>
                        <td style={{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'}}><input type="checkbox" checked={selected.includes(n.id)} onChange={()=>toggleSelect(n.id)}/></td>
                        <td style={{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'}}><p style={{fontWeight:600,color:'#1a1a1a',margin:0,fontSize:13}}>{n.user?.firstName} {n.user?.lastName}</p><p style={{fontSize:11,color:'#999',margin:0}}>{n.user?.email}</p></td>
                        <td style={{padding:'11px 14px',fontWeight:600,color:'#1a1a1a',borderBottom:'1px solid #f0f0f0',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title}</td>
                        <td style={{padding:'11px 14px',color:'#555',borderBottom:'1px solid #f0f0f0',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.message}</td>
                        <td style={{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'}}><span style={{padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:600,background:ts.bg,color:ts.color}}>{ts.label}</span></td>
                        <td style={{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'}}><span style={{padding:'3px 8px',borderRadius:100,fontSize:11,fontWeight:600,background:n.read?'#f0fdf4':'#fffbeb',color:n.read?'#16a34a':'#d97706'}}>{n.read?'Read':'Unread'}</span></td>
                        <td style={{padding:'11px 14px',color:'#888',fontSize:12,borderBottom:'1px solid #f0f0f0',whiteSpace:'nowrap'}}>{format(new Date(n.createdAt),'MMM d, yyyy HH:mm')}</td>
                        <td style={{padding:'11px 14px',borderBottom:'1px solid #f0f0f0'}}>
                          <div style={{display:'flex',gap:6}}>
                            <button onClick={()=>{setEditTarget(n);setForm({userId:n.userId,title:n.title,message:n.message,type:n.type,scheduledAt:''});setModal('edit');}} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #e5e7eb',background:'#fff',color:'#555',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:12}}><Edit2 size={11}/>Edit</button>
                            <button onClick={()=>deleteNotif(n.id)} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #fca5a5',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:12}}><Trash2 size={11}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modal==='create'&&<Modal title="Send Notification" onClose={()=>setModal(null)} onSubmit={submitCreate} submitLabel="Send"><FormFields f={form} setF={setForm} showUser={true}/></Modal>}
      {modal==='edit'&&<Modal title="Edit Notification" onClose={()=>setModal(null)} onSubmit={submitEdit} submitLabel="Save"><FormFields f={form} setF={setForm} showUser={false}/></Modal>}
      {modal==='bulk'&&(
        <Modal title="Bulk Send Notification" onClose={()=>setModal(null)} onSubmit={submitBulk} submitLabel={`Send to ${bulkForm.userIds.length} Users`}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#555',marginBottom:8}}>SELECT USERS *</label>
            <div style={{border:'1.5px solid #ddd',borderRadius:9,maxHeight:160,overflow:'auto',padding:8}}>
              {users.map(u=>(
                <label key={u.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 8px',borderRadius:7,cursor:'pointer',background:bulkForm.userIds.includes(u.id)?'#fff7ed':'transparent'}}>
                  <input type="checkbox" checked={bulkForm.userIds.includes(u.id)} onChange={e=>setBulkForm(p=>({...p,userIds:e.target.checked?[...p.userIds,u.id]:p.userIds.filter(x=>x!==u.id)}))}/>
                  <span style={{fontSize:13,color:'#1a1a1a'}}>{u.firstName} {u.lastName}</span>
                  <span style={{fontSize:11,color:'#999',marginLeft:'auto'}}>{u.email}</span>
                </label>
              ))}
            </div>
            <button onClick={()=>setBulkForm(p=>({...p,userIds:p.userIds.length===users.length?[]:users.map(u=>u.id)}))} style={{marginTop:8,fontSize:12,color:'#FF6A00',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>{bulkForm.userIds.length===users.length?'Deselect All':'Select All'}</button>
          </div>
          <FormFields f={bulkForm} setF={setBulkForm} showUser={false}/>
        </Modal>
      )}
    </div>
  );
}
