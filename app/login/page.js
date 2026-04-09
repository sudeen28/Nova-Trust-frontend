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
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back');
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{background:'#0B0B0B'}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden" style={{background:'#0F0F0F', borderRight:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="absolute top-0 left-0 w-full h-full" style={{background:'radial-gradient(ellipse at 20% 60%, rgba(255,106,0,0.05) 0%, transparent 55%)', pointerEvents:'none'}} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={18} color="#000" strokeWidth={2.5}/></div>
          <span className="font-display font-bold text-white text-lg tracking-tight">NOVA TRUST</span>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest mb-4" style={{color:'#FF6A00'}}>PRIVATE BANKING PLATFORM</p>
          <h1 className="font-display text-5xl font-bold text-white leading-[1.1] mb-5">Financial<br/>excellence<br/><span style={{color:'#FF6A00'}}>redefined.</span></h1>
          <p className="text-sm leading-relaxed max-w-xs" style={{color:'rgba(255,255,255,0.35)'}}>An exclusive digital banking platform built for elite clients who demand the highest standard of service.</p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[{v:'$2.4B+',l:'Managed'},{v:'99.99%',l:'Uptime'},{v:'256-bit',l:'Encrypted'}].map(s=>(
            <div key={s.l} className="p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <p className="font-display font-bold text-white text-lg">{s.v}</p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.3)'}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={16} color="#000"/></div>
            <span className="font-display font-bold text-white">NOVA TRUST</span>
          </div>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{color:'#FF6A00'}}>SECURE ACCESS</p>
          <h2 className="font-display text-3xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-sm mb-8" style={{color:'rgba(255,255,255,0.35)'}}>Access your private portfolio</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest mb-2" style={{color:'rgba(255,255,255,0.35)'}}>EMAIL</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="inp px-4 py-3.5 rounded-xl text-sm" placeholder="you@example.com" required/>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest mb-2" style={{color:'rgba(255,255,255,0.35)'}}>PASSWORD</label>
              <div className="relative">
                <input type={show?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="inp px-4 py-3.5 rounded-xl text-sm pr-11" placeholder="••••••••" required/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'rgba(255,255,255,0.3)'}}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading?<div className="spinner"/>:<><span>Access Account</span><ArrowRight size={15}/></>}
            </button>
          </form>

<p className="text-center mt-4 text-sm text-gray-400">
  Forgot your password?{" "}
  <Link href="/forgot-password" className="text-orange-500 hover:underline">
    Reset it
  </Link>
</p>
{/* 
          <div className="mt-8 p-4 rounded-xl" style={{background:'rgba(255,106,0,0.05)',border:'1px solid rgba(255,106,0,0.1)'}}>
            <p className="text-xs font-semibold mb-2" style={{color:'rgba(255,106,0,0.6)'}}>DEMO ACCESS</p>
            <p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>Admin: <span className="font-mono" style={{color:'rgba(255,255,255,0.65)'}}>admin@novatrust.com</span></p>
            <p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>User: <span className="font-mono" style={{color:'rgba(255,255,255,0.65)'}}>james@demo.com</span></p>
            <p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>Pass: <span className="font-mono" style={{color:'rgba(255,255,255,0.65)'}}>Password123</span></p>
          </div> */}
          {/* <p className="text-center text-xs mt-5" style={{color:'rgba(255,255,255,0.25)'}}>
            New client? <Link href="/register" style={{color:'#FF6A00'}}>Open account</Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
