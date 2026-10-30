import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // milliseconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 650,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const diff = value - startValue;

    // Easing: cubic-out (1 - (1 - t)^3)
    const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + diff * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, shouldReduceMotion]);

  const formattedValue = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span className={`tabular-nums font-hud-mono ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
