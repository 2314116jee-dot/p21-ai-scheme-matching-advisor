import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { TricolorBeam } from '../components/TricolorBeam';
import { SceneTransition } from '../components/Transitions';

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.opening.duration;

  // Spring physics for emblem arrival
  const emblemSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85, mass: 1 },
  });

  const emblemScale = interpolate(emblemSpring, [0, 1], [0.75, 1]);
  const emblemOpacity = interpolate(emblemSpring, [0, 1], [0, 1]);
  const emblemRotateX = interpolate(emblemSpring, [0, 1], [25, 0]);

  // Text reveals
  const textProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [20, 0]);

  // Subtitle reveal
  const subProgress = spring({
    frame: frame - 65,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1]);
  const subY = interpolate(subProgress, [0, 1], [15, 0]);

  // Subtle background pulse
  const ambientPulse = interpolate(
    Math.sin((frame / 25) * Math.PI),
    [-1, 1],
    [0.15, 0.28]
  );

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={10} fadeOutFrames={15}>
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
        {/* Subtle grid and ambient glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 50% 45%, rgba(15, 118, 110, 0.25) 0%, rgba(9, 13, 22, 0.95) 70%)',
            opacity: ambientPulse + 0.7,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.35,
          }}
        />

        <CinematicCamera
          sceneDuration={duration}
          initialScale={0.94}
          targetScale={1.06}
          initialRotateX={4}
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
            {/* Top Telemetry Beacon */}
            <div
              style={{
                opacity: textOpacity,
                transform: `translateY(${textY}px)`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 16px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontFamily: THEME.fonts.mono,
                fontSize: '13px',
                color: THEME.colors.textLightMuted,
                letterSpacing: '0.08em',
                marginBottom: '40px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: THEME.colors.emeraldLight,
                  boxShadow: `0 0 10px ${THEME.colors.emeraldLight}`,
                }}
              />
              <span>SYS.ACTIVE • VERIFIED CENTRAL GOVERNMENT SCHEME PLATFORM</span>
            </div>

            {/* Emblem and Title Lockup */}
            <div
              style={{
                opacity: emblemOpacity,
                transform: `scale(${emblemScale}) rotateX(${emblemRotateX}deg)`,
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '28px',
              }}
            >
              {/* Monolithic P21 Badge */}
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '22px',
                  backgroundColor: '#0f172a',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow:
                    '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(15, 118, 110, 0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
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

              {/* Sub-Brand Text */}
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

            {/* Indian Institutional Tricolor Line */}
            <div
              style={{
                width: '380px',
                marginBottom: '32px',
                borderRadius: '2px',
                overflow: 'hidden',
                opacity: subOpacity,
              }}
            >
              <TricolorBeam height={5} glow={true} />
            </div>

            {/* High-Fidelity Gazette Grounding Telemetry */}
            <div
              style={{
                opacity: subOpacity,
                transform: `translateY(${subY}px)`,
                display: 'flex',
                gap: '30px',
                fontFamily: THEME.fonts.mono,
                fontSize: '13px',
                color: '#64748b',
                letterSpacing: '0.04em',
              }}
            >
              <span>111 INGESTED SCHEMES</span>
              <span>•</span>
              <span>100% DETERMINISTIC RULES</span>
              <span>•</span>
              <span>OFFICIAL GAZETTE GROUNDING</span>
            </div>
          </div>
        </CinematicCamera>
      </div>
    </SceneTransition>
  );
};
