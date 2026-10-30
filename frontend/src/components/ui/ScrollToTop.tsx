import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { MOTION_SPRINGS } from '../../styles/motion';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      mainEl.focus({ preventScroll: true });
    } else {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top of page"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={!shouldReduceMotion ? { scale: 1.08, y: -2 } : undefined}
          whileTap={!shouldReduceMotion ? { scale: 0.94 } : undefined}
          transition={MOTION_SPRINGS.tactile}
          className="fixed bottom-6 left-6 z-40 p-2.5 bg-slate-900/90 text-white rounded-full shadow-lg border border-slate-700/60 backdrop-blur-xs hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors cursor-pointer print:hidden"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
