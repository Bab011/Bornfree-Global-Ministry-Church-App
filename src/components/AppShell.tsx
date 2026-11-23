import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  HeartHandshake,
  Compass,
  CalendarDays,
  Users,
  Bell,
  UserCircle2,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { AuthModal } from '@/src/components/AuthModal';

const NAV_ITEMS = [
  { to: '/', label: 'HOME', icon: Home, end: true },
  { to: '/prayer', label: 'PRAYER', icon: HeartHandshake, end: false },
  { to: '/discover', label: 'DISCOVER', icon: Compass, end: false },
  { to: '/events', label: 'EVENTS', icon: CalendarDays, end: false },
  { to: '/connect', label: 'CONNECT', icon: Users, end: false },
] as const;

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, profile, user, isAnyStaff } = useAuth();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const firstName =
    profile?.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    null;

  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#252B33] flex flex-col">
      {/* Top Header Bar: Deep Slate Blue with Crisp White Logo Medallion */}
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#26364A] border-b border-white/10 text-white">
        <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand mark */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-lg"
          >
            <span className="w-9 h-9 rounded-full bg-white p-0.5 border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </span>
            <span className="font-display text-base md:text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
              Bornfree Global
            </span>
          </NavLink>

          {/* Zone 2: Desktop Primary Nav */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-xs tracking-wider font-semibold"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#B99A55] text-white'
                      : 'border-transparent text-[#E5E7EB]/85 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Utility & Account Action */}
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <PWAInstallButton compact onDark />
            </div>

            {isAnyStaff && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[40px] whitespace-nowrap shrink-0 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#B99A55] text-[#1D2939]'
                    : 'bg-[#1D2939] text-[#E5E7EB] hover:text-white border border-white/10'
                }`}
                title="Administrative Dashboard"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="Notification Centre"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                location.pathname === '/notifications'
                  ? 'bg-[#1D2939] text-[#B99A55]'
                  : 'text-[#E5E7EB] hover:bg-[#1D2939] hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>

            {isSignedIn ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-[#1D2939] hover:bg-[#1D2939]/80 text-xs font-medium text-white min-h-[40px] whitespace-nowrap shrink-0 transition-colors"
              >
                <UserCircle2 className="w-4 h-4 text-[#B99A55]" />
                <span className="max-w-[90px] truncate">{firstName || 'Profile'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-[#B99A55] px-4 py-2 text-xs font-semibold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[40px] whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-24 md:pb-14">
        {children}
      </main>

      {/* Desktop Footer: Midnight Blue Anchor */}
      <footer className="hidden md:block border-t border-white/10 bg-[#1D2939] text-[#E5E7EB] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white p-0.5 border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </span>
            <div>
              <p className="font-semibold text-white tracking-wide">{MINISTRY_IDENTITY.name}</p>
              <p className="mt-0.5 text-[#E5E7EB]/75">{MINISTRY_IDENTITY.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[#E5E7EB]/85">
            <NavLink to="/new-here" className="hover:text-white transition-colors whitespace-nowrap">
              First-Time Visitors
            </NavLink>
            <NavLink to="/privacy" className="hover:text-white transition-colors whitespace-nowrap">
              Privacy Policy
            </NavLink>
            <NavLink to="/terms" className="hover:text-white transition-colors whitespace-nowrap">
              Terms of Use
            </NavLink>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-5 left-4 z-40 flex items-center gap-2 rounded-lg bg-[#1D2939] border border-white/15 text-white px-3.5 py-2 text-xs font-medium shadow-sm">
          <WifiOff className="w-3.5 h-3.5 text-[#B99A55]" />
          <span>Offline — Showing cached app shell</span>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar: Deep Slate Blue & Muted Gold */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#26364A] border-t border-white/10 pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center max-w-lg mx-auto px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center h-[52px] rounded-lg mx-0.5 transition-colors ${
                    isActive
                      ? 'bg-[#1D2939] text-white'
                      : 'text-[#E5E7EB]/75 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute top-0 h-0.5 w-8 rounded-full transition-opacity ${
                        isActive ? 'bg-[#B99A55] opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon
                      className={`w-5 h-5 ${isActive ? 'text-[#B99A55]' : ''}`}
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <span
                      className={`mt-1 text-[10px] tracking-wider whitespace-nowrap ${
                        isActive ? 'font-bold text-white' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
