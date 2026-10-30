/**
 * P21 Motion Design System
 * 
 * Game-Developer-Level Motion Tokens, Physics, Easings, and Choreography Variants.
 * Grounded in AAA game HUD, tactical strategy command centres, and high-end interactive interfaces.
 * 
 * STRICT CONSTRAINTS:
 * - Preserves existing institutional color palette and semantic meanings.
 * - Respects prefers-reduced-motion unconditionally.
 * - Relies strictly on transform, opacity, and GPU-accelerated properties for 60 FPS performance.
 */

import { type Transition, type Variants } from 'motion/react';

// ============================================================================
// 1. MOTION TOKENS: TIMING, EASING & SPRING PHYSICS
// ============================================================================

export const MOTION_DURATIONS = {
  instant: 0.08,
  micro: 0.15,
  snappy: 0.24,
  standard: 0.35,
  deliberate: 0.5,
  cinematic: 0.7,
  slow: 0.95,
} as const;

export const MOTION_EASINGS = {
  // Ultra-smooth deceleration curve inspired by high-end game menus
  cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Snappy tactical UI transition with crisp settle
  tactical: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  // Anticipation curve with subtle overshoot for status badges and alerts
  anticipation: [0.34, 1.25, 0.64, 1] as [number, number, number, number],
  // Swift exit curve
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  // Linear for smooth continuous telemetry indicators
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

export const MOTION_SPRINGS = {
  // High-stiffness tactile feedback for buttons and interactive triggers
  tactile: {
    type: 'spring',
    stiffness: 420,
    damping: 28,
    mass: 0.8,
  } as Transition,
  // Snappy spring for cards, tabs, and dropdown transitions
  snappy: {
    type: 'spring',
    stiffness: 340,
    damping: 26,
    mass: 0.9,
  } as Transition,
  // Gentle fluid spring for modals, drawers, and page content arrival
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 22,
    mass: 1,
  } as Transition,
  // Heavy cinematic spring for primary dashboard heroes and HUD compositions
  heavy: {
    type: 'spring',
    stiffness: 130,
    damping: 18,
    mass: 1.2,
  } as Transition,
} as const;

export const MOTION_STAGGER = {
  tight: 0.04,
  standard: 0.07,
  relaxed: 0.12,
  orchestrated: 0.16,
} as const;

// ============================================================================
// 2. REUSABLE ANIMATION VARIANTS
// ============================================================================

/**
 * Route / Page Transitions
 * Creates layered, cinematic depth between views without flicker or layout jump.
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.deliberate,
      ease: MOTION_EASINGS.cinematic,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: MOTION_DURATIONS.snappy,
      ease: MOTION_EASINGS.exit,
    },
  },
};

export interface StaggerVariantsFunction extends Variants {
  (staggerInterval?: number, delayChildren?: number): Variants;
}

const getStaggerVariants = (staggerInterval: number = MOTION_STAGGER.standard, delayChildren = 0.05): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerInterval,
      delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
});

/**
 * Stagger Container
 * Choreographs sequential reveal of children (cards, list rows, telemetry badges).
 * Can be used directly as a variant object: `variants={staggerContainerVariants}`
 * Or invoked with custom timings: `variants={staggerContainerVariants(0.06)}`
 */
export const staggerContainerVariants: StaggerVariantsFunction = Object.assign(
  (staggerInterval: number = MOTION_STAGGER.standard, delayChildren: number = 0.05): Variants =>
    getStaggerVariants(staggerInterval, delayChildren),
  getStaggerVariants()
);

/**
 * Standard Item Reveal
 * Crisp upward settle with opacity fade
 */
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASINGS.cinematic,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: MOTION_DURATIONS.micro,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Cinematic Headline Mask Reveal
 * Line-by-line reveal for primary landing and hero titles
 */
export const headlineLineVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    rotateX: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: MOTION_DURATIONS.cinematic,
      ease: MOTION_EASINGS.cinematic,
    },
  },
};

/**
 * Tactical Card Hover & Focus Physics
 * Restrained tactile elevation with subtle depth transform
 */
export const hudCardVariants: Variants = {
  idle: {
    y: 0,
    scale: 1,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  hover: {
    y: -3,
    scale: 1.004,
    boxShadow: '0 8px 18px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04)',
    transition: MOTION_SPRINGS.snappy,
  },
  tap: {
    y: 0,
    scale: 0.995,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    transition: MOTION_SPRINGS.tactile,
  },
};

/**
 * Tactile Button Physics
 * Immediate mechanical compression on press with spring recovery
 */
export const tactileButtonVariants: Variants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.015,
    transition: MOTION_SPRINGS.tactile,
  },
  tap: {
    scale: 0.97,
    transition: MOTION_SPRINGS.tactile,
  },
};

/**
 * Accordion / Expandable Disclosure Motion
 * Smooth layout height expansion without harsh clipping
 */
export const accordionContentVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: MOTION_DURATIONS.snappy,
      ease: MOTION_EASINGS.exit,
    },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: MOTION_DURATIONS.deliberate,
      ease: MOTION_EASINGS.cinematic,
    },
  },
};

/**
 * Modal & Overlay Choreography
 */
export const modalBackdropVariants: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(4px)',
    transition: {
      duration: MOTION_DURATIONS.snappy,
      ease: MOTION_EASINGS.cinematic,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: MOTION_DURATIONS.micro,
      ease: MOTION_EASINGS.exit,
    },
  },
};

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MOTION_SPRINGS.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: MOTION_DURATIONS.micro,
      ease: MOTION_EASINGS.exit,
    },
  },
};

/**
 * Sequential Assessment Condition Reveal
 * Used for deterministic rules verification sequence
 */
export const conditionRowVariants = (index: number): Variants => ({
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.06,
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASINGS.cinematic,
    },
  },
});

/**
 * Status Badge Pulse / Beacon
 * Restrained breathing animation for verified institutional status
 */
export const liveBeaconVariants: Variants = {
  pulse: {
    scale: [1, 1.25, 1],
    opacity: [0.9, 0.4, 0.9],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: MOTION_EASINGS.tactical,
    },
  },
};

// ============================================================================
// 3. REDUCED MOTION SAFEGUARDS
// ============================================================================

export const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.micro },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.instant },
  },
};
