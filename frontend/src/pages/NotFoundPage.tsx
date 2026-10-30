import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageTransition } from '../components/motion/PageTransition';
import { TactileButton } from '../components/motion/TactileButton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { MOTION_SPRINGS, staggerContainerVariants, staggerItemVariants } from '../styles/motion';

export const NotFoundPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <PageTransition>
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="max-w-md w-full space-y-5"
        >
          <motion.div
            variants={staggerItemVariants}
            className="w-16 h-16 bg-stone-100 text-slate-900 rounded-2xl font-hud-mono font-extrabold text-2xl flex items-center justify-center mx-auto border border-stone-200 shadow-xs"
          >
            404
          </motion.div>

          <motion.div variants={staggerItemVariants} className="space-y-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-hud font-hud-mono">
              Signal Routing Error
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              The requested route, portal asset, or scheme record does not exist in the active catalogue.
            </p>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="pt-2">
            <Link to="/" className="inline-block focus:outline-none">
              <TactileButton variant="primary" size="md">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Return to Command Centre</span>
              </TactileButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
