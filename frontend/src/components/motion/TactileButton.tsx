import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_SPRINGS } from '../../styles/motion';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'admin' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const TactileButton = React.forwardRef<HTMLButtonElement, TactileButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm border border-slate-900';
      case 'secondary':
        return 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-sm';
      case 'admin':
        return 'bg-amber-900 hover:bg-amber-800 text-white shadow-sm border border-amber-900';
      case 'accent':
        return 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-sm border border-amber-400';
      case 'ghost':
        return 'bg-transparent text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-transparent';
      case 'danger':
        return 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300';
      default:
        return 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm border border-slate-900';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded font-medium gap-1.5';
      case 'lg':
        return 'px-6 py-3.5 text-sm sm:text-base rounded-md font-semibold gap-2.5';
      case 'md':
      default:
        return 'px-4 py-2 text-xs sm:text-sm rounded font-semibold gap-2';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled && !shouldReduceMotion ? { y: -1, scale: 1.01 } : undefined}
      whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.97, y: 0 } : undefined}
      transition={MOTION_SPRINGS.tactile}
      className={`inline-flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none motion-gpu ${getVariantStyles()} ${getSizeStyles()} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(rest as any)}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

TactileButton.displayName = 'TactileButton';
