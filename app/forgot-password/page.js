'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Shield, Mail, KeyRound, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const checks = [
    { label: '8+ characters', valid: newPassword.length >= 8 },
    { label: 'Uppercase', valid: /[A-Z]/.test(newPassword) },
    { label: 'Lowercase', valid: /[a-z]/.test(newPassword) },
    { label: 'Number', valid: /\d/.test(newPassword) },
  ];

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent! Check your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!checks.every(c => c.valid)) return toast.error('Password requirements not met');
    if (newPassword !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0B0B0B' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FF6A00' }}><Shield size={16} color="#000" /></div>
          <span className="font-display font-bold text-white">NOVA TRUST</span>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Check size={28} style={{ color: '#4ade80' }} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Redirecting you to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.15)' }}>
              <Mail size={22} style={{ color: '#FF6A00' }} />
            </div>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>PASSWORD RECOVERY</p>
            <h2 className="font-display text-3xl font-bold text-white mb-1">Forgot Password?</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Enter your email and we'll send you a reset code.</p>

            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="inp px-4 py-3.5 rounded-xl text-sm" placeholder="you@example.com" required autoFocus />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {loading ? <div className="spinner" /> : <><span>Send Reset Code</span><ArrowRight size={15} /></>}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.15)' }}>
              <KeyRound size={22} style={{ color: '#FF6A00' }} />
            </div>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: '#FF6A00' }}>RESET PASSWORD</p>
            <h2 className="font-display text-3xl font-bold text-white mb-1">New Password</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Enter the OTP sent to <span style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</span></p>

            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>OTP CODE</label>
                <input type="text" inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="inp px-4 py-4 rounded-xl text-2xl font-bold text-center tracking-widest font-mono"
                  placeholder="000000" required autoFocus />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>NEW PASSWORD</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="inp px-4 py-3.5 rounded-xl text-sm pr-11" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {checks.map(c => (
                      <div key={c.label} className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all" style={{ background: c.valid ? '#FF6A00' : 'rgba(255,255,255,0.08)' }}>
                          {c.valid && <Check size={8} color="#000" strokeWidth={3} />}
                        </div>
                        <span className="text-xs" style={{ color: c.valid ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>CONFIRM PASSWORD</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="inp px-4 py-3.5 rounded-xl text-sm" placeholder="••••••••" required />
                {confirm && newPassword !== confirm && (
                  <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading || !checks.every(c => c.valid) || newPassword !== confirm}
                className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                {loading ? <div className="spinner" /> : <><span>Reset Password</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <button onClick={() => { setStep(1); setOtp(''); }} className="mt-4 w-full text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              ← Try a different email
            </button>
          </>
        )}

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Remember your password? <Link href="/login" style={{ color: '#FF6A00' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
