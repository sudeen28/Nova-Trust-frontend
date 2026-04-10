'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, CreditCard, User, Bell, LogOut, Shield, Settings, Menu, X, Camera, DollarSign, Landmark, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBot from '../../components/ChatBot';

const nav = [
  { href:'/dashboard',                  icon:LayoutDashboard, label:'Overview'      },
  { href:'/dashboard/transfer',         icon:ArrowLeftRight,  label:'Transfers'     },
  { href:'/dashboard/payments',         icon:DollarSign,      label:'Pay & Send'    },
  { href:'/dashboard/loans',            icon:Landmark,        label:'Loans'         },
  { href:'/dashboard/mobile-deposit',   icon:Camera,          label:'Deposit'       },
  { href:'/dashboard/cards',            icon:CreditCard,      label:'Cards'         },
  { href:'/dashboard/notifications',    icon:Bell,            label:'Alerts'        },
  { href:'/dashboard/profile',          icon:User,            label:'Profile'       },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const handleLogout = async () => {
    await logout(); toast.success('Session ended'); router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0B0B0B'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={20} color="#000"/></div>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'#FF6A00',borderTopColor:'transparent'}}/>
      </div>
    </div>
  );

  if (!user) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{background:'#0F0F0F',borderRight:'1px solid rgba(255,255,255,0.05)'}}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#FF6A00'}}><Shield size={16} color="#000" strokeWidth={2.5}/></div>
        <div><p className="font-display font-bold text-white text-sm leading-none">NOVA TRUST</p><p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>Private Banking</p></div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold tracking-widest px-3 mb-3" style={{color:'rgba(255,255,255,0.18)'}}>MENU</p>
        {nav.map(({ href, icon:Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={()=>setOpen(false)}
              className={`nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl ${active?'active':''}`}>
              <Icon size={16}/><span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight size={12} className="ml-auto" style={{color:'#FF6A00'}}/>}
            </Link>
          );
        })}
        {user?.role === 'ADMIN' && (
          <>
            <div className="divider my-3 mx-3"/>
            <Link href="/admin" className="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{color:'rgba(255,106,0,0.55)'}} onClick={()=>setOpen(false)}>
              <Settings size={16}/><span className="text-sm font-medium">Admin Console</span>
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{background:'rgba(255,255,255,0.03)'}}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00',border:'1px solid rgba(255,106,0,0.25)'}}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs truncate" style={{color:'rgba(255,255,255,0.25)'}}>{user?.tier || 'STANDARD'}</p>
          </div>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'#22c55e',boxShadow:'0 0 6px rgba(34,197,94,0.5)'}}/>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium mt-1">
          <LogOut size={14}/>Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen" style={{background:'#0B0B0B'}}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0"><Sidebar/></div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)'}} onClick={()=>setOpen(false)}/>
          <div className="relative w-56 z-50"><Sidebar/></div>
          <button onClick={()=>setOpen(false)} className="absolute top-4 right-4 z-50 p-2 rounded-xl" style={{background:'rgba(255,255,255,0.08)',color:'white'}}><X size={18}/></button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3" style={{background:'#0F0F0F',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <button onClick={()=>setOpen(true)} className="p-2 rounded-xl" style={{color:'rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.05)'}}><Menu size={18}/></button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:'#FF6A00'}}><Shield size={12} color="#000"/></div>
            <span className="font-display font-bold text-white text-sm">NOVA TRUST</span>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'rgba(255,106,0,0.15)',color:'#FF6A00'}}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <ChatBot/>
      </div>
    </div>
  );
}
