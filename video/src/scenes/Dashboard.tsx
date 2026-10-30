import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { SceneTransition } from '../components/Transitions';
import { Sparkles } from '../components/Icons';

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.dashboard.duration;

  // Staggered springs
  const bannerSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const meterSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const formulaSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const card1Spring = spring({
    frame: frame - 70,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const card2Spring = spring({
    frame: frame - 95,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const card3Spring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const completionPct = Math.round(interpolate(meterSpring, [0, 1], [0, 85]));

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: THEME.colors.bgBase,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: THEME.fonts.sans,
        }}
      >
        <CinematicCamera
          sceneDuration={duration}
          initialScale={0.97}
          targetScale={1.03}
          initialTranslateY={10}
          targetTranslateY={-10}
        >
          <div
            style={{
              width: '1560px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              padding: '30px 0',
              zIndex: 10,
            }}
          >
            {/* Top Workspace Command Banner */}
            <div
              style={{
                opacity: interpolate(bannerSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(bannerSpring, [0, 1], [25, 0])}px)`,
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${THEME.colors.borderMain}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                padding: '28px 36px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: THEME.colors.navyMain,
                }}
              />

              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: THEME.colors.emerald,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: THEME.fonts.mono,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: THEME.colors.textMuted,
                      letterSpacing: '0.06em',
                    }}
                  >
                    ENTREPRENEUR ADVISORY WORKSPACE • SYS.ACTIVE
                  </span>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '32px',
                    fontWeight: 800,
                    color: THEME.colors.navyMain,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Namaste, Priya Sharma
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: THEME.colors.textMuted }}>
                  Demo Venture: <strong>Aura BioTech Pvt Ltd</strong> (Manufacturing • Greenfield • Karnataka)
                </p>
              </div>

              {/* Profile Completion Gauge */}
              <div
                style={{
                  width: '320px',
                  padding: '16px 20px',
                  backgroundColor: THEME.colors.bgSubtle,
                  borderRadius: '10px',
                  border: `1px solid ${THEME.colors.borderLight}`,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontFamily: THEME.fonts.mono,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: THEME.colors.textMuted }}>PROFILE COMPLETION</span>
                  <span style={{ color: THEME.colors.navyMain, fontSize: '16px' }}>{completionPct}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${completionPct}%`,
                      height: '100%',
                      backgroundColor: THEME.colors.emerald,
                      borderRadius: '999px',
                    }}
                  />
                </div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: THEME.colors.textMuted,
                    marginTop: '6px',
                  }}
                >
                  Verified Udyam + Financial Outlay Profile
                </span>
              </div>
            </div>

            {/* Explainable Recommendation Formula Banner */}
            <div
              style={{
                opacity: interpolate(formulaSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(formulaSpring, [0, 1], [20, 0])}px)`,
                backgroundColor: THEME.colors.navyMain,
                borderRadius: '12px',
                padding: '18px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff',
                boxShadow: '0 10px 30px -5px rgba(19, 34, 56, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={22} color={THEME.colors.saffronLight} />
                <div>
                  <span style={{ display: 'block', fontSize: '15px', fontWeight: 700 }}>
                    Transparent Multi-Factor Recommendation Engine
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>
                    Zero black-box AI — deterministic weighting with hard disqualification capping
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontFamily: THEME.fonts.mono,
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  letterSpacing: '0.04em',
                }}
              >
                Score = (We × 50%) + (Wp × 25%) + (Wv × 15%) + (Wev × 10%)
              </div>
            </div>

            {/* 3D Floating Recommendation Scheme Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                textAlign: 'left',
              }}
            >
              {/* Card 1: PMEGP */}
              <div
                style={{
                  opacity: interpolate(card1Spring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card1Spring, [0, 1], [30, 0])}px)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: `1px solid ${THEME.colors.borderMain}`,
                  boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.08)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontFamily: THEME.fonts.mono,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: THEME.colors.saffron,
                      }}
                    >
                      MINISTRY OF MSME • KVIC
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: THEME.colors.successBg,
                        color: THEME.colors.successText,
                        fontSize: '11px',
                        fontWeight: 700,
                        border: `1px solid ${THEME.colors.successBorder}`,
                      }}
                    >
                      Verified
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    Prime Minister&apos;s Employment Generation (PMEGP)
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: THEME.colors.textMuted, lineHeight: 1.5 }}>
                    Credit-linked subsidy supporting new micro-enterprises. Up to 35% margin money subsidy.
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${THEME.colors.borderLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                        RECOMMENDATION MATCH
                      </span>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: THEME.colors.emerald, fontFamily: THEME.fonts.mono }}>
                        92%
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}
                    >
                      Strong Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Stand-Up India */}
              <div
                style={{
                  opacity: interpolate(card2Spring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card2Spring, [0, 1], [30, 0])}px)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: `1px solid ${THEME.colors.borderMain}`,
                  boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.08)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontFamily: THEME.fonts.mono,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: THEME.colors.saffron,
                      }}
                    >
                      MINISTRY OF FINANCE • SIDBI
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: THEME.colors.successBg,
                        color: THEME.colors.successText,
                        fontSize: '11px',
                        fontWeight: 700,
                        border: `1px solid ${THEME.colors.successBorder}`,
                      }}
                    >
                      Verified
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    Stand-Up India Scheme
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: THEME.colors.textMuted, lineHeight: 1.5 }}>
                    Composite bank financing from ₹10 Lakhs to ₹1 Crore for greenfield women entrepreneurs.
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${THEME.colors.borderLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                        RECOMMENDATION MATCH
                      </span>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: THEME.colors.emerald, fontFamily: THEME.fonts.mono }}>
                        88%
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}
                    >
                      Strong Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: MUDRA */}
              <div
                style={{
                  opacity: interpolate(card3Spring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(card3Spring, [0, 1], [30, 0])}px)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: `1px solid ${THEME.colors.borderMain}`,
                  boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.08)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontFamily: THEME.fonts.mono,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: THEME.colors.saffron,
                      }}
                    >
                      MINISTRY OF FINANCE • DFS
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: THEME.colors.successBg,
                        color: THEME.colors.successText,
                        fontSize: '11px',
                        fontWeight: 700,
                        border: `1px solid ${THEME.colors.successBorder}`,
                      }}
                    >
                      Verified
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    Pradhan Mantri MUDRA Yojana (PMMY)
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: THEME.colors.textMuted, lineHeight: 1.5 }}>
                    Collateral-free institutional loans up to ₹20 Lakhs across Shishu, Kishore, and Tarun tiers.
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${THEME.colors.borderLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                        RECOMMENDATION MATCH
                      </span>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: THEME.colors.navyMain, fontFamily: THEME.fonts.mono }}>
                        81%
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: THEME.colors.bgSubtle,
                        color: THEME.colors.navyMain,
                        fontWeight: 700,
                        fontSize: '12px',
                        border: `1px solid ${THEME.colors.borderLight}`,
                      }}
                    >
                      Candidate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CinematicCamera>
      </div>
    </SceneTransition>
  );
};
