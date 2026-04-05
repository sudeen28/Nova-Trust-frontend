'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(form.password) },
    { label: 'Number', valid: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordChecks.every(c => c.valid)) {
      toast.error('Please meet all password requirements');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Nova Trust 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0A1628' }}>
            <Shield size={18} style={{ color: '#F0B429' }} />
          </div>
          <span className="text-xl font-bold font-display" style={{ color: '#0A1628' }}>Nova Trust</span>
        </div>

        <h2 className="text-3xl font-bold font-display mb-1" style={{ color: '#0A1628' }}>Create your account</h2>
        <p className="text-slate-500 mb-8">Get started with $1,000 welcome bonus</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white"
                  placeholder="James" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white"
                  placeholder="Carter" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white"
                placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white"
                placeholder="+1 555 000 0000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 bg-white pr-12"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${check.valid ? 'bg-green-500' : 'bg-slate-200'}`}>
                        {check.valid && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs ${check.valid ? 'text-green-700' : 'text-slate-400'}`}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 mt-2"
              style={{ background: '#0A1628', color: '#F0B429' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0A1628' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
