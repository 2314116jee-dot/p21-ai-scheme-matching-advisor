import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, Check } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the terms of service and privacy notice.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        mobile_number: mobileNumber || null,
        password,
        confirm_password: confirmPassword,
        terms_accepted: termsAccepted,
      });
      // Move to onboarding wizard to set up profile
      navigate('/onboarding');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <PageTransition>
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                Entrepreneur Registration
              </span>
              <span className="text-[10px] text-stone-500 font-hud-mono">
                ENROLL.STEP_01
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Sign up to discover schemes tailored to your venture and track required documents.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="register-error"
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
                Full Legal Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ramesh Sharma"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address <span className="text-rose-600">*</span>
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

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mobile Contact Number <span className="text-stone-400 font-normal font-hud-mono">(Optional)</span>
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Create Password <span className="text-rose-600">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              {password && (
                <div className="mt-1 text-[11px] flex items-center space-x-1 font-hud-mono">
                  {isPasswordLongEnough ? (
                    <span className="text-emerald-700 flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> 8+ characters satisfied
                    </span>
                  ) : (
                    <span className="text-stone-500">Must be at least 8 characters</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password <span className="text-rose-600">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                />
              </div>
              {confirmPassword && (
                <div className="mt-1 text-[11px] font-hud-mono">
                  {doPasswordsMatch ? (
                    <span className="text-emerald-700 flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-slate-900 border-stone-300 rounded focus:ring-slate-900 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-stone-600 cursor-pointer select-none leading-relaxed">
                I agree to the Terms of Service and acknowledge that P21 evaluates schemes deterministically from official Gazette criteria without warranty of government sanction.
              </label>
            </div>

            <TactileButton
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              loadingText="Creating Account..."
            >
              Register & Continue to Profile
            </TactileButton>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Already registered?{' '}
            <Link to="/auth/user-login" className="font-semibold text-slate-900 hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
