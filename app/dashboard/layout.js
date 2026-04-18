'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, User, Bell,
  LogOut, Shield, Settings, Menu, X, Camera, DollarSign,
  Landmark, ChevronRight, ShieldCheck, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ThemeToggle';
import ChatBot from '../../components/ChatBot';

const nav = [
  { href:'/dashboard',                icon:LayoutDashboard, label:'Overview'   },
  { href:'/dashboard/transfer',       icon:ArrowLeftRight,  label:'Transfers'  },
  { href:'/dashboard/payments',       icon:DollarSign,      label:'Pay & Send' },
  { href:'/dashboard/loans',          icon:Landmark,        label:'Loans'      },
  { href:'/dashboard/mobile-deposit', icon:Camera,          label:'Deposit'    },
  { href:'/dashboard/cards',          icon:CreditCard,      label:'Cards'      },
  { href:'/dashboard/statements',     icon:FileText,        label:'Statements' },
  { href:'/dashboard/security',       icon:ShieldCheck,     label:'Security'   },
  { href:'/dashboard/notifications',  icon:Bell,            label:'Alerts'     },
  { href:'/dashboard/profile',        icon:User,            label:'Profile'    },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    toast.success('Session ended');
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}>
          <Shield size={20} color="#000"/>
        </div>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{borderColor:'#FF6A00', borderTopColor:'transparent'}}/>
      </div>
    </div>
  );

  if (!user) return null;

  // Sidebar always stays dark — it's intentional (like image 4 reference)
  const Sidebar = () => (
    <div className="flex flex-col h-full"
      style={{background:'#181818', borderRight:'1px solid rgba(255,255,255,0.06)'}}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3"
        style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background:'#FF6A00'}}>
          <Shield size={16} color="#000" strokeWidth={2.5}/>
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-none" style={{color:'#FFFFFF'}}>NOVA TRUST</p>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.3)'}}>Private Banking</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold tracking-widest px-3 mb-3"
          style={{color:'rgba(255,255,255,0.2)'}}>MENU</p>
        {nav.map(({ href, icon:Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'text-orange-500'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              style={active ? {background:'rgba(255,106,0,0.15)', color:'#FF6A00'} : {}}>
              <Icon size={16}/>
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto" style={{color:'#FF6A00'}}/>}
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <>
            <div className="my-3 mx-3 h-px" style={{background:'rgba(255,255,255,0.07)'}}/>
            <Link href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
              style={{color:'rgba(255,106,0,0.6)'}}
              onClick={() => setOpen(false)}>
              <Settings size={16}/>
              <span>Admin Console</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3"
          style={{background:'rgba(255,255,255,0.04)'}}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{background:'rgba(255,106,0,0.15)', color:'#FF6A00', border:'1px solid rgba(255,106,0,0.25)'}}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{color:'rgba(255,255,255,0.9)'}}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs truncate" style={{color:'rgba(255,255,255,0.35)'}}>
              {user?.tier || 'STANDARD'}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.5)'}}/>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Theme</span>
          <ThemeToggle/>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-white/5"
          style={{color:'rgba(255,255,255,0.35)'}}>
          <LogOut size={14}/>Sign out
        </button>
      </div>
    </div>
  );

  return (
    /* Main wrapper uses CSS variable — adapts to theme */
    <div className="flex h-screen" style={{background:'var(--bg)'}}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <Sidebar/>
      </div>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
            onClick={() => setOpen(false)}/>
          <div className="relative w-64 z-50"><Sidebar/></div>
          <button onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-xl"
            style={{background:'rgba(255,255,255,0.1)', color:'white'}}>
            <X size={18}/>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar — theme-aware */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3"
          style={{background:'var(--card)', borderBottom:'1px solid var(--border)'}}>
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl"
            style={{color:'var(--t2)', background:'var(--s3)'}}>
            <Menu size={18}/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{background:'#FF6A00'}}>
              <Shield size={12} color="#000"/>
            </div>
            <span className="font-display font-bold text-sm" style={{color:'var(--t1)'}}>
              NOVA TRUST
            </span>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{background:'rgba(255,106,0,0.15)', color:'#FF6A00'}}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>

        {/* Page content — theme-aware background */}
        <main className="flex-1 overflow-y-auto" style={{background:'var(--bg)'}}>
          {children}
        </main>

        <ChatBot/>
      </div>
    </div>
  );
}
