export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

        <p className="text-gray-400 mb-4">
          Enter your email and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4"
        />

        <button className="w-full bg-orange-500 p-3 rounded font-semibold">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}