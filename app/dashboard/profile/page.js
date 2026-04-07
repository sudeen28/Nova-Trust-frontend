'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, XCircle, Upload, Save, Shield, Key, CreditCard, User } from 'lucide-react';

/* ─── shared input style ─── */
const INP = {
  display:'block', width:'100%', padding:'11px 14px',
  background:'#fff', border:'1.5px solid #ddd', borderRadius:10,
  fontSize:14, color:'#1a1a1a', outline:'none', boxSizing:'border-box',
  transition:'border-color 0.2s, box-shadow 0.2s', fontFamily:'inherit',
};
const INP_FOCUS = { borderColor:'#FF6A00', boxShadow:'0 0 0 3px rgba(255,106,0,0.1)' };

function Field({ label, value, onChange, type='text', placeholder='', required=false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:'0.04em'}}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={focused ? {...INP, ...INP_FOCUS} : INP}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:'0.04em'}}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={focused ? {...INP, ...INP_FOCUS} : INP}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

const TABS = [
  { id:'info',     label:'Personal Info',    icon:User      },
  { id:'security', label:'Security',         icon:Key       },
  { id:'kyc',      label:'Identity (KYC)',   icon:Shield    },
  { id:'account',  label:'Account',          icon:CreditCard},
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab]         = useState('info');
  const [saving, setSaving]   = useState(false);
  const [kyc, setKyc]         = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycFiles, setKycFiles]     = useState({ documentFront:null, documentBack:null, selfie:null });
  const [kycForm, setKycForm]       = useState({ documentType:'PASSPORT', documentNumber:'' });

  const [form, setForm] = useState({
    firstName:'', lastName:'', phone:'', address:'', city:'', country:'', dateOfBirth:'',
  });
  const [passwords, setPasswords] = useState({
    currentPassword:'', newPassword:'', confirm:'',
  });

  const f = (k) => (v) => setForm(p => ({...p, [k]:v}));
  const p = (k) => (v) => setPasswords(prev => ({...prev, [k]:v}));

  const fetchKYC = useCallback(async () => {
    try { const { data } = await api.get('/kyc/status'); setKyc(data.data); } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        firstName:   user.firstName   || '',
        lastName:    user.lastName    || '',
        phone:       user.phone       || '',
        address:     user.address     || '',
        city:        user.city        || '',
        country:     user.country     || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    }
    fetchKYC();
  }, [user, fetchKYC]);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.patch('/profile', form);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await api.patch('/profile/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated');
      setPasswords({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const submitKYC = async (e) => {
    e.preventDefault(); setKycLoading(true);
    try {
      const fd = new FormData();
      fd.append('documentType', kycForm.documentType);
      fd.append('documentNumber', kycForm.documentNumber);
      if (kycFiles.documentFront) fd.append('documentFront', kycFiles.documentFront);
      if (kycFiles.documentBack)  fd.append('documentBack',  kycFiles.documentBack);
      if (kycFiles.selfie)        fd.append('selfie',        kycFiles.selfie);
      await api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('KYC submitted for review');
      fetchKYC();
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setKycLoading(false); }
  };

  const switchAccount = async (type) => {
    try {
      await api.patch('/account/switch-type', { accountType: type });
      await refreshUser();
      toast.success(`Switched to ${type}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to switch'); }
  };

  const KYCBadge = ({ status }) => {
    const cfg = {
      PENDING:   { color:'#f59e0b', bg:'#fffbeb', label:'Not Submitted' },
      SUBMITTED: { color:'#6366f1', bg:'#eef2ff', label:'Under Review'  },
      APPROVED:  { color:'#16a34a', bg:'#f0fdf4', label:'Verified ✓'    },
      REJECTED:  { color:'#dc2626', bg:'#fef2f2', label:'Rejected'      },
    }[status] || { color:'#f59e0b', bg:'#fffbeb', label:'Pending' };
    return (
      <span style={{padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}30`}}>
        {cfg.label}
      </span>
    );
  };

  const card = {background:'#fff', borderRadius:16, padding:28, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'};
  const btnPrimary = {background:'#FF6A00', color:'#fff', border:'none', borderRadius:10, padding:'11px 20px', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, justifyContent:'center', width:'100%', boxShadow:'0 2px 12px rgba(255,106,0,0.2)', transition:'opacity 0.2s'};

  return (
    <div style={{padding:'24px', maxWidth:680, margin:'0 auto'}}>

      {/* Profile header */}
      <div style={{...card, display:'flex', alignItems:'center', gap:16, marginBottom:24}}>
        <div style={{width:56, height:56, borderRadius:16, background:'rgba(255,106,0,0.1)', color:'#FF6A00', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, fontFamily:'Poppins,sans-serif', flexShrink:0, border:'2px solid rgba(255,106,0,0.2)'}}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'#1a1a1a', margin:0}}>{user?.firstName} {user?.lastName}</h2>
          <p style={{fontSize:13, color:'#888', margin:'2px 0 8px'}}>{user?.email}</p>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
            <span style={{padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:'#f3f4f6', color:'#555'}}>{user?.role}</span>
            <span style={{padding:'2px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:'rgba(255,106,0,0.08)', color:'#FF6A00'}}>{user?.tier || 'STANDARD'}</span>
            <KYCBadge status={kyc?.status || 'PENDING'} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:'flex', gap:4, marginBottom:20, background:'#f3f4f6', borderRadius:12, padding:4, overflowX:'auto'}}>
        {TABS.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex:1, minWidth:100, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'9px 12px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              transition:'all 0.18s', whiteSpace:'nowrap',
              background: tab===id ? '#fff' : 'transparent',
              color:      tab===id ? '#FF6A00' : '#888',
              boxShadow:  tab===id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {/* ── PERSONAL INFO ── */}
      {tab === 'info' && (
        <div style={card}>
          <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', marginBottom:20}}>Personal Information</h3>
          <form onSubmit={saveProfile} style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <Field label="FIRST NAME" value={form.firstName} onChange={f('firstName')} placeholder="James" required />
              <Field label="LAST NAME"  value={form.lastName}  onChange={f('lastName')}  placeholder="Carter" required />
            </div>
            <Field label="PHONE NUMBER" value={form.phone}    onChange={f('phone')}    type="tel"  placeholder="+1 555 000 0000" />
            <Field label="ADDRESS"      value={form.address}  onChange={f('address')}  placeholder="123 Main St" />
            <Field label="DATE OF BIRTH" value={form.dateOfBirth} onChange={f('dateOfBirth')} type="date" />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
              <Field label="CITY"    value={form.city}    onChange={f('city')}    placeholder="New York" />
              <Field label="COUNTRY" value={form.country} onChange={f('country')} placeholder="United States" />
            </div>
            <button type="submit" disabled={saving} style={{...btnPrimary, opacity:saving?0.7:1}}>
              <Save size={15}/>{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === 'security' && (
        <div style={card}>
          <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', marginBottom:20}}>Change Password</h3>
          <form onSubmit={changePassword} style={{display:'flex', flexDirection:'column', gap:14}}>
            <Field label="CURRENT PASSWORD" value={passwords.currentPassword} onChange={p('currentPassword')} type="password" placeholder="••••••••" required />
            <Field label="NEW PASSWORD"      value={passwords.newPassword}     onChange={p('newPassword')}     type="password" placeholder="Min 8 characters" required />
            <Field label="CONFIRM PASSWORD"  value={passwords.confirm}         onChange={p('confirm')}         type="password" placeholder="Repeat new password" required />
            <div style={{padding:'12px 14px', background:'#fffbeb', borderRadius:10, border:'1px solid #fde68a', fontSize:13, color:'#92400e'}}>
              Password must be at least 8 characters and contain uppercase, lowercase, and a number.
            </div>
            <button type="submit" disabled={saving} style={{...btnPrimary, opacity:saving?0.7:1}}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── KYC ── */}
      {tab === 'kyc' && (
        <div style={card}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
            <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', margin:0}}>Identity Verification</h3>
            <KYCBadge status={kyc?.status || 'PENDING'} />
          </div>
          {kyc?.status === 'APPROVED' ? (
            <div style={{textAlign:'center', padding:'32px 0'}}>
              <CheckCircle size={44} style={{color:'#16a34a', marginBottom:12}} />
              <p style={{fontWeight:700, color:'#1a1a1a', marginBottom:4}}>Identity Verified</p>
              <p style={{fontSize:13, color:'#888'}}>Your account has full access to all features.</p>
            </div>
          ) : kyc?.status === 'SUBMITTED' ? (
            <div style={{textAlign:'center', padding:'32px 0'}}>
              <Clock size={44} style={{color:'#6366f1', marginBottom:12}} />
              <p style={{fontWeight:700, color:'#1a1a1a', marginBottom:4}}>Documents Under Review</p>
              <p style={{fontSize:13, color:'#888'}}>Usually completed within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submitKYC} style={{display:'flex', flexDirection:'column', gap:14}}>
              {kyc?.status === 'REJECTED' && (
                <div style={{padding:'12px 14px', background:'#fef2f2', borderRadius:10, border:'1px solid #fca5a5', color:'#dc2626', fontSize:13}}>
                  ❌ Rejected: {kyc.rejectionReason || 'Documents not accepted. Please resubmit.'}
                </div>
              )}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <SelectField label="DOCUMENT TYPE" value={kycForm.documentType} onChange={v => setKycForm({...kycForm, documentType:v})}
                  options={['PASSPORT','NATIONAL_ID','DRIVERS_LICENSE']} />
                <Field label="DOCUMENT NUMBER" value={kycForm.documentNumber} onChange={v => setKycForm({...kycForm, documentNumber:v})} placeholder="AB1234567" required />
              </div>
              {[{l:'DOCUMENT FRONT *', n:'documentFront'}, {l:'DOCUMENT BACK', n:'documentBack'}, {l:'SELFIE WITH DOCUMENT', n:'selfie'}].map(({l, n}) => (
                <div key={n}>
                  <label style={{display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6}}>{l}</label>
                  <label style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, border:`1.5px dashed ${kycFiles[n] ? '#16a34a' : '#ccc'}`, background:kycFiles[n] ? '#f0fdf4' : '#fafafa', cursor:'pointer', transition:'all 0.2s'}}>
                    <Upload size={16} style={{color: kycFiles[n] ? '#16a34a' : '#aaa', flexShrink:0}} />
                    <span style={{fontSize:13, color: kycFiles[n] ? '#16a34a' : '#999'}}>
                      {kycFiles[n] ? `✓ ${kycFiles[n].name}` : 'Click to upload (JPG, PNG, PDF)'}
                    </span>
                    <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setKycFiles({...kycFiles, [n]: e.target.files[0]})} />
                  </label>
                </div>
              ))}
              <button type="submit" disabled={kycLoading || !kycFiles.documentFront} style={{...btnPrimary, opacity:(kycLoading||!kycFiles.documentFront)?0.5:1}}>
                <Upload size={15}/>{kycLoading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── ACCOUNT SETTINGS ── */}
      {tab === 'account' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div style={card}>
            <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', marginBottom:16}}>Account Type</h3>
            <p style={{fontSize:13, color:'#888', marginBottom:16}}>Switch between account types. Your balance and transaction history are preserved.</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
              {[
                {type:'CHECKING',   icon:'💳', desc:'No monthly fees',    color:'#FF6A00'},
                {type:'SAVINGS',    icon:'🏦', desc:'2.5% APY',          color:'#16a34a'},
                {type:'INVESTMENT', icon:'📈', desc:'7.0% Est. return',  color:'#6366f1'},
              ].map(({type, icon, desc, color}) => {
                const active = user?.accounts?.some(a => a.accountType === type);
                return (
                  <button key={type} onClick={() => !active && switchAccount(type)}
                    disabled={active}
                    style={{
                      padding:'16px 12px', borderRadius:12, border:`2px solid ${active ? color : '#e5e7eb'}`,
                      background: active ? `${color}08` : '#fafafa',
                      cursor: active ? 'default' : 'pointer', textAlign:'center',
                      transition:'all 0.2s', opacity:1,
                    }}>
                    <div style={{fontSize:24, marginBottom:8}}>{icon}</div>
                    <p style={{fontSize:12, fontWeight:700, color: active ? color : '#444', marginBottom:4}}>{type}</p>
                    <p style={{fontSize:11, color:'#999'}}>{desc}</p>
                    {active && <p style={{fontSize:10, color, marginTop:6, fontWeight:600}}>✓ ACTIVE</p>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <h3 style={{fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#1a1a1a', marginBottom:12}}>Your Accounts</h3>
            {(user?.accounts || []).length === 0 ? (
              <p style={{color:'#999', fontSize:13}}>No accounts found.</p>
            ) : (user?.accounts || []).map(acc => (
              <div key={acc.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, border:'1px solid #e5e7eb', marginBottom:8, background:'#fafafa'}}>
                <div>
                  <p style={{fontWeight:600, fontSize:14, color:'#1a1a1a'}}>{acc.accountType}</p>
                  <p style={{fontSize:12, color:'#888', fontFamily:'monospace'}}>{acc.accountNumber}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontWeight:700, fontSize:16, color:'#1a1a1a'}}>${acc.balance?.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                  <span style={{fontSize:11, padding:'2px 8px', borderRadius:100, background:acc.isActive?'#f0fdf4':'#fef2f2', color:acc.isActive?'#16a34a':'#dc2626'}}>{acc.isActive?'Active':'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
