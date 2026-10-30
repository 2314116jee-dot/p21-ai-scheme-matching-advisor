import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  const tokenParam = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      setErrorMessage('Missing password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
          confirm_new_password: confirmPassword,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to reset password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: MOTION_DURATIONS.deliberate, ease: MOTION_EASINGS.cinematic }}
          className="max-w-md w-full space-y-6 bg-white p-8 border border-stone-300 rounded-lg shadow-sm text-left relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                Security Verification
              </span>
              <span className="text-[10px] text-stone-500 font-hud-mono">
                TOKEN.EXECUTE
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
              Set New Password
            </h2>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Enter your reset token and define a secure new password.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="reset-error"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={MOTION_SPRINGS.snappy}
                className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={MOTION_SPRINGS.snappy}
              className="space-y-4"
            >
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Password reset successfully</p>
                  <p className="mt-1 text-emerald-800 leading-relaxed">
                    Your credentials have been securely updated. You can now log in.
                  </p>
                </div>
              </div>

              <Link to="/auth/user-login" className="block">
                <TactileButton variant="primary" fullWidth>
                  Sign In with New Password
                </TactileButton>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recovery Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 32-character token"
                  className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Password (min. 8 characters)
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-10 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <motion.button
                    type="button"
                    whileTap={!shouldReduceMotion ? { scale: 0.9 } : undefined}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <TactileButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                loadingText="Updating Password..."
              >
                Reset Password
              </TactileButton>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};
