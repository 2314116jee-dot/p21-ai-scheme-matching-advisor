import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { TricolorBeam } from '../components/TricolorBeam';
import { SceneTransition } from '../components/Transitions';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.closing.duration;

  // Cinematic springs
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const textSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const pillarsSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const ctaSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={10}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: THEME.colors.darkBg,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle grid and ambient radiant glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.3) 0%, rgba(9, 13, 22, 0.98) 75%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.3,
          }}
        />

        <CinematicCamera
          sceneDuration={duration}
          initialScale={0.95}
          targetScale={1.05}
          initialRotateX={3}
          targetRotateX={0}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 10,
              maxWidth: '1200px',
              padding: '0 40px',
            }}
          >
            {/* Center Monolithic Brand Emblem */}
            <div
              style={{
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '24px',
                  backgroundColor: '#0f172a',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow:
                    '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(15, 118, 110, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: THEME.fonts.sans,
                  fontWeight: 900,
                  fontSize: '52px',
                  color: '#ffffff',
                  letterSpacing: '-0.04em',
                }}
              >
                P21
              </div>

              <div style={{ textAlign: 'left' }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: THEME.fonts.sans,
                    fontSize: '44px',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Scheme Advisor
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: THEME.fonts.sans,
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    letterSpacing: '0.02em',
                    marginTop: '6px',
                  }}
                >
                  Central Government Entrepreneur Guidance Platform
                </span>
              </div>
            </div>

            {/* Glowing National Tricolor Line */}
            <div
              style={{
                width: '420px',
                marginBottom: '36px',
                borderRadius: '2px',
                overflow: 'hidden',
                opacity: interpolate(textSpring, [0, 1], [0, 1]),
              }}
            >
              <TricolorBeam height={5} glow={true} />
            </div>

            {/* Three Institutional Pillars */}
            <div
              style={{
                opacity: interpolate(pillarsSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(pillarsSpring, [0, 1], [25, 0])}px)`,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                width: '100%',
                maxWidth: '960px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontFamily: THEME.fonts.mono, fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                  111
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                  Central Schemes Catalogued
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontFamily: THEME.fonts.mono, fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                  100%
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                  Deterministic Rule Engine
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontFamily: THEME.fonts.mono, fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                  Zero
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                  Hallucinated Figures
                </div>
              </div>
            </div>

            {/* Authoritative Closing Tagline */}
            <div
              style={{
                opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(ctaSpring, [0, 1], [15, 0])}px)`,
                fontFamily: THEME.fonts.mono,
                fontSize: '15px',
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '0.06em',
              }}
            >
              EMPOWERING INDIAN ENTREPRENEURS • UNIVERSITY-GRADE ADVISORY
            </div>
          </div>
        </CinematicCamera>
      </div>
    </SceneTransition>
  );
};
