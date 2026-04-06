'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield, Check, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: '8+ characters', valid: form.password.length >= 8 },
    { label: 'Uppercase', valid: /[A-Z]/.test(form.password) },
    { label: 'Lowercase', valid: /[a-z]/.test(form.password) },
    { label: 'Number', valid: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checks.every(c => c.valid)) return toast.error('Password requirements not met');
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to Nova Trust');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0B0B0B' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FF6A00' }}>
            <Shield size={14} color="#000" />
          </div>
          <span className="font-display font-bold text-white tracking-tight">NOVA TRUST</span>
        </div>

        <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>NEW CLIENT</p>
        <h2 className="font-display text-3xl font-bold text-white mb-1">Open Account</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Join an exclusive circle of private banking clients</p>

        <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'FIRST NAME', key: 'firstName', placeholder: 'James' }, { label: 'LAST NAME', key: 'lastName', placeholder: 'Carter' }].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
                  <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="elite-input w-full px-3 py-3 rounded-xl text-sm" placeholder={placeholder} required />
                </div>
              ))}
            </div>

            {[
              { label: 'EMAIL ADDRESS', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'PHONE (OPTIONAL)', key: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="elite-input w-full px-4 py-3 rounded-xl text-sm" placeholder={placeholder} />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>PASSWORD</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="elite-input w-full px-4 py-3 rounded-xl text-sm pr-11"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${c.valid ? 'bg-orange-500' : 'bg-surface3'}`}>
                        {c.valid && <Check size={8} color="#000" strokeWidth={3} />}
                      </div>
                      <span className="text-xs" style={{ color: c.valid ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-1">
              {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Already a client?{' '}
          <Link href="/login" style={{ color: '#FF6A00' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
