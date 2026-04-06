'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, XCircle, Upload, ArrowLeftRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ firstName:'',lastName:'',phone:'',address:'',city:'',country:'',dateOfBirth:'' });
  const [passwords, setPasswords] = useState({ currentPassword:'',newPassword:'',confirm:'' });
  const [kyc, setKyc] = useState(null);
  const [kycFiles, setKycFiles] = useState({ documentFront:null, documentBack:null, selfie:null });
  const [kycForm, setKycForm] = useState({ documentType:'PASSPORT', documentNumber:'' });
  const [saving, setSaving] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName:user.firstName||'', lastName:user.lastName||'', phone:user.phone||'', address:user.address||'', city:user.city||'', country:user.country||'', dateOfBirth:user.dateOfBirth?user.dateOfBirth.split('T')[0]:'' });
    fetchKYC();
  }, [user]);

  const fetchKYC = async () => {
    try { const { data } = await api.get('/kyc/status'); setKyc(data.data); } catch {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.patch('/profile', form); await refreshUser(); toast.success('Profile updated'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try { await api.patch('/profile/change-password', { currentPassword:passwords.currentPassword, newPassword:passwords.newPassword }); toast.success('Password updated'); setPasswords({ currentPassword:'',newPassword:'',confirm:'' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault(); setKycLoading(true);
    try {
      const fd = new FormData();
      fd.append('documentType', kycForm.documentType);
      fd.append('documentNumber', kycForm.documentNumber);
      if (kycFiles.documentFront) fd.append('documentFront', kycFiles.documentFront);
      if (kycFiles.documentBack) fd.append('documentBack', kycFiles.documentBack);
      if (kycFiles.selfie) fd.append('selfie', kycFiles.selfie);
      await api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('KYC submitted for review');
      fetchKYC();
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setKycLoading(false); }
  };

  const handleSwitchAccount = async () => {
    try {
      const { data } = await api.patch('/account/switch-type');
      toast.success(data.message);
      await refreshUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const KYCBadge = ({ status }) => {
    const cfg = {
      PENDING:   { icon: Clock,        color: '#fbbf24', label: 'Not Submitted' },
      SUBMITTED: { icon: Clock,        color: '#818cf8', label: 'Under Review' },
      APPROVED:  { icon: CheckCircle,  color: '#4ade80', label: 'Verified' },
      REJECTED:  { icon: XCircle,      color: '#f87171', label: 'Rejected' },
    }[status] || { icon: Clock, color: '#fbbf24', label: 'Pending' };
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
        <cfg.icon size={11} />{cfg.label}
      </span>
    );
  };

  const tabs = [{ id:'info', label:'Personal Info' }, { id:'security', label:'Security' }, { id:'kyc', label:'Identity (KYC)' }, { id:'account', label:'Account Settings' }];

  const inputCls = "elite-input w-full px-4 py-3 rounded-xl text-sm";
  const labelCls = "block text-xs font-semibold tracking-wide mb-1.5";

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display flex-shrink-0"
          style={{ background: 'rgba(255,106,0,0.1)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-white">{user?.firstName} {user?.lastName}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>{user?.role}</span>
            <KYCBadge status={kyc?.status || 'PENDING'} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === id ? { background: 'rgba(255,106,0,0.15)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' } : { color: 'rgba(255,255,255,0.35)' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-xl">

        {/* Personal info */}
        {tab === 'info' && (
          <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-display font-semibold text-white mb-5">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[{ label:'FIRST NAME', key:'firstName' }, { label:'LAST NAME', key:'lastName' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                  </div>
                ))}
              </div>
              {[{ label:'PHONE', key:'phone', type:'tel' }, { label:'ADDRESS', key:'address', type:'text' }, { label:'DATE OF BIRTH', key:'dateOfBirth', type:'date' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ label:'CITY', key:'city' }, { label:'COUNTRY', key:'country' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-display font-semibold text-white mb-5">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[{ label:'CURRENT PASSWORD', key:'currentPassword' }, { label:'NEW PASSWORD', key:'newPassword' }, { label:'CONFIRM PASSWORD', key:'confirm' }].map(({ label, key }) => (
                <div key={key}>
                  <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
                  <input type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} className={inputCls} placeholder="••••••••" required />
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* KYC */}
        {tab === 'kyc' && (
          <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white">Identity Verification</h3>
              <KYCBadge status={kyc?.status || 'PENDING'} />
            </div>
            {kyc?.status === 'APPROVED' ? (
              <div className="text-center py-10">
                <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#4ade80' }} />
                <p className="font-semibold text-white mb-1">Identity Verified</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Your account has full access</p>
              </div>
            ) : kyc?.status === 'SUBMITTED' ? (
              <div className="text-center py-10">
                <Clock size={40} className="mx-auto mb-3" style={{ color: '#818cf8' }} />
                <p className="font-semibold text-white mb-1">Under Review</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Usually completed within 24 hours</p>
              </div>
            ) : (
              <form onSubmit={handleKYCSubmit} className="space-y-4">
                {kyc?.status === 'REJECTED' && (
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>
                    Rejected: {kyc.rejectionReason || 'Documents not accepted'}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>DOCUMENT TYPE</label>
                    <select value={kycForm.documentType} onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })} className="elite-input w-full px-3 py-3 rounded-xl text-sm select-input">
                      {['PASSPORT','NATIONAL_ID','DRIVERS_LICENSE'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>DOCUMENT NUMBER</label>
                    <input type="text" value={kycForm.documentNumber} onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })} className={inputCls} placeholder="AB1234567" required />
                  </div>
                </div>
                {[{ label:'DOCUMENT FRONT', name:'documentFront' }, { label:'DOCUMENT BACK', name:'documentBack' }, { label:'SELFIE WITH DOCUMENT', name:'selfie' }].map(({ label, name }) => (
                  <div key={name}>
                    <label className={labelCls} style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
                    <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition" style={{ border: `1px dashed ${kycFiles[name] ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, background: kycFiles[name] ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.02)' }}>
                      <Upload size={14} style={{ color: kycFiles[name] ? '#4ade80' : 'rgba(255,255,255,0.2)' }} />
                      <span className="text-xs" style={{ color: kycFiles[name] ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>{kycFiles[name] ? kycFiles[name].name : 'Upload file'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setKycFiles({ ...kycFiles, [name]: e.target.files[0] })} />
                    </label>
                  </div>
                ))}
                <button type="submit" disabled={kycLoading || !kycFiles.documentFront} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                  <Upload size={14} />{kycLoading ? 'Submitting...' : 'Submit for Review'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Account Settings */}
        {tab === 'account' && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-display font-semibold text-white mb-5">Account Settings</h3>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-semibold text-white">Account Type</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Currently: {user?.account?.accountType || 'CHECKING'}</p>
              </div>
              <button onClick={handleSwitchAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition btn-ghost">
                <ArrowLeftRight size={13} />Switch Type
              </button>
            </div>
            <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,106,0,0.04)', border: '1px solid rgba(255,106,0,0.08)', color: 'rgba(255,106,0,0.5)' }}>
              Switching between Checking and Savings will preserve your balance and transaction history.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
