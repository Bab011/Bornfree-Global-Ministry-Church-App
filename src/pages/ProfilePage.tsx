import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { ROLE_LABELS } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { AuthModal } from '@/src/components/AuthModal';

export const ProfilePage: React.FC = () => {
  const { user, profile, role, isSignedIn, isAnyStaff, signOut, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [city, setCity] = useState(profile?.city || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setCountry(profile.country || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  if (!isSignedIn) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden text-center">
        <div className="bg-[#26364A] p-6 text-white space-y-2">
          <div className="w-14 h-14 rounded-xl bg-[#1D2939] flex items-center justify-center mx-auto">
            <UserCircle2 className="w-8 h-8 text-[#B99A55]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Member Profile</h1>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-sm text-[#68717D] leading-relaxed">
            Sign in to track your prayer requests, save notification preferences, and manage your personal details.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-6 py-2.5 text-sm font-semibold text-[#1D2939] transition-colors min-h-[44px]"
          >
            Sign In / Create Account
          </button>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ displayName, phone, country, city });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="bg-[#26364A] text-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B99A55]">
              {ROLE_LABELS[role]}
            </p>
            <h1 className="text-2xl font-bold text-white mt-0.5">
              {profile?.displayName || user?.displayName || 'Member'}
            </h1>
            <p className="text-xs text-[#E5E7EB]/80 mt-1">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAnyStaff && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-4 py-2 text-xs font-semibold text-[#1D2939] transition-colors min-h-[40px]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D2939] border border-white/15 px-3.5 py-2 text-xs font-semibold text-[#F4F2EC] hover:bg-[#1D2939]/80 transition-colors min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B99A55]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#252B33] focus:border-[#26364A] focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#B99A55] hover:bg-[#c5a764] px-5 py-2.5 text-sm font-semibold text-[#1D2939] transition-colors min-h-[44px] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4" />
                Profile updated
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl bg-white border border-[#E5E7EB] p-5 text-xs text-[#68717D] space-y-2">
        <h2 className="font-semibold text-[#26364A]">Data Protection & Rights (NDPA 2023)</h2>
        <p className="leading-relaxed">
          You control your profile information. To request complete deletion of your account or private records, please contact our ministry administration through the{' '}
          <Link to="/connect" className="underline font-medium text-[#26364A] hover:text-[#1D2939]">
            Connect page
          </Link>{' '}
          or review our{' '}
          <Link to="/privacy" className="underline font-medium text-[#26364A] hover:text-[#1D2939]">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
