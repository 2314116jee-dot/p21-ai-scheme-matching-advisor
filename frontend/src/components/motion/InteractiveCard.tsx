import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_SPRINGS } from '../../styles/motion';

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isInteractive?: boolean;
  elevation?: 'flat' | 'raised' | 'hud' | 'subtle';
  className?: string;
  onClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  isInteractive = true,
  elevation = 'raised',
  className = '',
  onClick,
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getElevationStyles = () => {
    switch (elevation) {
      case 'flat':
        return 'bg-white border border-stone-200';
      case 'subtle':
        return 'bg-white border border-stone-300 shadow-xs';
      case 'hud':
        return 'bg-white border border-stone-300 shadow-sm relative overflow-hidden';
      case 'raised':
      default:
        return 'bg-white border border-stone-300 shadow-sm';
    }
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        isInteractive && !shouldReduceMotion
          ? {
              y: -3,
              boxShadow: '0 8px 18px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04)',
              borderColor: '#b4b0a7',
            }
          : undefined
      }
      whileTap={
        isInteractive && onClick && !shouldReduceMotion
          ? {
              y: 0,
              scale: 0.995,
            }
          : undefined
      }
      transition={MOTION_SPRINGS.snappy}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-lg transition-colors motion-gpu ${onClick ? 'cursor-pointer' : ''} ${getElevationStyles()} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
};
