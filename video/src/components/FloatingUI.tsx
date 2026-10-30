import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  width?: string | number;
  height?: string | number;
  elevation?: 'sm' | 'md' | 'lg' | 'cinematic';
  dark?: boolean;
  style?: React.CSSProperties;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  delay = 0,
  width = 'auto',
  height = 'auto',
  elevation = 'md',
  dark = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.97, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shadows = {
    sm: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 8px 24px -4px rgba(15,23,42,0.1), 0 3px 8px -2px rgba(15,23,42,0.06)',
    lg: '0 16px 38px -6px rgba(15,23,42,0.15), 0 6px 14px -3px rgba(15,23,42,0.08)',
    cinematic:
      '0 25px 60px -12px rgba(0, 0, 0, 0.28), 0 12px 24px -8px rgba(0, 0, 0, 0.16)',
  };

  return (
    <div
      style={{
        width,
        height,
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        backgroundColor: dark ? THEME.colors.darkSurface : THEME.colors.bgSurface,
        border: `1px solid ${dark ? THEME.colors.darkBorder : THEME.colors.borderMain}`,
        borderRadius: '12px',
        boxShadow: shadows[elevation],
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
