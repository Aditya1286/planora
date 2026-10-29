import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Building,
  Globe,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import api from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [organization, setOrganization] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setOrganization(user.organization || '');
      setWebsite(user.website || '');
      setCity(user.city || '');
      setPhone(user.phone || '');
      setTwitter(user.socialLinks?.twitter || '');
      setLinkedin(user.socialLinks?.linkedin || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.put('/auth/profile', {
        name,
        bio,
        organization,
        website,
        city,
        phone,
        socialLinks: { twitter, linkedin },
      });

      if (res.data.success) {
        updateUser(res.data.data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setPassError(null);
    setPassSuccess(false);

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPassSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPassSuccess(false), 3000);
      }
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Error updating password');
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-brand-beige pb-6">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-ink">
          Profile & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-brand-ink-muted mt-1">
          Manage your personal information, public organizer bio, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card 1 col */}
        <div className="p-6 rounded-3xl bg-white border border-brand-beige shadow-brand text-center space-y-4 h-max">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover mx-auto ring-4 ring-brand-blue/20"
          />
          <div>
            <h3 className="font-display font-bold text-lg text-brand-ink">{user.name}</h3>
            <p className="text-xs text-brand-ink-muted">{user.email}</p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>{user.role} Account</span>
            </span>
          </div>

          {user.bio && (
            <p className="text-xs text-brand-ink-muted leading-relaxed italic border-t border-brand-beige/60 pt-4">
              "{user.bio}"
            </p>
          )}
        </div>

        {/* Profile Edit Forms 2 cols */}
        <div className="md:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <form
            onSubmit={handleProfileSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-brand-beige shadow-brand space-y-6"
          >
            <h3 className="font-display font-bold text-xl text-brand-ink border-b border-brand-beige/60 pb-3">
              Personal & Professional Profile
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Vanguard Events"
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Bio / About You
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other attendees and organizers about your background and interests..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-cobalt flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-brand-beige shadow-brand space-y-6"
          >
            <h3 className="font-display font-bold text-xl text-brand-ink border-b border-brand-beige/60 pb-3">
              Change Password
            </h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-ink-muted uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-beige bg-brand-ivory text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPass}
                className="px-6 py-2.5 rounded-xl bg-brand-ink text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {savingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
