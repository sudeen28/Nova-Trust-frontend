'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Upload, Camera, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function MobileDepositPage() {
  const [form, setForm] = useState({ amount: '', bankName: '', chequeNumber: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [tab, setTab] = useState('deposit');

  useEffect(() => { fetchDeposits(); }, []);

  const fetchDeposits = async () => {
    try {
      const { data } = await api.get('/account/mobile-deposits');
      setDeposits(data.data);
    } catch {}
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload a cheque image');
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('chequeImage', file);
      formData.append('amount', form.amount);
      formData.append('bankName', form.bankName);
      formData.append('chequeNumber', form.chequeNumber);

      await api.post('/account/mobile-deposit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Mobile deposit submitted! Pending admin review.');
      setForm({ amount: '', bankName: '', chequeNumber: '' });
      setFile(null);
      setPreview(null);
      fetchDeposits();
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending Review' },
      APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' },
    };
    const c = config[status];
    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
        <c.icon size={12} />{c.label}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Mobile Deposit</h1>
        <p className="text-slate-500 text-sm mt-0.5">Deposit a cheque by uploading a photo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {[{ id: 'deposit', label: '📷 New Deposit' }, { id: 'history', label: '📋 My Deposits' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'deposit' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Cheque image upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cheque Photo</label>
                <label className={`relative flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed cursor-pointer transition ${
                  preview ? 'border-green-300' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  {preview ? (
                    <>
                      <img src={preview} alt="Cheque preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-80" />
                      <div className="relative z-10 bg-white/90 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Image selected — click to change</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#f0f4ff' }}>
                        <Camera size={24} style={{ color: '#0A1628' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Click to upload cheque photo</p>
                        <p className="text-xs mt-0.5">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cheque Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input type="number" min="1" step="0.01" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 text-xl font-bold"
                    placeholder="0.00" required />
                </div>
              </div>

              {/* Bank name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name (optional)</label>
                <input type="text" value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                  placeholder="e.g. First Bank" />
              </div>

              {/* Cheque number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cheque Number (optional)</label>
                <input type="text" value={form.chequeNumber}
                  onChange={(e) => setForm({ ...form, chequeNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 font-mono"
                  placeholder="e.g. 0012345" />
              </div>

              <button type="submit" disabled={loading || !file}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: '#0A1628', color: '#F0B429' }}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
                ) : (
                  <><Upload size={18} /> Submit Deposit</>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700">
                ⏱ Deposits are reviewed within 24 hours. Funds will be added to your account once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3 max-w-2xl">
          {deposits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <DollarSign size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No deposits yet</p>
              <p className="text-slate-400 text-sm mt-1">Submit your first mobile deposit above</p>
            </div>
          ) : deposits.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0f4ff' }}>
                    <Camera size={18} style={{ color: '#0A1628' }} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">${d.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {d.bankName || 'Bank not specified'} • Cheque #{d.chequeNumber || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-400">{format(new Date(d.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={d.status} />
                  {d.status === 'REJECTED' && d.rejectionReason && (
                    <p className="text-xs text-red-500 text-right max-w-40">{d.rejectionReason}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
