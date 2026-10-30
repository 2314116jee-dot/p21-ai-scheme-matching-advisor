import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { SceneTransition } from '../components/Transitions';
import { AlertTriangle, FileText, XCircle } from '../components/Icons';

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.problem.duration;

  // Staggered springs for bureaucratic obstacle cards
  const card1Progress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const card2Progress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const card3Progress = spring({
    frame: frame - 75,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const stampProgress = spring({
    frame: frame - 110,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const stampScale = interpolate(stampProgress, [0, 1], [2.2, 1]);
  const stampOpacity = interpolate(stampProgress, [0, 1], [0, 1]);

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#070a10',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background chaotic circular grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 60% 40%, rgba(153, 27, 27, 0.18) 0%, rgba(7, 10, 16, 0.95) 75%)',
          }}
        />

        <CinematicCamera
          sceneDuration={duration}
          initialScale={0.96}
          targetScale={1.08}
          initialRotateX={2}
          targetRotateX={-2}
          initialTranslateX={-15}
          targetTranslateX={15}
        >
          <div
            style={{
              width: '1400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            {/* Top Warning Banner */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(153, 27, 27, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontFamily: THEME.fonts.mono,
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '28px',
              }}
            >
              <AlertTriangle size={18} color="#f87171" />
              <span>THE SCHEME DISCOVERY CHALLENGE FOR FOUNDERS</span>
            </div>

            {/* Central Provocation Headline */}
            <h2
              style={{
                fontFamily: THEME.fonts.sans,
                fontSize: '48px',
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                maxWidth: '1000px',
                margin: '0 0 45px 0',
              }}
            >
              Navigating Central Government assistance is buried under bureaucratic complexity.
            </h2>

            {/* 3D Floating Bureaucratic Obstacle Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Card 1: Fragmented Circulars */}
              <div
                style={{
                  opacity: interpolate(card1Progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card1Progress, [0, 1], [40, 0])}px) rotateZ(-1.5deg)`,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} color="#f87171" />
                  </div>
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: '12px', color: '#94a3b8' }}>
                    OBSTACLE 01
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: THEME.fonts.sans,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                  }}
                >
                  3,000+ Fragmented Portals
                </h3>
                <p style={{ fontFamily: THEME.fonts.sans, fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Dozens of ministries issue separate PDF circulars, outdated notifications, and conflicting guidelines.
                </p>
              </div>

              {/* Card 2: Hidden Disqualifications */}
              <div
                style={{
                  opacity: interpolate(card2Progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card2Progress, [0, 1], [40, 0])}px) rotateZ(0.8deg)`,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <XCircle size={20} color="#f87171" />
                  </div>
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: '12px', color: '#94a3b8' }}>
                    OBSTACLE 02
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: THEME.fonts.sans,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                  }}
                >
                  Hidden Disqualifications
                </h3>
                <p style={{ fontFamily: THEME.fonts.sans, fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Hard requirement traps — sector negative lists, project cost caps, and ownership thresholds lead to outright rejections.
                </p>
              </div>

              {/* Card 3: Information Asymmetry */}
              <div
                style={{
                  opacity: interpolate(card3Progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card3Progress, [0, 1], [40, 0])}px) rotateZ(-0.5deg)`,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AlertTriangle size={20} color="#f87171" />
                  </div>
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: '12px', color: '#94a3b8' }}>
                    OBSTACLE 03
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: THEME.fonts.sans,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                  }}
                >
                  Unverified Claims
                </h3>
                <p style={{ fontFamily: THEME.fonts.sans, fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Third-party aggregators list hallucinated figures, missing gazette citations and verifiable scheme criteria.
                </p>
              </div>

              {/* Dynamic Rejection Stamp Overly */}
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '32%',
                  transform: `scale(${stampScale}) rotate(-14deg)`,
                  opacity: stampOpacity,
                  border: '4px solid #ef4444',
                  borderRadius: '10px',
                  padding: '12px 28px',
                  backgroundColor: 'rgba(127, 29, 29, 0.95)',
                  color: '#ffffff',
                  fontFamily: THEME.fonts.mono,
                  fontWeight: 900,
                  fontSize: '22px',
                  letterSpacing: '0.12em',
                  boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                REJECTED: PROFILE MISMATCH
              </div>
            </div>
          </div>
        </CinematicCamera>
      </div>
    </SceneTransition>
  );
};
