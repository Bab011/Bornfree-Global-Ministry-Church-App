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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151515]/75 p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-[2px] bg-[#F0F0EE] border border-[#151515]/20 overflow-hidden my-8">
        <div className="bg-[#151515] text-white px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#151515] p-1 flex items-center justify-center shrink-0">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-light text-white">
                {mode === 'signin' ? 'Sign In' : 'Create Member Account'}
              </h2>
              <p className="text-xs italic font-semibold text-[#A3A19D]">
                {MINISTRY_IDENTITY.shortName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="btn-press w-10 h-10 rounded-[2px] bg-white text-[#151515] flex items-center justify-center"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 bg-white">
          <div className="grid grid-cols-2 border border-[#151515]/15 rounded-[2px] bg-[#F0F0EE] p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 text-xs font-medium rounded-[2px] transition-colors min-h-[40px] ${
                mode === 'signin'
                  ? 'bg-[#151515] text-white'
                  : 'text-[#6B6A67] hover:text-[#151515]'
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
              className={`py-2 text-xs font-medium rounded-[2px] transition-colors min-h-[40px] ${
                mode === 'register'
                  ? 'bg-[#151515] text-white'
                  : 'text-[#6B6A67] hover:text-[#151515]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-[2px] bg-red-50 border border-red-300 p-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="btn-press w-full flex items-center justify-center gap-2.5 rounded-[2px] border border-[#151515]/20 bg-white py-2.5 px-4 text-sm font-medium text-[#151515] hover:bg-[#F0F0EE] min-h-[44px] disabled:opacity-60"
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

          <div className="my-4 flex items-center gap-3 text-xs text-[#6B6A67]">
            <div className="h-px flex-1 bg-[#151515]/12" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-[#151515]/12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#151515] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B6A67] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-[2px] border border-[#151515]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#151515] focus:outline-none focus:border-[#151515] min-h-[44px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6A67] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-[2px] border border-[#151515]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#151515] focus:outline-none focus:border-[#151515] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#151515] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B6A67] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-[2px] border border-[#151515]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#151515] focus:outline-none focus:border-[#151515] min-h-[44px]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#151515] mb-1">Country</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#6B6A67] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Nigeria"
                        className="w-full rounded-[2px] border border-[#151515]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#151515] focus:outline-none focus:border-[#151515] min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#151515] mb-1">City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#6B6A67] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lagos"
                        className="w-full rounded-[2px] border border-[#151515]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#151515] focus:outline-none focus:border-[#151515] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#6B6A67] pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded-[2px] border-[#151515]/30 accent-[#151515]"
                  />
                  <span>
                    I consent to Bornfree Global Ministry storing my account details in line with the{' '}
                    <a href="/privacy" className="underline text-[#151515] font-medium">
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
              className="btn-press w-full rounded-[2px] bg-[#FCDC00] py-2.5 px-4 text-sm font-semibold text-[#151515] hover:bg-[#e8ca00] min-h-[44px] disabled:opacity-60"
            >
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
