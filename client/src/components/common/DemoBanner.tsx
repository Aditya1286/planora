import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, UserCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, login } = useAuth();

  const handleQuickLogin = async (email: string, roleName: string) => {
    const password = roleName === 'Admin' ? 'Admin123!' : roleName === 'Organizer' ? 'Organizer123!' : 'Attendee123!';
    await login(email, password);
  };

  return (
    <div className="bg-brand-ink text-brand-ivory text-xs px-4 py-2 border-b border-brand-ink/20 shadow-sm flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-brand-yellow tracking-wide uppercase">Planora Live Environment</span>
        <span className="hidden sm:inline text-brand-ivory/70">• Real MongoDB Persistence • Demo Payments Active</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-brand-ivory/70 font-medium">Quick Demo Accounts:</span>
        <button
          onClick={() => handleQuickLogin('admin@planora.dev', 'Admin')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            user?.role === 'admin'
              ? 'bg-brand-blue text-white ring-1 ring-white/30'
              : 'bg-white/10 hover:bg-white/20 text-brand-ivory'
          }`}
          title="Login as Admin (Full Control)"
        >
          <Shield className="w-3 h-3 text-brand-yellow" />
          Admin
        </button>

        <button
          onClick={() => handleQuickLogin('organizer@planora.dev', 'Organizer')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            user?.role === 'organizer'
              ? 'bg-brand-blue text-white ring-1 ring-white/30'
              : 'bg-white/10 hover:bg-white/20 text-brand-ivory'
          }`}
          title="Login as Organizer (Event & Check-In Management)"
        >
          <Sparkles className="w-3 h-3 text-brand-yellow" />
          Organizer
        </button>

        <button
          onClick={() => handleQuickLogin('attendee@planora.dev', 'Attendee')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            user?.role === 'attendee'
              ? 'bg-brand-blue text-white ring-1 ring-white/30'
              : 'bg-white/10 hover:bg-white/20 text-brand-ivory'
          }`}
          title="Login as Attendee (Discovery & Bookings)"
        >
          <UserCheck className="w-3 h-3 text-brand-yellow" />
          Attendee
        </button>
      </div>
    </div>
  );
};
