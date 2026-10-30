import React from 'react';
import { Composition } from 'remotion';
import { P21Video } from './Video';
import { THEME } from './styles/theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="P21Showcase"
        component={P21Video}
        durationInFrames={THEME.timing.totalFrames}
        fps={30}
        width={THEME.timing.width}
        height={THEME.timing.height}
      />
    </>
  );
};
