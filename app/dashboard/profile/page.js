'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Upload, CheckCircle, Clock, XCircle, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', address: '', city: '', country: '', dateOfBirth: ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [kyc, setKyc] = useState(null);
  const [kycFiles, setKycFiles] = useState({ documentFront: null, documentBack: null, selfie: null });
  const [kycForm, setKycForm] = useState({ documentType: 'PASSPORT', documentNumber: '' });
  const [saving, setSaving] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        phone: user.phone || '', address: user.address || '',
        city: user.city || '', country: user.country || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
    fetchKYC();
  }, [user]);

  const fetchKYC = async () => {
    try {
      const { data } = await api.get('/kyc/status');
      setKyc(data.data);
    } catch {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/profile', form);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.patch('/profile/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    setKycLoading(true);
    try {
      const formData = new FormData();
      formData.append('documentType', kycForm.documentType);
      formData.append('documentNumber', kycForm.documentNumber);
      if (kycFiles.documentFront) formData.append('documentFront', kycFiles.documentFront);
      if (kycFiles.documentBack) formData.append('documentBack', kycFiles.documentBack);
      if (kycFiles.selfie) formData.append('selfie', kycFiles.selfie);

      await api.post('/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('KYC documents submitted for review!');
      fetchKYC();
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC submission failed');
    } finally {
      setKycLoading(false);
    }
  };

  const KYCStatusBadge = ({ status }) => {
    const config = {
      PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Not Submitted' },
      SUBMITTED: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Under Review' },
      APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Verified ✓' },
      REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' },
    };
    const c = config[status] || config.PENDING;
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${c.bg}`}>
        <c.icon size={16} className={c.color} />
        <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
      </div>
    );
  };

  const FileInput = ({ label, name, accept = 'image/*,.pdf' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
        kycFiles[name] ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
      }`}>
        <Upload size={16} className={kycFiles[name] ? 'text-green-600' : 'text-slate-400'} />
        <span className={`text-sm ${kycFiles[name] ? 'text-green-700 font-medium' : 'text-slate-500'}`}>
          {kycFiles[name] ? kycFiles[name].name : 'Click to upload'}
        </span>
        <input type="file" accept={accept} className="hidden"
          onChange={(e) => setKycFiles({ ...kycFiles, [name]: e.target.files[0] })} />
      </label>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-display"
              style={{ background: '#0A1628', color: '#F0B429' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-display" style={{ color: '#0A1628' }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{user?.role}</span>
              <KYCStatusBadge status={kyc?.status || 'PENDING'} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'info', label: '👤 Personal Info' },
          { id: 'security', label: '🔒 Security' },
          { id: 'kyc', label: '🪪 Identity (KYC)' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Personal Info */}
        {tab === 'info' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold font-display text-lg mb-5" style={{ color: '#0A1628' }}>Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'First Name', key: 'firstName' },
                  { label: 'Last Name', key: 'lastName' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900" />
                  </div>
                ))}
              </div>
              {[
                { label: 'Phone Number', key: 'phone', type: 'tel' },
                { label: 'Address', key: 'address', type: 'text' },
                { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'City', key: 'city' }, { label: 'Country', key: 'country' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900" />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: '#0A1628', color: '#F0B429' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold font-display text-lg mb-5" style={{ color: '#0A1628' }}>Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                    placeholder="••••••••" required />
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: '#0A1628', color: '#F0B429' }}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* KYC */}
        {tab === 'kyc' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-display text-lg" style={{ color: '#0A1628' }}>Identity Verification</h3>
                <KYCStatusBadge status={kyc?.status || 'PENDING'} />
              </div>

              {kyc?.status === 'APPROVED' ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                  <h4 className="font-bold text-lg text-green-700 mb-1">Identity Verified!</h4>
                  <p className="text-slate-500 text-sm">Your account has full access to all features.</p>
                </div>
              ) : kyc?.status === 'SUBMITTED' ? (
                <div className="text-center py-8">
                  <Clock size={48} className="mx-auto mb-3 text-blue-500" />
                  <h4 className="font-bold text-lg" style={{ color: '#0A1628' }}>Under Review</h4>
                  <p className="text-slate-500 text-sm mt-1">We're reviewing your documents. Usually takes 24 hours.</p>
                  {kyc.submittedAt && <p className="text-xs text-slate-400 mt-2">Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}</p>}
                </div>
              ) : (
                <form onSubmit={handleKYCSubmit} className="space-y-4">
                  {kyc?.status === 'REJECTED' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-red-700 text-sm font-medium">Rejected: {kyc.rejectionReason || 'Documents not accepted'}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                      <select value={kycForm.documentType} onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white">
                        <option value="PASSPORT">Passport</option>
                        <option value="NATIONAL_ID">National ID</option>
                        <option value="DRIVERS_LICENSE">Driver's License</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Number</label>
                      <input type="text" value={kycForm.documentNumber} onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                        placeholder="e.g. AB1234567" required />
                    </div>
                  </div>
                  <FileInput label="Document Front" name="documentFront" />
                  <FileInput label="Document Back (optional)" name="documentBack" />
                  <FileInput label="Selfie with Document" name="selfie" accept="image/*" />
                  <button type="submit" disabled={kycLoading || !kycFiles.documentFront}
                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: '#0A1628', color: '#F0B429' }}>
                    {kycLoading ? 'Submitting...' : <><Upload size={16} /> Submit for Review</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
