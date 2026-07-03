'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield, ArrowRight, Lock } from 'lucide-react';

// ── Nova Trust loading splash ─────────────────────────────────────
function LoadingSplash({ message = 'Signing you in…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0B0B0B' }}>

      {/* Animated rings */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-24 h-24 rounded-full border-2 animate-ping"
          style={{ borderColor: 'rgba(255,106,0,0.15)', animationDuration: '2s' }} />
        <div className="absolute w-16 h-16 rounded-full border animate-ping"
          style={{ borderColor: 'rgba(255,106,0,0.25)', animationDuration: '1.5s', animationDelay: '0.3s' }} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
          style={{ background: '#FF6A00', boxShadow: '0 0 40px rgba(255,106,0,0.4)' }}>
          <Shield size={26} color="#000" strokeWidth={2.5} />
        </div>
      </div>

      <p className="font-display font-bold text-white text-xl tracking-tight mb-1">
        NOVA TRUST
      </p>
      <p className="text-xs font-semibold tracking-widest mb-8"
        style={{ color: 'rgba(255,106,0,0.7)' }}>
        PRIVATE BANKING
      </p>

      {/* Progress bar */}
      <div className="w-48 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full animate-progress"
          style={{ background: '#FF6A00' }} />
      </div>
      <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {message}
      </p>

      <style>{`
        @keyframes progress {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 100%; margin-left: 0; }
        }
        .animate-progress {
          animation: progress 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ── Main login page ───────────────────────────────────────────────
export default function LoginPage() {
  const { hydrateUser } = useAuth();
  const router = useRouter();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [splash, setSplash]   = useState(false); // Nova Trust loading screen

  const [step, setStep]       = useState('credentials'); // 'credentials' | 'otp'
  const [otpData, setOtpData] = useState({ userId: '', maskedEmail: '', firstName: '' });
  const [otp, setOtp]         = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending]   = useState(false);

  // ── Step 1: credentials ──────────────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setOtpData({
        userId:      data.data.userId,
        maskedEmail: data.data.maskedEmail,
        firstName:   data.data.firstName,
      });
      setStep('otp');
      toast.success(`Code sent to ${data.data.maskedEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit code');
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: otpData.userId, otp });
      Cookies.set('accessToken',  data.data.accessToken,  { expires: 1 });
      Cookies.set('refreshToken', data.data.refreshToken, { expires: 7 });

      // Show Nova Trust splash while hydrating user and navigating
      setSplash(true);
      await hydrateUser();

      const dest = data.data.user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(dest);
    } catch (err) {
      setOtpLoading(false);
      toast.error(err.response?.data?.message || 'Invalid code');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId: otpData.userId });
      toast.success('New code sent!');
      setOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please wait before resending');
    } finally {
      setResending(false);
    }
  };

  // Show splash overlay when signing in
  if (splash) return <LoadingSplash message="Preparing your account…" />;

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0B0B' }}>

      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: '#0F0F0F', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(255,106,0,0.05) 0%, transparent 55%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#FF6A00' }}>
            <Shield size={18} color="#000" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">NOVA TRUST</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: '#FF6A00' }}>
            PRIVATE BANKING PLATFORM
          </p>
          <h1 className="font-display text-5xl font-bold text-white leading-[1.1] mb-5">
            Financial<br />excellence<br />
            <span style={{ color: '#FF6A00' }}>redefined.</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Secured with two-factor authentication — every login verified.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { v: '$2.4B+', l: 'Managed'   },
            { v: '2FA',    l: 'Protected' },
            { v: '256-bit', l: 'Encrypted' },
          ].map(s => (
            <div key={s.l} className="p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-display font-bold text-white text-lg">{s.v}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ background: '#0B0B0B' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#FF6A00' }}>
              <Shield size={16} color="#000" />
            </div>
            <span className="font-display font-bold text-white">NOVA TRUST</span>
          </div>

          {/* ── STEP 1: CREDENTIALS ── */}
          {step === 'credentials' && (
            <>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>
                SECURE ACCESS
              </p>
              <h2 className="font-display text-3xl font-bold text-white mb-1">Sign In</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Access your private portfolio
              </p>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>EMAIL</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="inp px-4 py-3.5 rounded-xl text-sm"
                    style={{ background: '#161616', color: '#fff', borderColor: 'rgba(255,255,255,0.08)', fontSize: '16px' }}
                    placeholder="username or email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="inp px-4 py-3.5 rounded-xl text-sm pr-11"
                      style={{ background: '#161616', color: '#fff', borderColor: 'rgba(255,255,255,0.08)', fontSize: '16px' }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link href="/forgot-password" className="text-xs"
                      style={{ color: 'rgba(255,106,0,0.6)' }}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    : <><span>Continue</span><ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)' }}>
                <Lock size={24} style={{ color: '#FF6A00' }} />
              </div>

              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>
                TWO-FACTOR VERIFICATION
              </p>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Enter Code</h2>
              <p className="text-sm mb-1" style={{ color: '#888888' }}>
                A 6-digit code was sent to
              </p>
              <p className="text-base font-semibold mb-8" style={{ color: '#cccccc' }}>
                {otpData.maskedEmail}
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                    style={{ color: '#999999' }}>
                    VERIFICATION CODE
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="inp px-4 py-5 rounded-xl text-4xl font-bold text-center tracking-[0.5em] font-mono"
                    style={{ background: '#1a1a1a', color: '#ffffff', borderColor: 'rgba(255,106,0,0.3)', fontSize: '16px' }}
                    placeholder="──────"
                    autoFocus
                    required
                  />
                  <p className="text-xs mt-2 text-center" style={{ color: '#777777' }}>
                    Code expires in 10 minutes
                  </p>
                </div>

                <button type="submit" disabled={otpLoading || otp.length !== 6}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {otpLoading
                    ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    : <><Lock size={15} /><span>Verify & Sign In</span></>}
                </button>
              </form>

              <div className="flex items-center justify-between mt-5">
                <button onClick={() => { setStep('credentials'); setOtp(''); }}
                  className="text-xs" style={{ color: '#888888' }}>
                  ← Back to login
                </button>
                <button onClick={handleResend} disabled={resending}
                  className="text-xs font-semibold"
                  style={{ color: resending ? 'rgba(255,106,0,0.35)' : '#FF6A00' }}>
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
