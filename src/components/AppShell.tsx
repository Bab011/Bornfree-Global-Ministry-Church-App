import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  Menu,
  ShieldCheck,
  User,
  WifiOff,
  X,
} from 'lucide-react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { AuthModal } from '@/src/components/AuthModal';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/prayer', label: 'Prayer', end: false },
  { to: '/discover', label: 'Discover', end: false },
  { to: '/events', label: 'Events', end: false },
  { to: '/connect', label: 'Connect', end: false },
] as const;

const DRAWER_SECONDARY = [
  { to: '/services/wednesday', label: 'Wednesday Midweek Service' },
  { to: '/services/sunday', label: 'Sunday Worship Service' },
  { to: '/new-here', label: 'First-Time Visitors' },
  { to: '/notifications', label: 'Notification Centre' },
] as const;

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, profile, user, isAnyStaff } = useAuth();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  const firstName =
    profile?.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    null;

  return (
    <div className="min-h-screen bg-[#F0F0EE] text-[#151515] flex flex-col">
      {/* Editorial Header: Over Hero on Home, Clean Paper Header on Inner Pages */}
      <header
        className={
          isHome
            ? 'absolute top-0 left-0 right-0 z-30 h-20 text-white'
            : 'sticky top-0 z-30 h-18 bg-[#F0F0EE] border-b border-[#151515]/12 text-[#151515]'
        }
      >
        <div className="max-w-[1200px] mx-auto h-full px-5 md:px-8 flex items-center justify-between gap-4">
          {/* Signature Wordmark: Italic 600 */}
          <NavLink
            to="/"
            className={`inline-flex items-center gap-3 whitespace-nowrap shrink-0 rounded-[2px] ${
              isHome ? 'text-white' : 'text-[#151515]'
            }`}
          >
            <span className="italic font-semibold text-base md:text-lg tracking-[-0.01em]">
              {MINISTRY_IDENTITY.shortName}
            </span>
          </NavLink>

          {/* Desktop Editorial Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-[13px] font-normal tracking-wide"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? isHome
                        ? 'border-[#FCDC00] text-white font-medium'
                        : 'border-[#FCDC00] text-[#151515] font-medium'
                      : isHome
                        ? 'border-transparent text-white/80 hover:text-white'
                        : 'border-transparent text-[#6B6A67] hover:text-[#151515]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Utility + Signature Square White Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isAnyStaff && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className={`btn-press hidden sm:inline-flex items-center gap-1.5 px-3 h-11 rounded-[2px] text-xs font-medium whitespace-nowrap ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#FCDC00] text-[#151515]'
                    : isHome
                      ? 'bg-[#151515]/75 text-white border border-white/25 hover:bg-[#151515]'
                      : 'bg-white text-[#151515] border border-[#151515]/15 hover:border-[#151515]'
                }`}
                title="Administrative Dashboard"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="Notification Centre"
              className={`btn-press hidden sm:flex w-11 h-11 items-center justify-center rounded-[2px] border transition-colors ${
                location.pathname === '/notifications'
                  ? 'bg-[#FCDC00] border-[#FCDC00] text-[#151515]'
                  : isHome
                    ? 'bg-[#151515]/75 border-white/25 text-white hover:bg-[#151515]'
                    : 'bg-white border-[#151515]/15 text-[#151515] hover:border-[#151515]'
              }`}
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {isSignedIn ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={`btn-press hidden sm:inline-flex items-center gap-2 px-3.5 h-11 rounded-[2px] border text-xs font-medium whitespace-nowrap ${
                  isHome
                    ? 'bg-[#151515]/75 border-white/25 text-white hover:bg-[#151515]'
                    : 'bg-white border-[#151515]/15 text-[#151515] hover:border-[#151515]'
                }`}
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span className="max-w-[90px] truncate">{firstName || 'Profile'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="btn-press hidden sm:inline-flex items-center justify-center rounded-[2px] bg-[#FCDC00] px-4 h-11 text-xs font-semibold text-[#151515] hover:bg-[#e8ca00] whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Signature Element 2: Square White Menu Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className={`btn-press w-11 h-11 rounded-[2px] bg-white text-[#151515] flex items-center justify-center shrink-0 ${
                isHome ? '' : 'border border-[#151515]/15 hover:border-[#151515]'
              }`}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={
          isHome
            ? 'flex-1 w-full'
            : 'flex-1 w-full max-w-[1200px] mx-auto px-5 md:px-8 pt-8 pb-16'
        }
      >
        {children}
      </main>

      {/* Editorial Footer: Solid --ink with Logo on Neutral --ink & Clear Space */}
      <footer className="border-t border-white/10 bg-[#151515] text-white py-12 px-5 md:px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#151515] p-1.5 shrink-0 flex items-center justify-center">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="italic font-semibold text-base text-white">
                {MINISTRY_IDENTITY.shortName}
              </p>
              <p className="mt-1 text-xs font-normal text-[#A3A19D] max-w-md leading-relaxed">
                {MINISTRY_IDENTITY.address}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-normal text-[#A3A19D]">
            <NavLink to="/services/wednesday" className="hover:text-white transition-colors">
              Wednesday Service
            </NavLink>
            <NavLink to="/services/sunday" className="hover:text-white transition-colors">
              Sunday Service
            </NavLink>
            <NavLink to="/new-here" className="hover:text-white transition-colors">
              First-Time Visitors
            </NavLink>
            <NavLink to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </NavLink>
            <NavLink to="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </NavLink>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-[2px] bg-[#151515] border border-white/20 text-white px-3.5 py-2 text-xs font-normal">
          <WifiOff className="w-3.5 h-3.5 text-[#FCDC00]" strokeWidth={1.5} />
          <span>Offline — Showing cached app shell</span>
        </div>
      )}

      {/* Slide-Over Editorial Navigation Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#151515]/70"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            aria-label="Full navigation drawer"
            className="w-full max-w-sm h-full bg-[#151515] text-white flex flex-col justify-between overflow-y-auto border-l border-white/12"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="p-6 flex items-center justify-between border-b border-white/12">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#151515] p-1 flex items-center justify-center shrink-0">
                    <img
                      src={MINISTRY_IDENTITY.logoUrl}
                      alt="Bornfree Global Ministry Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="italic font-semibold text-base text-white">
                    {MINISTRY_IDENTITY.shortName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="btn-press w-11 h-11 rounded-[2px] bg-white text-[#151515] flex items-center justify-center"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Primary Routes */}
              <nav className="p-6 divide-y divide-white/10">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `py-4 flex items-center justify-between text-2xl font-light tracking-[-0.02em] transition-colors ${
                        isActive ? 'text-[#FCDC00]' : 'text-white hover:text-[#FCDC00]'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} />
                  </NavLink>
                ))}
              </nav>

              {/* Secondary Ministry Links */}
              <div className="px-6 pb-6 pt-2 space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-[#A3A19D] pb-2">
                  Ministry & Worship
                </p>
                {DRAWER_SECONDARY.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block py-2.5 text-sm font-normal transition-colors ${
                        isActive ? 'text-[#FCDC00]' : 'text-white/80 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                {isAnyStaff && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `block py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'text-[#FCDC00]' : 'text-[#E9DFC6] hover:text-white'
                      }`
                    }
                  >
                    Administrative Dashboard
                  </NavLink>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/12 bg-[#1F1D1C] space-y-3">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/profile');
                  }}
                  className="btn-press w-full h-11 rounded-[2px] bg-white text-[#151515] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#FCDC00]"
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span>{firstName ? `${firstName} — Profile` : 'Member Profile'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="btn-press w-full h-11 rounded-[2px] bg-[#FCDC00] text-[#151515] text-xs font-semibold flex items-center justify-center hover:bg-[#e8ca00]"
                >
                  Sign In / Create Account
                </button>
              )}
              <div className="flex items-center justify-between gap-3">
                <PWAInstallButton onDark />
                <span className="text-[11px] text-[#A3A19D]">WAT (UTC+1)</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
