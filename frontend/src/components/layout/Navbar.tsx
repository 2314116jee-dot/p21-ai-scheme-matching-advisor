import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, Menu, X, Sparkles, Search } from 'lucide-react';
import { MOTION_SPRINGS, MOTION_DURATIONS, MOTION_EASINGS } from '../../styles/motion';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 transition-colors">
      {/* Top Ministry Accent Line */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-stone-400 to-emerald-700" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand with Tactile Feedback */}
          <Link to="/" className="flex items-center space-x-3 text-left group">
            <motion.div
              whileHover={!shouldReduceMotion ? { scale: 1.04, y: -1 } : undefined}
              whileTap={!shouldReduceMotion ? { scale: 0.96 } : undefined}
              transition={MOTION_SPRINGS.tactile}
              className="w-10 h-10 bg-slate-900 text-white rounded flex items-center justify-center font-bold tracking-tight text-lg shadow-sm border border-slate-800"
            >
              P21
            </motion.div>
            <div>
              <span className="block text-base font-bold text-stone-900 leading-tight tracking-tight group-hover:text-slate-800 transition-colors">
                Scheme Advisor
              </span>
              <span className="block text-[11px] font-medium text-stone-600 tracking-tight">
                Central Government Entrepreneur Guidance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Sliding Active Indicator */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-1 relative">
            <Link
              to="/schemes"
              className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors ${
                isActive('/schemes')
                  ? 'text-slate-950 font-bold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {isActive('/schemes') && !shouldReduceMotion && (
                <motion.div
                  layoutId="active-nav-pill"
                  transition={MOTION_SPRINGS.snappy}
                  className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10"
                />
              )}
              {isActive('/schemes') && shouldReduceMotion && (
                <div className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10" />
              )}
              <span>Explore Schemes</span>
            </Link>

            <Link
              to="/ai-assistant"
              className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${
                isActive('/ai-assistant')
                  ? 'text-amber-950 font-bold'
                  : 'text-stone-700 hover:text-amber-900 hover:bg-amber-50/50'
              }`}
            >
              {isActive('/ai-assistant') && !shouldReduceMotion && (
                <motion.div
                  layoutId="active-nav-pill"
                  transition={MOTION_SPRINGS.snappy}
                  className="absolute inset-0 bg-amber-50 rounded border border-amber-200 -z-10"
                />
              )}
              {isActive('/ai-assistant') && shouldReduceMotion && (
                <div className="absolute inset-0 bg-amber-50 rounded border border-amber-200 -z-10" />
              )}
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Assistant</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors ${
                    isActive('/dashboard')
                      ? 'text-slate-950 font-bold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {isActive('/dashboard') && !shouldReduceMotion && (
                    <motion.div
                      layoutId="active-nav-pill"
                      transition={MOTION_SPRINGS.snappy}
                      className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10"
                    />
                  )}
                  {isActive('/dashboard') && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10" />
                  )}
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/saved-schemes"
                  className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors ${
                    isActive('/saved-schemes')
                      ? 'text-slate-950 font-bold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {isActive('/saved-schemes') && !shouldReduceMotion && (
                    <motion.div
                      layoutId="active-nav-pill"
                      transition={MOTION_SPRINGS.snappy}
                      className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10"
                    />
                  )}
                  {isActive('/saved-schemes') && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10" />
                  )}
                  <span>Saved</span>
                </Link>

                <Link
                  to="/compare"
                  className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors ${
                    isActive('/compare')
                      ? 'text-slate-950 font-bold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {isActive('/compare') && !shouldReduceMotion && (
                    <motion.div
                      layoutId="active-nav-pill"
                      transition={MOTION_SPRINGS.snappy}
                      className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10"
                    />
                  )}
                  {isActive('/compare') && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10" />
                  )}
                  <span>Compare</span>
                </Link>

                <Link
                  to="/checklist"
                  className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors ${
                    isActive('/checklist')
                      ? 'text-slate-950 font-bold'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {isActive('/checklist') && !shouldReduceMotion && (
                    <motion.div
                      layoutId="active-nav-pill"
                      transition={MOTION_SPRINGS.snappy}
                      className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10"
                    />
                  )}
                  {isActive('/checklist') && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-stone-100 rounded border border-stone-200/80 -z-10" />
                  )}
                  <span>Checklists</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`relative px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'text-amber-950 font-bold'
                    : 'text-stone-800 hover:text-amber-900 hover:bg-amber-50/50'
                }`}
              >
                {isActive('/admin') && !shouldReduceMotion && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={MOTION_SPRINGS.snappy}
                    className="absolute inset-0 bg-amber-50 rounded border border-amber-300 -z-10"
                  />
                )}
                {isActive('/admin') && shouldReduceMotion && (
                  <div className="absolute inset-0 bg-amber-50 rounded border border-amber-300 -z-10" />
                )}
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded border border-stone-200 transition-colors cursor-pointer"
              aria-label="Open quick jump command palette (Ctrl + K)"
              title="Open Command Palette (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-[11px]">Quick Jump</span>
              <kbd className="font-hud-mono text-[9px] bg-white border border-stone-300 rounded px-1 py-0.2 text-stone-500 shadow-2xs">
                Ctrl K
              </kbd>
            </button>
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/profile"
                  className="group flex items-center space-x-2 text-xs text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded border border-stone-200 transition-all shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-stone-500 group-hover:text-slate-900 transition-colors" />
                  <span className="font-semibold max-w-[140px] truncate">{user.full_name}</span>
                </Link>

                <motion.button
                  whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
                  whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
                  transition={MOTION_SPRINGS.tactile}
                  onClick={handleLogout}
                  className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors rounded hover:bg-stone-50"
                >
                  Sign In
                </Link>
                <motion.div
                  whileHover={!shouldReduceMotion ? { scale: 1.02, y: -1 } : undefined}
                  whileTap={!shouldReduceMotion ? { scale: 0.97 } : undefined}
                  transition={MOTION_SPRINGS.tactile}
                >
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs inline-block"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={!shouldReduceMotion ? { scale: 0.92 } : undefined}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Fluid Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: MOTION_DURATIONS.snappy, ease: MOTION_EASINGS.cinematic }}
            className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-2 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setTimeout(() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                }, 150);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-left transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-stone-500" />
                <span>Quick Jump Command Palette</span>
              </div>
              <kbd className="font-hud-mono text-[10px] bg-white border border-stone-300 rounded px-1.5 py-0.5 text-stone-500 shadow-2xs">
                Ctrl K
              </kbd>
            </button>
            <Link
              to="/schemes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
            >
              Explore Schemes
            </Link>
            <Link
              to="/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Assistant</span>
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
                >
                  Dashboard
                </Link>
                <Link
                  to="/saved-schemes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
                >
                  Saved Schemes
                </Link>
                <Link
                  to="/compare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
                >
                  Matrix Comparison
                </Link>
                <Link
                  to="/checklist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
                >
                  Document Checklist
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded"
                >
                  My Profile
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 rounded"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-700 font-semibold"
                >
                  Sign Out ({user.full_name})
                </button>
              ) : (
                <div className="flex w-full space-x-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold border border-stone-300 rounded"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold bg-slate-900 text-white rounded"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
