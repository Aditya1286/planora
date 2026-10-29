import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Shield, UserCheck, Mail, Lock, User, Briefcase, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(authModalMode === 'login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'attendee' | 'organizer'>('attendee');
  const [regOrg, setRegOrg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      organization: regOrg,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  const handleQuickFill = (role: 'admin' | 'organizer' | 'attendee') => {
    setIsLogin(true);
    setError(null);
    if (role === 'admin') {
      setLoginEmail('admin@planora.dev');
      setLoginPassword('Admin123!');
    } else if (role === 'organizer') {
      setLoginEmail('organizer@planora.dev');
      setLoginPassword('Organizer123!');
    } else {
      setLoginEmail('attendee@planora.dev');
      setLoginPassword('Attendee123!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-ivory rounded-3xl max-w-md w-full shadow-2xl border border-brand-beige overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-brand-ink-subtle hover:text-brand-ink hover:bg-brand-beige/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-brand-yellow font-display font-black text-lg">
              P
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-brand-ink">Planora</span>
          </div>
          <p className="text-sm text-brand-ink-muted">
            {isLogin
              ? 'Welcome back! Sign in to manage your tickets and events.'
              : 'Create your account to unlock curated gatherings and ticketing.'}
          </p>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-5 p-3 rounded-2xl bg-brand-beige/40 border border-brand-beige/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink-subtle mb-2">
              Instant Demo Access:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-brand-ink hover:bg-brand-blue hover:text-white transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <Shield className="w-3 h-3 text-brand-yellow" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('organizer')}
                className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-brand-ink hover:bg-brand-blue hover:text-white transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-brand-yellow" />
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('attendee')}
                className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white text-brand-ink hover:bg-brand-blue hover:text-white transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-brand-yellow" />
                Attendee
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-brand-beige/70 mt-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                isLogin
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-ink-muted hover:text-brand-ink'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                !isLogin
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-ink-muted hover:text-brand-ink'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-8 mb-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forms */}
        <div className="p-8 pt-2">
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-ink-muted mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. attendee@planora.dev"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-brand-blue-hover shadow-cobalt transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In to Planora'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-brand-ink-muted mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink-muted mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink-muted mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRegRole('attendee')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    regRole === 'attendee'
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue font-bold'
                      : 'border-brand-beige bg-white text-brand-ink-muted hover:border-brand-ink-subtle'
                  }`}
                >
                  I want to Attend
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('organizer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    regRole === 'organizer'
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue font-bold'
                      : 'border-brand-beige bg-white text-brand-ink-muted hover:border-brand-ink-subtle'
                  }`}
                >
                  I want to Organize
                </button>
              </div>

              {regRole === 'organizer' && (
                <div>
                  <label className="block text-xs font-semibold text-brand-ink-muted mb-1">Organization / Brand</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-brand-ink-subtle absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder="e.g. Apex Events Collective"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-beige bg-white text-brand-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-yellow text-brand-ink font-bold text-sm hover:bg-brand-yellow-hover shadow-sun transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Join Planora Community'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
