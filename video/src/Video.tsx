import React from 'react';
import { Series, Audio, staticFile } from 'remotion';
import { THEME } from './styles/theme';

import { OpeningScene } from './scenes/Opening';
import { ProblemScene } from './scenes/Problem';
import { IntroductionScene } from './scenes/Introduction';
import { DashboardScene } from './scenes/Dashboard';
import { DiscoveryScene } from './scenes/Discovery';
import { SchemeDetailsScene } from './scenes/SchemeDetails';
import { ClosingScene } from './scenes/Closing';

export const P21Video: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: THEME.colors.bgBase,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Exactly one continuous audio track starting at frame 0, finishes naturally */}
      <Audio src={staticFile('audio/narration.mp3')} />

      <Series>
        {/* Scene 1: Cinematic P21 Logo Reveal (0–6s, 180 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.opening.duration}>
          <OpeningScene />
        </Series.Sequence>

        {/* Scene 2: The Difficulty of Scheme Discovery (6–13s, 210 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.problem.duration}>
          <ProblemScene />
        </Series.Sequence>

        {/* Scene 3: P21 Platform Introduction & Live Simulator (13–20s, 210 frames) */}
        <Series.Sequence
          durationInFrames={THEME.scenes.introduction.duration}
          style={{
            translate: '-139.9px -94.1px',
          }}
        >
          <IntroductionScene />
        </Series.Sequence>

        {/* Scene 4: Actual Application Dashboard Walkthrough (20–32s, 360 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.dashboard.duration}>
          <DashboardScene />
        </Series.Sequence>

        {/* Scene 5: Actual Scheme Discovery Workflow & Hybrid RAG (32–44s, 360 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.discovery.duration}>
          <DiscoveryScene />
        </Series.Sequence>

        {/* Scene 6: Scheme Information & Deterministic Gap Analysis (44–53s, 270 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.schemeDetails.duration}>
          <SchemeDetailsScene />
        </Series.Sequence>

        {/* Scene 7: Cinematic P21 Brand Closing (53–60s, 210 frames) */}
        <Series.Sequence durationInFrames={THEME.scenes.closing.duration}>
          <ClosingScene />
        </Series.Sequence>
      </Series>
    </div>
  );
};
