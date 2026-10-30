import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface SceneTransitionProps {
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  children: React.ReactNode;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  durationInFrames,
  fadeInFrames = 15,
  fadeOutFrames = 15,
  children,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {children}
    </div>
  );
};
