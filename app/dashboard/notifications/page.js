'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  SUCCESS: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ERROR: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  TRANSACTION: { icon: ArrowLeftRight, color: 'text-purple-500', bg: 'bg-purple-50' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: '#0A1628' }}>Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-100">
            <Bell size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold font-display text-lg mb-1" style={{ color: '#0A1628' }}>No notifications</h3>
          <p className="text-slate-400 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.INFO;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && markOneRead(notif.id)}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition cursor-pointer hover:shadow-sm ${
                  notif.read ? 'bg-white border-slate-100' : 'bg-blue-50/30 border-blue-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={18} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#0A1628' }} />
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
