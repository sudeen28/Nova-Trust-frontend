'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Shield, Smartphone, Monitor, Trash2, Plus, Eye, EyeOff, Lock, Unlock, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import { formatDistanceToNow, format } from 'date-fns';

const TABS = [
  { id: 'pin',     label: '🔐 Transaction PIN' },
  { id: 'devices', label: '📱 Trusted Devices' },
  { id: 'theme',   label: '🎨 Appearance' },
];

export default function SecurityPage() {
  const { theme } = useTheme();
  const [tab, setTab] = useState('pin');

  // PIN state
  const [hasPin, setHasPin] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: '', confirmPin: '', password: '' });
  const [removeForm, setRemoveForm] = useState({ password: '' });
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // Devices state
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  useEffect(() => {
    fetchPinStatus();
    fetchDevices();
    trustCurrentDevice();
  }, []);

  const fetchPinStatus = async () => {
    try {
      const { data } = await api.get('/security/pin/status');
      setHasPin(data.data.hasPin);
    } catch {}
  };

  const fetchDevices = async () => {
    try {
      const { data } = await api.get('/security/devices');
      setDevices(data.data);
    } catch {}
    finally { setDevicesLoading(false); }
  };

  // Automatically trust the current browser
  const trustCurrentDevice = async () => {
    try {
      const deviceId = getDeviceId();
      const deviceName = getBrowserName();
      const os = getOS();
      const browser = getBrowserName();
      await api.post('/security/devices', { deviceId, deviceName, browser, os });
    } catch {}
  };

  const getDeviceId = () => {
    let id = localStorage.getItem('nova-device-id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      localStorage.setItem('nova-device-id', id);
    }
    return id;
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Browser';
  };

  const getOS = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Unknown OS';
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinForm.pin !== pinForm.confirmPin) return toast.error('PINs do not match');
    if (!/^\d{4}$/.test(pinForm.pin)) return toast.error('PIN must be exactly 4 digits');
    setPinLoading(true);
    try {
      await api.post('/security/pin/set', { pin: pinForm.pin, password: pinForm.password });
      toast.success('Transaction PIN set successfully');
      setHasPin(true);
      setPinForm({ pin: '', confirmPin: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set PIN');
    } finally { setPinLoading(false); }
  };

  const handleRemovePin = async (e) => {
    e.preventDefault();
    setPinLoading(true);
    try {
      await api.delete('/security/pin', { data: { password: removeForm.password } });
      toast.success('Transaction PIN removed');
      setHasPin(false);
      setRemoveForm({ password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove PIN');
    } finally { setPinLoading(false); }
  };

  const removeDevice = async (id) => {
    try {
      await api.delete(`/security/devices/${id}`);
      toast.success('Device removed');
      fetchDevices();
    } catch { toast.error('Failed to remove device'); }
  };

  const removeAllDevices = async () => {
    if (!confirm('Remove all trusted devices? You may need to verify OTP on next login.')) return;
    try {
      await api.delete('/security/devices/all');
      toast.success('All devices removed');
      fetchDevices();
    } catch { toast.error('Failed'); }
  };

  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('nova-device-id') : null;

  const lc = "block text-xs font-semibold tracking-widest mb-1.5";
  const ls = { color: 'rgba(255,255,255,0.35)' };

  const PinDots = ({ value }) => (
    <div className="flex gap-3 justify-center my-4">
      {[0,1,2,3].map(i => (
        <div key={i} className="w-4 h-4 rounded-full transition-all"
          style={{ background: i < value.length ? '#FF6A00' : 'rgba(255,255,255,0.15)', transform: i < value.length ? 'scale(1.2)' : 'scale(1)' }}
        />
      ))}
    </div>
  );

  return (
    <div className="p-5 lg:p-7 anim-up">
      <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,106,0,0.7)' }}>SETTINGS</p>
      <h1 className="font-display text-2xl font-bold text-white mb-6 mt-0.5">Security & Preferences</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === id
              ? { background: 'rgba(255,106,0,0.15)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' }
              : { color: 'rgba(255,255,255,0.4)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TRANSACTION PIN ── */}
      {tab === 'pin' && (
        <div className="max-w-md space-y-5">
          {/* Status card */}
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: hasPin ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', color: hasPin ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
              {hasPin ? <Lock size={22} /> : <Unlock size={22} />}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{hasPin ? 'PIN is active' : 'No PIN set'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {hasPin
                  ? 'A 4-digit PIN is required before every transfer'
                  : 'Set a PIN to add an extra layer of security to transfers'}
              </p>
            </div>
            {hasPin && <div className="ml-auto"><span className="badge badge-green"><Check size={10}/> Active</span></div>}
          </div>

          {/* Set PIN form */}
          {!hasPin && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-1">Set Transaction PIN</h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                This PIN will be required every time you make a transfer.
              </p>
              <form onSubmit={handleSetPin} className="space-y-4">
                <div>
                  <label className={lc} style={ls}>4-DIGIT PIN</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={pinForm.pin}
                      onChange={e => setPinForm({ ...pinForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="inp px-4 py-3 rounded-xl text-2xl font-bold text-center tracking-[0.5em] font-mono w-full pr-11"
                      placeholder="••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PinDots value={pinForm.pin} />
                </div>
                <div>
                  <label className={lc} style={ls}>CONFIRM PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.confirmPin}
                    onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="inp px-4 py-3 rounded-xl text-2xl font-bold text-center tracking-[0.5em] font-mono w-full"
                    placeholder="••••"
                    required
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>ACCOUNT PASSWORD (to confirm)</label>
                  <input
                    type="password"
                    value={pinForm.password}
                    onChange={e => setPinForm({ ...pinForm, password: e.target.value })}
                    className="inp px-4 py-3 rounded-xl text-sm w-full"
                    placeholder="Your login password"
                    required
                  />
                </div>
                <button type="submit" disabled={pinLoading || pinForm.pin.length !== 4}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {pinLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Lock size={14} />Set PIN</>}
                </button>
              </form>
            </div>
          )}

          {/* Remove PIN form */}
          {hasPin && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white mb-1">Remove Transaction PIN</h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Enter your account password to remove the PIN.
              </p>
              <form onSubmit={handleRemovePin} className="space-y-4">
                <div>
                  <label className={lc} style={ls}>ACCOUNT PASSWORD</label>
                  <input
                    type="password"
                    value={removeForm.password}
                    onChange={e => setRemoveForm({ password: e.target.value })}
                    className="inp px-4 py-3 rounded-xl text-sm w-full"
                    placeholder="Your login password"
                    required
                  />
                </div>
                <button type="submit" disabled={pinLoading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {pinLoading ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <><Unlock size={14} />Remove PIN</>}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TRUSTED DEVICES ── */}
      {tab === 'devices' && (
        <div className="max-w-xl space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold text-white">Trusted Devices</h3>
              {devices.length > 1 && (
                <button onClick={removeAllDevices}
                  className="text-xs font-semibold transition"
                  style={{ color: '#f87171' }}>
                  Remove all
                </button>
              )}
            </div>
            <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Devices you've logged in from. Your current device is auto-trusted.
            </p>

            {devicesLoading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <Monitor size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No trusted devices</p>
              </div>
            ) : (
              <div className="space-y-2">
                {devices.map(device => {
                  const isCurrent = device.deviceId === currentDeviceId;
                  return (
                    <div key={device.id} className="flex items-center gap-4 p-4 rounded-xl transition"
                      style={{ background: isCurrent ? 'rgba(255,106,0,0.06)' : 'rgba(255,255,255,0.03)', border: isCurrent ? '1px solid rgba(255,106,0,0.15)' : '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isCurrent ? 'rgba(255,106,0,0.12)' : 'rgba(255,255,255,0.05)', color: isCurrent ? '#FF6A00' : 'rgba(255,255,255,0.4)' }}>
                        {device.os === 'Android' || device.os === 'iOS' ? <Smartphone size={16} /> : <Monitor size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{device.deviceName}</p>
                          {isCurrent && <span className="badge badge-orange flex-shrink-0">Current</span>}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {device.browser} · {device.os} · Last used {formatDistanceToNow(new Date(device.lastUsed), { addSuffix: true })}
                        </p>
                      </div>
                      {!isCurrent && (
                        <button onClick={() => removeDevice(device.id)}
                          className="p-2 rounded-lg flex-shrink-0 transition"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
                          title="Remove device">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
            🔒 Trusted devices are automatically registered when you log in. Remove any device you don't recognise.
          </div>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'theme' && (
        <div className="max-w-md space-y-4">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-white mb-1">Appearance</h3>
            <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Choose how Nova Trust looks for you.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'dark',  label: 'Dark Mode',  emoji: '🌙', desc: 'Easy on the eyes' },
                { value: 'light', label: 'Light Mode',  emoji: '☀️', desc: 'Clean and bright' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => {
                    document.documentElement.setAttribute('data-theme', opt.value);
                    localStorage.setItem('nova-theme', opt.value);
                  }}
                  className="p-5 rounded-2xl text-left transition"
                  style={{
                    background: theme === opt.value ? 'rgba(255,106,0,0.12)' : 'rgba(255,255,255,0.03)',
                    border: theme === opt.value ? '1px solid rgba(255,106,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                  <p className="text-2xl mb-3">{opt.emoji}</p>
                  <p className="font-semibold text-white text-sm">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</p>
                  {theme === opt.value && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#FF6A00' }}>
                      <Check size={12} />Active
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-sm">Quick Toggle</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Also available in the sidebar</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
