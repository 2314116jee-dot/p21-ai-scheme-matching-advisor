import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiRequest } from '../api/client';
import { Mail, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await apiRequest<{ message: string; dev_recovery_token?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      if (res.dev_recovery_token) {
        setDevToken(res.dev_recovery_token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset request.');
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
                Account Recovery
              </span>
              <span className="text-[10px] text-stone-500 font-hud-mono">
                RESET.REQUEST
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
              Reset Your Password
            </h2>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Submit your registered email address to receive an expiring single-use reset token.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="forgot-error"
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

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={MOTION_SPRINGS.snappy}
              className="space-y-4"
            >
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Reset request processed</p>
                  <p className="mt-1 text-emerald-800 leading-relaxed">
                    If this account exists, an expiring reset token has been registered in the database.
                  </p>
                </div>
              </div>

              {devToken && (
                <div className="p-4 bg-stone-50 border border-stone-300 rounded text-xs text-stone-800 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span className="font-hud-mono">Local Development Mode Recovery Token</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Because local demo runs without a public outbound SMTP mail server, your single-use token is displayed below for demonstration:
                  </p>
                  <div className="p-2.5 bg-stone-200/70 rounded font-mono text-[11px] break-all select-all text-slate-900 border border-stone-300">
                    {devToken}
                  </div>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="inline-block mt-2 font-bold text-slate-900 hover:underline"
                  >
                    Proceed to Reset Password with this Token →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link to="/auth/user-login" className="block">
                  <TactileButton variant="secondary" fullWidth>
                    Return to Login
                  </TactileButton>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@myenterprise.in"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <TactileButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                loadingText="Processing..."
              >
                Send Reset Instructions
              </TactileButton>

              <div className="pt-3 text-center">
                <Link to="/auth/user-login" className="text-xs text-stone-500 hover:text-slate-900 transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};
