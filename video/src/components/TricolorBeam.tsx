import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { THEME } from '../styles/theme';

interface TricolorBeamProps {
  height?: number;
  width?: string | number;
  animated?: boolean;
  glow?: boolean;
}

export const TricolorBeam: React.FC<TricolorBeamProps> = ({
  height = 4,
  width = '100%',
  animated = true,
  glow = true,
}) => {
  const frame = useCurrentFrame();

  const glowOpacity = animated
    ? interpolate(Math.sin((frame / 30) * Math.PI * 2), [-1, 1], [0.4, 0.85])
    : 0.7;

  return (
    <div
      style={{
        width,
        height: `${height}px`,
        position: 'relative',
        background: `linear-gradient(90deg, ${THEME.colors.saffron} 0%, #cbd5e1 50%, ${THEME.colors.emerald} 100%)`,
        boxShadow: glow
          ? `0 0 16px rgba(217, 119, 6, ${glowOpacity * 0.4}), 0 0 16px rgba(4, 120, 87, ${glowOpacity * 0.4})`
          : 'none',
      }}
    />
  );
};
