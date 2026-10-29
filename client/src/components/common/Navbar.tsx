import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { NotificationItem } from '../../types';
import {
  Search,
  Bell,
  Heart,
  PlusCircle,
  LayoutDashboard,
  Ticket,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/my');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-ivory/90 backdrop-blur-md border-b border-brand-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-brand-yellow font-display font-extrabold text-xl shadow-cobalt group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-tight text-brand-ink">
              Planora<span className="text-brand-yellow">.</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-brand-blue -mt-1">
              Events Redefined
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conferences, festivals, summits, cities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-beige bg-white/80 text-brand-ink text-sm placeholder:text-brand-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
          <Search className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
        </form>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            to="/events"
            className="text-sm font-semibold text-brand-ink hover:text-brand-blue transition-colors"
          >
            Explore Events
          </Link>
          {user?.role === 'organizer' && (
            <Link
              to="/organizer/dashboard"
              className="text-sm font-semibold text-brand-ink hover:text-brand-blue flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-blue" />
              Organizer Portal
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-semibold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Platform
            </Link>
          )}
        </nav>

        {/* Action Controls & User Area */}
        <div className="flex items-center gap-3">
          {/* Create Event CTA for Organizer or Guest */}
          <Link
            to={user?.role === 'organizer' || user?.role === 'admin' ? '/events/create' : '/events'}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-yellow text-brand-ink font-bold text-sm hover:bg-brand-yellow-hover shadow-sun transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>

          {/* User Logged in Actions */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* My Tickets */}
              <Link
                to="/my-tickets"
                className="p-2.5 rounded-2xl border border-brand-beige text-brand-ink hover:bg-brand-beige/50 transition-colors relative"
                title="My Booked Tickets"
              >
                <Ticket className="w-5 h-5 text-brand-blue" />
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-2xl border border-brand-beige text-brand-ink hover:bg-brand-beige/50 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-brand-ivory border border-brand-beige shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-brand-beige flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-ink">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-blue hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-brand-beige/60">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-brand-ink-subtle">
                          No notifications at the moment.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-4 transition-colors ${
                              n.read ? 'bg-transparent' : 'bg-brand-blue/5'
                            } hover:bg-brand-beige/30`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="font-semibold text-xs text-brand-ink">{n.title}</h5>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-1"></span>}
                            </div>
                            <p className="text-xs text-brand-ink-muted leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-brand-ink-subtle mt-1.5 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-2xl border border-brand-beige bg-white/70 hover:bg-white transition-colors"
                >
                  <span className="text-xs font-bold text-brand-ink hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-blue/20"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-brand-ivory border border-brand-beige shadow-2xl p-2 z-50">
                    <div className="p-3 border-b border-brand-beige mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-brand-ink">{user.name}</span>
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-blue text-white">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-brand-ink-muted truncate">{user.email}</p>
                    </div>

                    <div className="space-y-0.5">
                      {user.role === 'organizer' && (
                        <Link
                          to="/organizer/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-ink hover:bg-brand-blue hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-yellow" />
                          Organizer Dashboard
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-ink hover:bg-brand-blue hover:text-white transition-colors"
                        >
                          <Shield className="w-4 h-4 text-brand-yellow" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/my-tickets"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-ink hover:bg-brand-beige transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-brand-blue" />
                        My Tickets & Passes
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-ink hover:bg-brand-beige transition-colors"
                      >
                        <User className="w-4 h-4 text-brand-blue" />
                        Profile & Settings
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-2xl border border-brand-beige text-brand-ink"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-beige bg-brand-ivory px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-beige bg-white text-sm"
            />
            <Search className="w-4 h-4 text-brand-ink-subtle absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink hover:bg-brand-beige"
            >
              Explore Events
            </Link>
            {user?.role === 'organizer' && (
              <Link
                to="/organizer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink hover:bg-brand-beige"
              >
                Organizer Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-blue hover:bg-brand-beige"
              >
                Admin Platform
              </Link>
            )}
            {user && (
              <Link
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink hover:bg-brand-beige"
              >
                My Tickets
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
