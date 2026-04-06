'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  INFO:        { icon: Info,          color: '#818cf8' },
  SUCCESS:     { icon: CheckCircle,   color: '#4ade80' },
  WARNING:     { icon: AlertTriangle, color: '#fbbf24' },
  ERROR:       { icon: XCircle,       color: '#f87171' },
  TRANSACTION: { icon: ArrowLeftRight,color: '#FF6A00' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.data.notifications);
      setUnread(data.data.unreadCount);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(p => p.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(p => Math.max(0, p - 1));
    } catch {}
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'rgba(255,106,0,0.7)' }}>SYSTEM</p>
          <h1 className="font-display text-2xl font-bold text-white">Alerts & Notifications</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold">
            <CheckCheck size={14} />Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Bell size={28} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.INFO;
            const Icon = cfg.icon;
            return (
              <div key={n.id} onClick={() => !n.read && markOneRead(n.id)}
                className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition"
                style={{
                  background: n.read ? '#111111' : 'rgba(255,106,0,0.03)',
                  border: n.read ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,106,0,0.1)',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}12`, color: cfg.color }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: n.read ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)' }}>{n.title}</p>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#FF6A00' }} />}
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{n.message}</p>
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
