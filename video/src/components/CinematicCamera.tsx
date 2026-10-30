import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface CinematicCameraProps {
  children: React.ReactNode;
  sceneDuration: number;
  initialScale?: number;
  targetScale?: number;
  initialRotateX?: number;
  targetRotateX?: number;
  initialRotateY?: number;
  targetRotateY?: number;
  initialTranslateX?: number;
  targetTranslateX?: number;
  initialTranslateY?: number;
  targetTranslateY?: number;
  perspective?: number;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({
  children,
  sceneDuration,
  initialScale = 1,
  targetScale = 1.05,
  initialRotateX = 0,
  targetRotateX = 0,
  initialRotateY = 0,
  targetRotateY = 0,
  initialTranslateX = 0,
  targetTranslateX = 0,
  initialTranslateY = 0,
  targetTranslateY = 0,
  perspective = 1200,
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, sceneDuration], [initialScale, targetScale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotateX = interpolate(frame, [0, sceneDuration], [initialRotateX, targetRotateX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotateY = interpolate(frame, [0, sceneDuration], [initialRotateY, targetRotateY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, sceneDuration], [initialTranslateX, targetTranslateX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, sceneDuration], [initialTranslateY, targetTranslateY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        perspective: `${perspective}px`,
        perspectiveOrigin: '50% 50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
