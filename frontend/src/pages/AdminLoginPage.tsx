import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter administrative credentials.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Access denied. You do not possess administrator credentials.');
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
          className="max-w-md w-full space-y-6 bg-white p-8 border border-amber-300/80 rounded-lg shadow-sm text-left relative overflow-hidden"
        >
          {/* Official Administrative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-800" />

          <div>
            <div className="w-10 h-10 bg-amber-900 text-white rounded flex items-center justify-center mb-3 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-hud-mono">
                Official Administration
              </span>
              <span className="text-[10px] text-amber-700 font-hud-mono px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                AUDITED.ACCESS
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
              Administrator Gateway
            </h2>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              Authorized personnel only. Sensitive actions are cryptographically recorded in audit logs.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="admin-login-error"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={MOTION_SPRINGS.snappy}
                className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2 overflow-hidden"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-amber-800 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@p21.gov.local"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Administrator Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-amber-800 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-10 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all font-mono"
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

            <TactileButton
              type="submit"
              variant="admin"
              fullWidth
              loading={loading}
              loadingText="Verifying Admin Gateway..."
            >
              Access Administrative Gateway
            </TactileButton>
          </form>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <Link to="/auth/user-login" className="hover:text-slate-900 transition-colors">
              ← Return to Entrepreneur Sign In
            </Link>
            <Link to="/forgot-password" className="hover:text-slate-900 transition-colors">
              Reset Password
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
