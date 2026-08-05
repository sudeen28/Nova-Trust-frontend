import { useState } from 'react';

const API_BASE = 'https://nova-trust-api.onrender.com/api/auth';

export default function ForgotPassword() {
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError('');

    if (!email) {
      setError('Enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired code.');
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        {step === 'request' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Reset password</h1>
            <p className="text-gray-400 mb-4">
              Enter your email and we'll send you a reset code.
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-orange-500 p-3 rounded font-semibold disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send reset code'}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Enter code</h1>
            <p className="text-gray-400 mb-4">
              We sent a 6-digit code to {email}
            </p>

            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4 tracking-widest"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-orange-500 p-3 rounded font-semibold disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Reset password'}
            </button>

            <button
              onClick={() => setStep('request')}
              className="w-full mt-3 text-gray-400 text-sm"
            >
              Didn't get a code? Try again
            </button>
          </>
        )}

        {step === 'done' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Password updated</h1>
            <p className="text-gray-400 mb-6">
              You can now sign in with your new password.
            </p>
            <a
              href="/login"
              className="block w-full bg-orange-500 p-3 rounded font-semibold text-center"
            >
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}