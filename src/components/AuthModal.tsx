import React, { useState } from 'react';
import { X, Mail, Lock, User, Globe, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method). Please use Google Sign-In or enable Email/Password in Firebase.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Please choose a stronger password (at least 6 characters).';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed before completion.';
    }
    return err instanceof Error ? err.message : 'Unable to complete authentication.';
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'register' && !consentGiven) {
      setError('Please confirm your consent to our Privacy Policy before creating an account.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail({
          email,
          password,
          displayName,
          country,
          city,
          consentGiven,
        });
      }
      onClose();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2939]/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden shadow-lg my-8">
        <div className="bg-[#26364A] text-white px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'signin' ? 'Sign In' : 'Create Member Account'}
              </h2>
              <p className="text-xs text-[#E5E7EB]/80">Bornfree Global Ministry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="p-2 text-[#E5E7EB]/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-1 p-1 rounded-lg bg-[#E5E7EB]/70">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors min-h-[40px] ${
                mode === 'signin'
                  ? 'bg-[#26364A] text-white'
                  : 'text-[#68717D] hover:text-[#252B33]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors min-h-[40px] ${
                mode === 'register'
                  ? 'bg-[#26364A] text-white'
                  : 'text-[#68717D] hover:text-[#252B33]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white py-2.5 px-4 text-sm font-semibold text-[#252B33] hover:bg-[#F4F2EC] transition-colors min-h-[44px] disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="my-4 flex items-center gap-3 text-xs text-[#68717D]">
            <div className="h-px flex-1 bg-[#E5E7EB]" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#252B33] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-sm text-[#252B33] focus:outline-none focus:border-[#26364A] min-h-[44px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-sm text-[#252B33] focus:outline-none focus:border-[#26364A] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#252B33] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-sm text-[#252B33] focus:outline-none focus:border-[#26364A] min-h-[44px]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#252B33] mb-1">Country</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Nigeria"
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-sm text-[#252B33] focus:outline-none focus:border-[#26364A] min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#252B33] mb-1">City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lagos"
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-sm text-[#252B33] focus:outline-none focus:border-[#26364A] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#68717D] pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded border-[#E5E7EB] accent-[#26364A]"
                  />
                  <span>
                    I consent to Bornfree Global Ministry storing my account details in line with the{' '}
                    <a href="/privacy" className="underline text-[#26364A] font-medium">
                      Privacy Policy
                    </a>{' '}
                    (NDPA 2023).
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-[#B99A55] py-2.5 px-4 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[44px] disabled:opacity-60"
            >
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
