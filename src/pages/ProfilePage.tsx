import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { ROLE_LABELS } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { AuthModal } from '@/src/components/AuthModal';
import { HighlighterSwipe } from '@/src/components/EditorialUI';

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
      <div className="max-w-lg mx-auto bg-white border border-[#151515]/12 overflow-hidden text-center rounded-[2px]">
        <div className="bg-[#151515] p-8 text-white space-y-3">
          <div className="w-12 h-12 rounded-[2px] bg-[#1F1D1C] border border-white/15 flex items-center justify-center mx-auto">
            <UserCircle2 className="w-6 h-6 text-[#FCDC00]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-light text-2xl text-white">Member Profile</h1>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-sm text-[#6B6A67] leading-relaxed">
            Sign in to track your prayer requests, save notification preferences, and manage your personal details.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-6 py-2.5 text-sm font-semibold text-[#151515] min-h-[44px]"
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
      <section className="bg-white border border-[#151515]/12 overflow-hidden rounded-[2px]">
        <div className="bg-[#151515] text-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#FCDC00]">{ROLE_LABELS[role]}</p>
            <HighlighterSwipe
              highlight={profile?.displayName || user?.displayName || 'Member'}
              as="h1"
              onDark
              className="text-2xl sm:text-3xl"
            />
            <p className="text-xs text-[#A3A19D] pt-1">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAnyStaff && (
              <Link
                to="/admin"
                className="btn-press inline-flex items-center gap-1.5 rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-4 py-2 text-xs font-semibold text-[#151515] min-h-[40px]"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="btn-press inline-flex items-center gap-1.5 rounded-[2px] bg-[#1F1D1C] border border-white/15 px-3.5 py-2 text-xs font-medium text-white hover:border-[#FCDC00] min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FCDC00]" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3.5 py-2.5 text-sm text-[#151515] focus:border-[#151515] focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-5 py-2.5 text-sm font-semibold text-[#151515] min-h-[44px] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#151515] bg-[#F0F0EE] px-2.5 py-1 rounded-[2px]">
                <Check className="w-4 h-4" strokeWidth={1.75} />
                Profile updated
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white border border-[#151515]/12 p-5 text-xs text-[#6B6A67] space-y-2 rounded-[2px]">
        <h2 className="font-semibold text-[#151515]">Data Protection & Rights (NDPA 2023)</h2>
        <p className="leading-relaxed">
          You control your profile information. To request complete deletion of your account or private records, please contact our ministry administration through the{' '}
          <Link to="/connect" className="underline font-medium text-[#151515]">
            Connect page
          </Link>{' '}
          or review our{' '}
          <Link to="/privacy" className="underline font-medium text-[#151515]">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
