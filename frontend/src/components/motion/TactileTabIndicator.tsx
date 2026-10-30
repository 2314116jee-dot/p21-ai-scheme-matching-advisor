import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_SPRINGS } from '../../styles/motion';

interface TactileTabIndicatorProps {
  layoutId?: string;
  className?: string;
}

export const TactileTabIndicator: React.FC<TactileTabIndicatorProps> = ({
  layoutId = 'active-tab-indicator',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`absolute inset-0 bg-stone-100 rounded border border-stone-200 -z-10 ${className}`} />
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      transition={MOTION_SPRINGS.snappy}
      className={`absolute inset-0 bg-stone-100 rounded border border-stone-200 -z-10 ${className}`}
    />
  );
};
