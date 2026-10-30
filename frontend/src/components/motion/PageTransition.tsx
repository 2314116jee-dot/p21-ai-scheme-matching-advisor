import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageTransitionVariants, reducedMotionVariants } from '../../styles/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  scrollToTop?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  scrollToTop = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: shouldReduceMotion ? 'auto' : 'instant' });
    }
  }, [scrollToTop, shouldReduceMotion]);

  const variants = shouldReduceMotion ? reducedMotionVariants : pageTransitionVariants;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full motion-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
};
