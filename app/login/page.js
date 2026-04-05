'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A1628' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(240,180,41,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)'
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0B429' }}>
              <Shield size={20} style={{ color: '#0A1628' }} />
            </div>
            <span className="text-2xl font-bold text-white font-display">Nova Trust</span>
          </div>
          <h1 className="text-5xl font-bold text-white font-display leading-tight mb-6">
            Banking<br />
            <span style={{ color: '#F0B429' }}>reimagined</span><br />
            for you.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Send money instantly, manage virtual cards, and track every transaction — all in one place.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Active Users', value: '50K+' },
            { label: 'Transactions', value: '$2B+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-2xl font-bold font-display" style={{ color: '#F0B429' }}>{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0B429' }}>
              <Shield size={16} style={{ color: '#0A1628' }} />
            </div>
            <span className="text-xl font-bold font-display" style={{ color: '#0A1628' }}>Nova Trust</span>
          </div>

          <h2 className="text-3xl font-bold font-display mb-2" style={{ color: '#0A1628' }}>Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-slate-900 bg-white transition"
                style={{ '--tw-ring-color': '#F0B429' }}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: '#F0B429' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-slate-900 bg-white transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: '#0A1628', color: '#F0B429' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#0A1628' }}>
              Create one free
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 mb-2">DEMO CREDENTIALS</p>
            <p className="text-xs text-slate-600">👤 User: <span className="font-mono">james@demo.com</span></p>
            <p className="text-xs text-slate-600">👑 Admin: <span className="font-mono">admin@novatrust.com</span></p>
            <p className="text-xs text-slate-600">🔑 Password: <span className="font-mono">Password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
