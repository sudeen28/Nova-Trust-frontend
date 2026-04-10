'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Shield, ArrowRight, Lock, Eye, EyeOff, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setUserId(data.data?.userId || '');
      setStep('otp');
      toast.success('Check your email for the code');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit code');
    // We just move forward — the reset-password endpoint will validate the OTP
    setStep('reset');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp, newPassword: passwords.newPassword });
      setStep('done');
      toast.success('Password reset successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const lc = "block text-xs font-semibold tracking-widest mb-2";
  const ls = { color: 'rgba(255,255,255,0.35)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0B0B0B' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FF6A00' }}>
            <Shield size={16} color="#000" />
          </div>
          <span className="font-display font-bold text-white">NOVA TRUST</span>
        </div>

        {/* STEP: Email */}
        {step === 'email' && (
          <>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>ACCOUNT RECOVERY</p>
            <h2 className="font-display text-3xl font-bold text-white mb-1">Reset Password</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Enter your email and we'll send a verification code.</p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className={lc} style={ls}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="inp px-4 py-3.5 rounded-xl text-sm" placeholder="you@example.com" required autoFocus />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><span>Send Code</span><ArrowRight size={15} /></>}
              </button>
            </form>
            <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Remember it? <Link href="/login" style={{ color: '#FF6A00' }}>Sign in</Link>
            </p>
          </>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.2)' }}>
              <Lock size={22} style={{ color: '#FF6A00' }} />
            </div>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>VERIFICATION</p>
            <h2 className="font-display text-3xl font-bold text-white mb-1">Enter Code</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
              We sent a 6-digit code to <span style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</span>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className={lc} style={ls}>VERIFICATION CODE</label>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="inp px-4 py-4 rounded-xl text-3xl font-bold text-center tracking-[0.4em] font-mono"
                  placeholder="000000" autoFocus required />
                <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Expires in 10 minutes</p>
              </div>
              <button type="submit" disabled={otp.length !== 6}
                className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <span>Continue</span><ArrowRight size={15} />
              </button>
            </form>
            <button onClick={() => setStep('email')} className="w-full text-center text-xs mt-4 transition" style={{ color: 'rgba(255,255,255,0.3)' }}>← Back</button>
          </>
        )}

        {/* STEP: New Password */}
        {step === 'reset' && (
          <>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>NEW PASSWORD</p>
            <h2 className="font-display text-3xl font-bold text-white mb-1">Set Password</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Choose a strong password for your account.</p>
            <form onSubmit={handleReset} className="space-y-4">
              {[
                { label: 'NEW PASSWORD', key: 'newPassword' },
                { label: 'CONFIRM PASSWORD', key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className={lc} style={ls}>{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={passwords[key]}
                      onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                      className="inp px-4 py-3.5 rounded-xl text-sm pr-11" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Lock size={15} /><span>Reset Password</span></>}
              </button>
            </form>
          </>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Check size={28} style={{ color: '#4ade80' }} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Your password has been reset successfully.</p>
            <button onClick={() => router.push('/login')} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <span>Sign In</span><ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
