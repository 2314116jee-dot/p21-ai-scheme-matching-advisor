import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_SPRINGS } from '../../styles/motion';

interface VerificationBadgeProps {
  status: 'Candidate' | 'Needs Review' | 'Verified' | 'Stale' | 'Superseded' | 'Rejected' | string;
  size?: 'sm' | 'md';
  showPulse?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showPulse = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getStyles = () => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Needs Review':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Candidate':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Stale':
      case 'Superseded':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium border rounded select-none ${getStyles()} ${px}`}>
      {status === 'Verified' ? (
        <>
          {showPulse && !shouldReduceMotion ? (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 shrink-0"
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 shrink-0" />
          )}
          <svg className="w-3 h-3 mr-1 text-emerald-700 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </>
      ) : status === 'Needs Review' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 shrink-0" />
      ) : status === 'Candidate' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 shrink-0" />
      ) : null}
      <span className="font-hud-mono tracking-tight">{status}</span>
    </span>
  );
};

export const ResultStatusBadge: React.FC<{ result: string; animated?: boolean }> = ({
  result,
  animated = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getBadgeContent = () => {
    switch (result) {
      case 'PASS':
        return {
          text: 'ELIGIBLE (PASS)',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
        };
      case 'FAIL':
        return {
          text: 'INELIGIBLE (FAIL)',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
        };
      case 'UNKNOWN':
        return {
          text: 'ACTION REQUIRED (UNKNOWN)',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
        };
      default:
        return {
          text: result,
          className: 'bg-stone-100 text-stone-700 border-stone-300',
          dot: 'bg-stone-500',
        };
    }
  };

  const { text, className, dot } = getBadgeContent();

  const badgeElement = (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded border font-hud-mono select-none ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5 shrink-0`} />
      {text}
    </span>
  );

  if (animated && !shouldReduceMotion) {
    return (
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={MOTION_SPRINGS.snappy}
        className="inline-flex"
      >
        {badgeElement}
      </motion.div>
    );
  }

  return badgeElement;
};
