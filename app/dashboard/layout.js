'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, User,
  Bell, LogOut, Shield, Settings, Menu, X, ChevronRight, Camera
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/transfer', icon: ArrowLeftRight, label: 'Transfers' },
  { href: '/dashboard/mobile-deposit', icon: Camera, label: 'Mobile Deposit' },
  { href: '/dashboard/cards', icon: CreditCard, label: 'Cards' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1628' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#F0B429' }}>
            <Shield size={24} style={{ color: '#0A1628' }} />
          </div>
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F0B429', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full" style={{ background: '#0A1628' }}>
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0B429' }}>
            <Shield size={18} style={{ color: '#0A1628' }} />
          </div>
          <div>
            <p className="text-white font-bold font-display text-lg leading-none">Nova Trust</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Digital Bank</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'nav-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} />
              <span className="font-medium text-sm">{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#F0B429' }} />}
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <Link href="/admin" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-amber-400 hover:bg-amber-400/10">
            <Settings size={18} />
            <span className="font-medium text-sm">Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#F0B429', color: '#0A1628' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 shadow-2xl">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 z-50">
            <Sidebar mobile />
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-50 text-white p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0A1628' }}>
              <Shield size={14} style={{ color: '#F0B429' }} />
            </div>
            <span className="font-bold font-display" style={{ color: '#0A1628' }}>Nova Trust</span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: '#F0B429', color: '#0A1628' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
