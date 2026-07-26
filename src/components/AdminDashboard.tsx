import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Key, Lock, LogOut, Check, X, Trash2, Edit2, Plus, ArrowLeft, Save, 
  Eye, EyeOff, Sparkles, Upload, RefreshCw, BarChart2, ShieldCheck, Mail, 
  Calendar, UtensilsCrossed, Settings, FileText, Activity
} from 'lucide-react';
import { AppData, MenuItem, ClubEvent, Reservation, Testimonial, WebsiteSettings, ContactMessage, ActivityLog } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshAllData: () => void;
}

type TabType = 'overview' | 'reservations' | 'menu' | 'events' | 'testimonials' | 'inbox' | 'settings' | 'logs';

export default function AdminDashboard({ onClose, onRefreshAllData }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [adminData, setAdminData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [editingMenuItem, setEditingMenuItem] = useState<Partial<MenuItem> | null>(null);
  const [editingEventItem, setEditingEventItem] = useState<Partial<ClubEvent> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchAdminData();
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
        setSettingsForm(data.settings);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        fetchAdminData();
        onRefreshAllData();
      } else {
        setLoginError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setLoginError("Connection to auth server failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setAdminData(null);
      onRefreshAllData();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, filename: file.name })
        });
        const data = await res.json();
        if (data.success && data.url) {
          callback(data.url);
          triggerActionSuccess("Image uploaded successfully.");
        } else {
          alert("Image upload failed.");
        }
      } catch (err) {
        alert("Image upload failed on server.");
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerActionSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        triggerActionSuccess("Website configurations saved successfully.");
        fetchAdminData();
        onRefreshAllData();
      } else {
        setActionError(data.error || "Failed to save settings.");
      }
    } catch (err) {
      setActionError("Server sync failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMenuItem)
      });
      const data = await res.json();
      if (res.ok) {
        triggerActionSuccess(editingMenuItem.id ? "Menu item updated." : "New menu item created.");
        setEditingMenuItem(null);
        fetchAdminData();
        onRefreshAllData();
      } else {
        setActionError(data.error || "Failed to save menu item.");
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerActionSuccess("Menu item deleted.");
        fetchAdminData();
        onRefreshAllData();
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEventItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventItem) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEventItem)
      });
      const data = await res.json();
      if (res.ok) {
        triggerActionSuccess(editingEventItem.id ? "Event listing updated." : "New event listing created.");
        setEditingEventItem(null);
        fetchAdminData();
        onRefreshAllData();
      } else {
        setActionError(data.error || "Failed to save event.");
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEventItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerActionSuccess("Event deleted.");
        fetchAdminData();
        onRefreshAllData();
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: 'approved' | 'declined') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerActionSuccess(`Reservation status marked as ${status}.`);
        fetchAdminData();
        onRefreshAllData();
      }
    } catch (err) {
      alert("Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to remove this reservation record?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerActionSuccess("Reservation record deleted.");
        fetchAdminData();
        onRefreshAllData();
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTestimonial)
      });
      if (res.ok) {
        triggerActionSuccess(editingTestimonial.id ? "Testimonial updated." : "New testimonial created.");
        setEditingTestimonial(null);
        fetchAdminData();
        onRefreshAllData();
      } else {
        setActionError("Failed to save testimonial.");
      }
    } catch (err) {
      setActionError("Server error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Delete testimonial?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerActionSuccess("Testimonial deleted.");
        fetchAdminData();
        onRefreshAllData();
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, { method: 'POST' });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerActionSuccess("Message deleted.");
        fetchAdminData();
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0F] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#070709] flex items-center justify-center p-6 z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.05),transparent_60%)] pointer-events-none" />
        
        <div className="w-full max-w-md bg-zinc-900/60 border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(236,72,153,0.25)]">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-sans font-black tracking-widest text-lg text-white pt-2">ELYSIUM PORTAL</h2>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Administrative Control Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Admin ID</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Secret Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
              />
            </div>

            {loginError && (
              <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-sans text-xs">
                {loginError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl font-mono text-[9px] tracking-widest uppercase font-extrabold cursor-pointer bg-zinc-955 border border-white/5 hover:bg-zinc-900 text-zinc-400 flex-1 text-center"
              >
                Back to Site
              </button>
              
              <button
                type="submit"
                disabled={loginLoading}
                className="px-5 py-3 rounded-xl font-mono text-[9px] tracking-widest uppercase font-extrabold cursor-pointer bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] flex-1 flex items-center justify-center gap-1.5"
              >
                {loginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Enter Suite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const reservations = adminData?.reservations || [];
  const menu = adminData?.menu || [];
  const events = adminData?.events || [];
  const testimonials = adminData?.testimonials || [];
  const messages = adminData?.messages || [];
  const logs = adminData?.logs || [];
  const settings = adminData?.settings;

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const approvedReservations = reservations.filter(r => r.status === 'approved');
  const unreadMessages = messages.filter(m => !m.read);

  return (
    <div className="fixed inset-0 bg-[#070709] text-zinc-300 font-sans z-50 flex flex-col overflow-hidden">
      <header className="h-16 border-b border-white/5 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black tracking-widest text-xs text-white leading-none">
              ELYSIUM SMART DASHBOARD
            </span>
            <span className="font-mono text-[7px] text-zinc-500 tracking-widest uppercase font-bold mt-0.5">
              lounge, club & kitchen engine v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {actionSuccess && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg"
              >
                {actionSuccess}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={checkAuthStatus}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/5 bg-zinc-900 text-zinc-300 font-mono text-[9px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit Portal
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-white/5 bg-zinc-950/40 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1">
            <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-black px-3 block mb-3">
              Management Portal
            </span>

            {[
              { id: 'overview', label: 'Suite Overview', icon: BarChart2 },
              { id: 'reservations', label: 'Reservations', icon: Calendar, badge: pendingReservations.length },
              { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
              { id: 'events', label: 'Event Gigs', icon: Sparkles },
              { id: 'testimonials', label: 'Guest Reviews', icon: FileText },
              { id: 'inbox', label: 'Inbox Messages', icon: Mail, badge: unreadMessages.length },
              { id: 'settings', label: 'Club Settings', icon: Settings },
              { id: 'logs', label: 'Audit Logs', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setEditingMenuItem(null);
                    setEditingEventItem(null);
                    setEditingTestimonial(null);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white text-pink-600' : 'bg-pink-600 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-2">
            <span className="font-mono text-[7px] uppercase tracking-widest text-zinc-500 block font-bold">Analytics Engine</span>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">Total Visits</span>
              <span className="font-mono font-bold text-white">{settings?.analytics?.totalVisits || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">Reservations</span>
              <span className="font-mono font-bold text-white">{settings?.analytics?.reservationsCount || 0}</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#070709]">
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black tracking-wider text-xl text-white">SUITE OVERVIEW</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2 shadow-xl">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Live Visitors</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-3xl font-black text-white">{settings?.analytics?.totalVisits || 0}</span>
                    <span className="font-mono text-[9px] text-emerald-400 font-bold">Clicks</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2 shadow-xl">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Pending bookings</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-3xl font-black text-white">{pendingReservations.length}</span>
                    <span className="font-mono text-[9px] text-pink-400 font-bold">Needs Review</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2 shadow-xl">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Confirmed bookings</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-3xl font-black text-white">{approvedReservations.length}</span>
                    <span className="font-mono text-[9px] text-emerald-400 font-bold">Approved</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2 shadow-xl">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Unread Inbox</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-3xl font-black text-white">{unreadMessages.length}</span>
                    <span className="font-mono text-[9px] text-zinc-400 font-bold">Messages</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-black block">
                  Capacity Monitor & Booking Distribution
                </span>
                <div className="flex flex-col space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>Dining Room Reservations</span>
                      <span className="font-mono font-bold text-white">
                        {reservations.filter(r => r.type === 'restaurant').length} requests
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-1000" 
                        style={{ 
                          width: `${reservations.length > 0 
                            ? (reservations.filter(r => r.type === 'restaurant').length / reservations.length) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>VIP Lounge Booths</span>
                      <span className="font-mono font-bold text-white">
                        {reservations.filter(r => r.type === 'vip').length} requests
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 transition-all duration-1000" 
                        style={{ 
                          width: `${reservations.length > 0 
                            ? (reservations.filter(r => r.type === 'vip').length / reservations.length) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-black">
                    Recent Security Audit check
                  </span>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="font-mono text-[9px] text-pink-500 hover:text-white uppercase tracking-wider font-extrabold"
                  >
                    View All Logs
                  </button>
                </div>
                <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto pr-1">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white">{log.action}</span>
                        <p className="text-zinc-500 text-[10px]">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[9px] text-zinc-500 block">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-mono text-[8px] uppercase font-bold ${
                          log.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                        }`}>{log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <h2 className="font-sans font-black tracking-wider text-xl text-white">RESERVATIONS WORKSPACE</h2>
              <div className="space-y-4">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-zinc-900/40 border p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all ${
                      r.status === 'approved' ? 'border-emerald-500/20' : r.status === 'declined' ? 'border-red-500/20' : 'border-amber-500/20'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-bold text-white text-base">{r.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg border font-mono text-[8px] uppercase tracking-wider font-black ${
                          r.type === 'vip' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {r.type === 'vip' ? 'VIP Lounge' : 'Dining Room'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[8px] uppercase font-bold ${
                          r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : r.status === 'declined' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400 pt-1">
                        <div>
                          <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">Timing</span>
                          <span className="font-mono text-white mt-0.5 block">{r.date} @ {r.time}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">Guests & Section</span>
                          <span className="mt-0.5 block text-white font-mono">{r.guests} guests ({r.section})</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">Phone</span>
                          <span className="mt-0.5 block text-white font-mono">{r.phone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">Email</span>
                          <span className="mt-0.5 block text-white font-mono">{r.email}</span>
                        </div>
                      </div>

                      {r.specialRequests && (
                        <div className="mt-2 text-xs bg-black/30 border border-white/5 p-3 rounded-xl">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">Requests Note</span>
                          <p className="font-light text-zinc-400 mt-1 italic">"{r.specialRequests}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(r.id, 'approved')}
                          className="p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/25 text-emerald-400 transition-colors cursor-pointer"
                          title="Approve booking"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      
                      {r.status !== 'declined' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(r.id, 'declined')}
                          className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                          title="Decline booking"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReservation(r.id)}
                        className="p-2.5 rounded-xl border border-white/5 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {reservations.length === 0 && (
                  <div className="text-center py-12 bg-zinc-900/10 border border-white/5 rounded-3xl">
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">No reservations registered.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans font-black tracking-wider text-xl text-white">MENU INVENTORY</h2>
                <button
                  onClick={() => setEditingMenuItem({ title: '', description: '', price: 15, category: 'food', tags: [], isSpecial: false, image: '' })}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Dish/Drink
                </button>
              </div>

              <AnimatePresence>
                {editingMenuItem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl shadow-2xl relative"
                  >
                    <button
                      onClick={() => setEditingMenuItem(null)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <form onSubmit={handleSaveMenuItem} className="space-y-5">
                      <h3 className="font-sans font-bold text-white text-sm">
                        {editingMenuItem.id ? 'Edit Menu Item' : 'New Menu Item'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Item Title</label>
                          <input
                            type="text"
                            required
                            value={editingMenuItem.title || ''}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, title: e.target.value })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/10"
                            placeholder="e.g. Caviar Platter"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Category</label>
                          <select
                            value={editingMenuItem.category || 'food'}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, category: e.target.value as any })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="food">Signature Bites (Food)</option>
                            <option value="drink">Mixology & Drinks (Drink)</option>
                            <option value="dessert">Sweet Finales (Dessert)</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Price ($)</label>
                          <input
                            type="number"
                            required
                            value={editingMenuItem.price || 0}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: parseFloat(e.target.value) })}
                            className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="Price"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Description</label>
                        <input
                          type="text"
                          required
                          value={editingMenuItem.description || ''}
                          onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                          className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          placeholder="Describe ingredients..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Tags (Comma Separated)</label>
                          <input
                            type="text"
                            value={editingMenuItem.tags?.join(', ') || ''}
                            onChange={(e) => setEditingMenuItem({ 
                              ...editingMenuItem, 
                              tags: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0) 
                            })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="Chef's Choice, Spicy, Organic"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Item Image</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editingMenuItem.image || ''}
                              onChange={(e) => setEditingMenuItem({ ...editingMenuItem, image: e.target.value })}
                              placeholder="Image URL or upload"
                              className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none flex-1"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, (url) => setEditingMenuItem({ ...editingMenuItem, image: url }))}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <button
                                type="button"
                                className="px-4 py-3 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer text-zinc-400"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Upload
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isSpecial"
                          checked={editingMenuItem.isSpecial || false}
                          onChange={(e) => setEditingMenuItem({ ...editingMenuItem, isSpecial: e.target.checked })}
                          className="rounded border-zinc-800 bg-zinc-950 text-pink-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="isSpecial" className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 cursor-pointer">
                          Highlight as Chef's Special
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingMenuItem(null)}
                          className="px-5 py-3 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 text-xs flex-1 cursor-pointer hover:bg-zinc-900"
                        >
                          Cancel
                        </button>
                        
                        <button
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex-1 cursor-pointer flex justify-center"
                        >
                          Save Item
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menu.map((item) => (
                  <div key={item.id} className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80"}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-white text-xs leading-none">{item.title}</span>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">({item.category})</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 leading-normal font-light">{item.description}</p>
                        <span className="font-mono text-[10px] text-pink-400 block">${item.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingMenuItem(item)}
                        className="p-2 rounded-lg bg-zinc-955/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 rounded-lg bg-zinc-955/60 hover:bg-red-500/25 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans font-black tracking-wider text-xl text-white">EVENT TIMELINES</h2>
                <button
                  onClick={() => setEditingEventItem({ title: '', description: '', date: '', time: '22:00 - late', price: 20, djLineup: [], category: 'club', image: '' })}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event Listing
                </button>
              </div>

              <AnimatePresence>
                {editingEventItem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl shadow-2xl relative"
                  >
                    <button
                      onClick={() => setEditingEventItem(null)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <form onSubmit={handleSaveEventItem} className="space-y-5">
                      <h3 className="font-sans font-bold text-white text-sm">
                        {editingEventItem.id ? 'Edit Event Listing' : 'New Event Listing'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Event Title</label>
                          <input
                            type="text"
                            required
                            value={editingEventItem.title || ''}
                            onChange={(e) => setEditingEventItem({ ...editingEventItem, title: e.target.value })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="e.g. DJ Resident Night"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Category Mode</label>
                          <select
                            value={editingEventItem.category || 'club'}
                            onChange={(e) => setEditingEventItem({ ...editingEventItem, category: e.target.value as any })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="club">Club Mode (Beats)</option>
                            <option value="restaurant">Restaurant Mode (Bites)</option>
                            <option value="special">Global Special (Both)</option>
                          </select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Entry Ticket ($)</label>
                          <input
                            type="number"
                            required
                            value={editingEventItem.price || 0}
                            onChange={(e) => setEditingEventItem({ ...editingEventItem, price: parseFloat(e.target.value) })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Date</label>
                          <input
                            type="date"
                            required
                            value={editingEventItem.date || ''}
                            onChange={(e) => setEditingEventItem({ ...editingEventItem, date: e.target.value })}
                            className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Operating Hours</label>
                          <input
                            type="text"
                            required
                            value={editingEventItem.time || ''}
                            onChange={(e) => setEditingEventItem({ ...editingEventItem, time: e.target.value })}
                            className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="e.g. 22:00 PM - 04:00 AM"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Description</label>
                        <textarea
                          required
                          value={editingEventItem.description || ''}
                          onChange={(e) => setEditingEventItem({ ...editingEventItem, description: e.target.value })}
                          className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Lineup (Comma Separated)</label>
                          <input
                            type="text"
                            value={editingEventItem.djLineup?.join(', ') || ''}
                            onChange={(e) => setEditingEventItem({ 
                              ...editingEventItem, 
                              djLineup: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0) 
                            })}
                            className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="DJ Resident, Guest Saxophonist"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Flyer Image</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editingEventItem.image || ''}
                              onChange={(e) => setEditingEventItem({ ...editingEventItem, image: e.target.value })}
                              placeholder="Image URL or upload"
                              className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none flex-1"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, (url) => setEditingEventItem({ ...editingEventItem, image: url }))}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <button
                                type="button"
                                className="px-4 py-3 bg-zinc-955 hover:bg-zinc-900 border border-white/5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer text-zinc-400"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Upload
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingEventItem(null)}
                          className="px-5 py-3 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 text-xs flex-1 cursor-pointer hover:bg-zinc-900"
                        >
                          Cancel
                        </button>
                        
                        <button
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex-1 cursor-pointer flex justify-center"
                        >
                          Save Event
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {events.map((e) => (
                  <div key={e.id} className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      <img
                        src={e.image || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80"}
                        alt={e.title}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans font-bold text-white text-xs leading-none">{e.title}</span>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">({e.category})</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">{e.date} @ {e.time}</p>
                        <span className="text-[10px] text-pink-400 block">${e.price} Entry</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingEventItem(e)}
                        className="p-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEventItem(e.id)}
                        className="p-2 rounded-lg bg-zinc-950/60 hover:bg-red-500/25 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-sans font-black tracking-wider text-xl text-white">TESTIMONIALS LOG</h2>
                <button
                  onClick={() => setEditingTestimonial({ name: '', role: '', avatar: '', quote: '' })}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Review
                </button>
              </div>

              <AnimatePresence>
                {editingTestimonial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl shadow-2xl relative"
                  >
                    <button
                      onClick={() => setEditingTestimonial(null)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <form onSubmit={handleSaveTestimonial} className="space-y-5">
                      <h3 className="font-sans font-bold text-white text-xs">
                        {editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Guest Name</label>
                          <input
                            type="text"
                            required
                            value={editingTestimonial.name || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Guest Title/Role</label>
                          <input
                            type="text"
                            required
                            value={editingTestimonial.role || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                            placeholder="e.g. VIP Member"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Avatar Image</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={editingTestimonial.avatar || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })}
                            placeholder="Image URL or upload"
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, (url) => setEditingTestimonial({ ...editingTestimonial, avatar: url }))}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <button
                              type="button"
                              className="px-4 py-3 bg-zinc-955 hover:bg-zinc-900 border border-white/5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer text-zinc-400"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Upload
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Quote Review</label>
                        <textarea
                          required
                          value={editingTestimonial.quote || ''}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                          className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial(null)}
                          className="px-5 py-3 rounded-xl bg-zinc-955 border border-white/5 text-zinc-400 text-xs flex-1 cursor-pointer hover:bg-zinc-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[9px] tracking-widest uppercase font-extrabold flex-1 cursor-pointer flex justify-center"
                        >
                          Save Review
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-sans font-bold text-white text-xs block">{t.name}</span>
                        <span className="font-mono text-[8px] text-zinc-500 uppercase font-black">{t.role}</span>
                        <p className="text-[10px] text-zinc-400 italic line-clamp-1 mt-1 font-light">"{t.quote}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingTestimonial(t)} className="p-2 rounded-lg bg-zinc-955/60 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 rounded-lg bg-zinc-955/60 hover:bg-red-500/25 text-zinc-400 hover:text-red-400 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <h2 className="font-sans font-black tracking-wider text-xl text-white">CUSTOMER MESSAGES</h2>
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-zinc-900/40 border p-6 rounded-3xl shadow-xl flex flex-col justify-between gap-4 relative transition-all ${
                      m.read ? 'border-white/5' : 'border-pink-500/20'
                    }`}
                  >
                    {!m.read && (
                      <span className="absolute top-4 right-4 text-[7px] font-mono uppercase bg-pink-500 text-white px-1.5 py-0.5 rounded-md font-bold">
                        Unread
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-sans font-bold text-white text-sm">{m.name}</span>
                        <span className="font-mono text-[9px] text-zinc-400">({m.email})</span>
                        <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                          {new Date(m.createdAt).toLocaleDateString()} @ {new Date(m.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] uppercase text-zinc-500 tracking-wider font-bold">Subject</span>
                        <h4 className="font-sans font-bold text-xs text-white">{m.subject}</h4>
                      </div>

                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl text-xs text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 self-end">
                      {!m.read && (
                        <button
                          onClick={() => handleMarkMessageRead(m.id)}
                          className="px-4 py-1.5 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400 font-mono text-[8px] tracking-wider uppercase font-bold cursor-pointer hover:bg-pink-600 hover:text-white transition-all"
                        >
                          Mark Read
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="p-2 rounded-lg bg-zinc-955/60 hover:bg-red-500/25 text-zinc-500 hover:text-red-400 cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="text-center py-12 bg-zinc-900/10 border border-white/5 rounded-3xl">
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Inbox is empty.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && settingsForm && (
            <div className="space-y-6">
              <h2 className="font-sans font-black tracking-wider text-xl text-white">CLUB CONFIGURATIONS</h2>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-white">Branding & Titles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Establishment Name</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.clubName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, clubName: e.target.value })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Tagline</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Restaurant Narrative (Bites Mode)</label>
                    <textarea
                      required
                      value={settingsForm.restaurantAbout}
                      onChange={(e) => setSettingsForm({ ...settingsForm, restaurantAbout: e.target.value })}
                      className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Club Narrative (Beats Mode)</label>
                    <textarea
                      required
                      value={settingsForm.clubAbout}
                      onChange={(e) => setSettingsForm({ ...settingsForm, clubAbout: e.target.value })}
                      className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-white">Coordinates & Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Hotline Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Email Inbox</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Operating Timing (Restaurant)</label>
                      <input
                        type="text"
                        value={settingsForm.hours.restaurant}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          hours: { ...settingsForm.hours, restaurant: e.target.value } 
                        })}
                        className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Address location</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Operating Timing (Club)</label>
                      <input
                        type="text"
                        value={settingsForm.hours.club}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          hours: { ...settingsForm.hours, club: e.target.value } 
                        })}
                        className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={settingsForm.googleMapUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleMapUrl: e.target.value })}
                      className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-white">Audio Radio & Synths</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Ambient Audio URL (MP3)</label>
                      <input
                        type="text"
                        value={settingsForm.worldSettings.ambientAudioUrl}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          worldSettings: { ...settingsForm.worldSettings, ambientAudioUrl: e.target.value } 
                        })}
                        className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Default Radio Volume (0.0 - 1.0)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={settingsForm.worldSettings.soundVolume}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          worldSettings: { ...settingsForm.worldSettings, soundVolume: parseFloat(e.target.value) } 
                        })}
                        className="bg-zinc-955 border border-white/5 rounded-xl px-4 py-3 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {actionError && (
                  <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-sans text-xs">
                    {actionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs tracking-widest uppercase font-extrabold rounded-xl transition-all shadow-lg cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save website configurations
                </button>
              </form>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h2 className="font-sans font-black tracking-wider text-xl text-white">SECURITY AUDIT CHECK</h2>
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-sm">{log.action}</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[8px] uppercase font-bold ${
                            log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : log.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'
                          }`}>{log.status}</span>
                        </div>
                        <p className="text-zinc-400 text-xs font-light">{log.details}</p>
                      </div>

                      <div className="text-left sm:text-right text-[10px] text-zinc-500 font-mono shrink-0">
                        <span className="block">Timestamp: {new Date(log.timestamp).toLocaleString()}</span>
                        <span className="block mt-0.5">IP Origin: {log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
