import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const UserLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      if (user.has_profile) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
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
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-hud-mono">
                Entrepreneur Sign In
              </span>
              <span className="text-[10px] text-stone-500 font-hud-mono">
                AUTH.SECURE
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
              Access Your Portal
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Sign in to view your matched schemes, assessments, and checklists.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="login-error"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.in"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-stone-500 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-slate-900 border-stone-300 rounded focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-stone-600 cursor-pointer select-none">
                Keep me signed in for 7 days
              </label>
            </div>

            <TactileButton
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              loadingText="Verifying Credentials..."
            >
              Sign In
            </TactileButton>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Do not have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
