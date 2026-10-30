import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { User, Shield, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/motion/PageTransition';
import { InteractiveCard } from '../components/motion/InteractiveCard';
import { staggerContainerVariants, staggerItemVariants, MOTION_DURATIONS, MOTION_EASINGS } from '../styles/motion';

export const AuthSelectPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainerVariants(0.08, 0.05)}
          className="max-w-md w-full space-y-8 text-center"
        >
          <motion.div variants={staggerItemVariants}>
            <div className="mx-auto w-12 h-12 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xl shadow-sm border border-slate-800">
              P21
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
              Portal Authentication
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Select your access role to proceed to the secure portal.
            </p>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="grid grid-cols-1 gap-4 text-left">
            {/* User Option */}
            <Link to="/auth/user-login" className="block">
              <InteractiveCard className="p-5 group flex items-start space-x-4 border-stone-300 hover:border-slate-800">
                <div className="p-3 bg-stone-100 group-hover:bg-slate-900 group-hover:text-white rounded text-stone-700 transition-colors shadow-2xs">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950">
                      Entrepreneur Portal
                    </h3>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    For aspiring founders, MSMEs, startups, and business owners to search schemes and get recommendations.
                  </p>
                </div>
              </InteractiveCard>
            </Link>

            {/* Admin Option */}
            <Link to="/auth/admin-login" className="block">
              <InteractiveCard className="p-5 group flex items-start space-x-4 border-stone-300 hover:border-amber-800">
                <div className="p-3 bg-amber-50 group-hover:bg-amber-900 group-hover:text-white rounded text-amber-800 transition-colors shadow-2xs">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-950">
                      Administrator Portal
                    </h3>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Restricted to authorized officials for scheme review, verification, data quality audits, and user governance.
                  </p>
                </div>
              </InteractiveCard>
            </Link>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="pt-2 text-xs text-stone-500">
            New entrepreneur?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline">
              Create an account
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
