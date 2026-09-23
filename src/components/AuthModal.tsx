import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
  actionPrompt?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  actionPrompt = 'Please sign in or create an account to proceed with your WhatsApp order.',
}) => {
  const { signInWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
        // User voluntarily dismissed the Google popup window; don't treat as a crash
        setError('Sign-in cancelled. Please click "Continue with Google" again or use your email.');
      } else if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
        setError('Popup was blocked by your browser. Please allow popups for this site or use email sign in.');
      } else {
        console.error('Google sign in error:', err);
        setError('Unable to sign in with Google right now. Please try again or use email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUpWithEmail(email.trim(), password, name.trim(), phone.trim());
      } else {
        await loginWithEmail(email.trim(), password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.warn('Auth submission error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/invalid-credential' || msg.includes('auth/invalid-credential') || code === 'auth/wrong-password' || msg.includes('auth/wrong-password') || code === 'auth/user-not-found' || msg.includes('auth/user-not-found')) {
        setError('Incorrect email or password. If you do not have an account yet, please click "Sign Up" below.');
      } else if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Please switch to "Sign In".');
      } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password' || msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/network-request-failed' || msg.includes('auth/network-request-failed')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err instanceof Error ? err.message : 'Authentication failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFC9] overflow-hidden z-10 p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-[#1C3325]/60 hover:text-[#1C3325] rounded-full hover:bg-[#EFE9DF] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EFE6] text-[#B85C38] rounded-full text-xs font-semibold uppercase tracking-wider border border-[#E8DFC9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soot & Stitch Customer</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#1C3325]">
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
          </h2>
          <p className="text-xs text-[#1C3325]/75 leading-relaxed">
            {actionPrompt}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google One-Click Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-neutral-50 border border-[#E8DFC9] rounded-xl text-xs sm:text-sm font-semibold text-[#1C3325] shadow-xs transition-all mb-4 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#E8DFC9] w-full" />
          <span className="bg-[#FAF7F2] px-3 text-[11px] uppercase tracking-wider text-[#1C3325]/50 absolute font-semibold">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C3325] block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3325]/45" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DFC9] rounded-lg text-xs sm:text-sm text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C3325] block">
                  WhatsApp Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3325]/45" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DFC9] rounded-lg text-xs sm:text-sm text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1C3325] block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3325]/45" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DFC9] rounded-lg text-xs sm:text-sm text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1C3325] block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3325]/45" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DFC9] rounded-lg text-xs sm:text-sm text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#1C3325] hover:bg-[#284533] text-[#FAF7F2] font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="text-center pt-4 text-xs text-[#1C3325]/75 border-t border-[#E8DFC9] mt-5">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className="font-semibold text-[#B85C38] hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signin');
                }}
                className="font-semibold text-[#B85C38] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
