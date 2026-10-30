import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { TricolorBeam } from '../components/TricolorBeam';
import { SceneTransition } from '../components/Transitions';
import { Sparkles } from '../components/Icons';

export const IntroductionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.introduction.duration;

  // Staggered reveals
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const heroSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const cardSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const evalSpring = spring({
    frame: frame - 95,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const cardRotateY = interpolate(cardSpring, [0, 1], [-8, 0]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.93, 1]);

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
        {/* Top Institutional Tricolor Accent Line */}
        <div style={{ width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 30 }}>
          <TricolorBeam height={4} glow={false} />
        </div>

        {/* Global P21 Navigation Header Mockup */}
        <div
          style={{
            width: '100%',
            height: '70px',
            backgroundColor: '#ffffff',
            borderBottom: `1px solid ${THEME.colors.borderMain}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            boxSizing: 'border-box',
            zIndex: 20,
            opacity: interpolate(headerSpring, [0, 1], [0, 1]),
          }}
        >
          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: THEME.colors.navyMain,
                color: '#ffffff',
                fontFamily: THEME.fonts.sans,
                fontWeight: 800,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              P21
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: THEME.colors.textMain,
                  lineHeight: 1.2,
                }}
              >
                Scheme Advisor
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: THEME.colors.textMuted }}>
                Central Government Entrepreneur Guidance
              </span>
            </div>
          </div>

          {/* Navigation Links Mockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: THEME.colors.navyMain, fontWeight: 700 }}>Explore Schemes</span>
            <span style={{ color: THEME.colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color={THEME.colors.saffron} />
              AI Assistant
            </span>
            <span style={{ color: THEME.colors.textMuted }}>Matrix Comparison</span>
            <span style={{ color: THEME.colors.textMuted }}>Document Checklists</span>
          </div>

          {/* Action Button */}
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: THEME.colors.navyMain,
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Check Eligibility
          </div>
        </div>

        <CinematicCamera
          sceneDuration={duration}
          initialScale={0.96}
          targetScale={1.04}
          initialRotateX={2}
          targetRotateX={0}
        >
          <div
            style={{
              width: '1600px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center',
              padding: '40px 0',
              zIndex: 10,
            }}
          >
            {/* Left Hero Column */}
            <div
              style={{
                opacity: interpolate(heroSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(heroSpring, [0, 1], [30, 0])}px)`,
                textAlign: 'left',
              }}
            >
              {/* Telemetry Tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: `1px solid ${THEME.colors.borderMain}`,
                  fontFamily: THEME.fonts.mono,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: THEME.colors.textMuted,
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: THEME.colors.emerald,
                  }}
                />
                <span>Grounded in Official Central Gazette Criteria</span>
              </div>

              <h1
                style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  color: THEME.colors.navyMain,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  margin: '0 0 20px 0',
                }}
              >
                Find Central Government schemes built for your enterprise.
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  color: THEME.colors.textMuted,
                  lineHeight: 1.6,
                  margin: '0 0 35px 0',
                  maxWidth: '680px',
                }}
              >
                P21 evaluates your venture against verified eligibility conditions from MyScheme and Ministry portals with deterministic rules and source-grounded explanations.
              </p>

              {/* Credibility Telemetry Counter Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '24px',
                  paddingTop: '25px',
                  borderTop: `1px solid ${THEME.colors.borderMain}`,
                }}
              >
                <div>
                  <div style={{ fontFamily: THEME.fonts.mono, fontSize: '32px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    100%
                  </div>
                  <div style={{ fontSize: '13px', color: THEME.colors.textMuted, fontWeight: 500 }}>
                    Deterministic Rules
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: THEME.fonts.mono, fontSize: '32px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    ₹50L - ₹5Cr
                  </div>
                  <div style={{ fontSize: '13px', color: THEME.colors.textMuted, fontWeight: 500 }}>
                    Assistance Ceilings
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: THEME.fonts.mono, fontSize: '32px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    Zero
                  </div>
                  <div style={{ fontSize: '13px', color: THEME.colors.textMuted, fontWeight: 500 }}>
                    Fabricated Claims
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tactical Live Evaluator HUD */}
            <div
              style={{
                opacity: interpolate(cardSpring, [0, 1], [0, 1]),
                transform: `scale(${cardScale}) rotateY(${cardRotateY}deg)`,
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: `1px solid ${THEME.colors.borderMain}`,
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0,0,0,0.03)',
                padding: '36px',
                position: 'relative',
                textAlign: 'left',
              }}
            >
              {/* Corner Notch Accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '80px',
                  height: '4px',
                  backgroundColor: THEME.colors.navyMain,
                  borderTopRightRadius: '16px',
                }}
              />

              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  borderBottom: `1px solid ${THEME.colors.borderLight}`,
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: THEME.colors.emerald,
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: THEME.colors.navyMain }}>
                      Instant Eligibility Simulator
                    </h3>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: THEME.colors.textMuted }}>
                    Live deterministic rule engine evaluating official gazette conditions.
                  </p>
                </div>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: THEME.colors.bgSubtle,
                    fontFamily: THEME.fonts.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: THEME.colors.textMain,
                    border: `1px solid ${THEME.colors.borderMain}`,
                  }}
                >
                  SYS.EVAL_LIVE
                </span>
              </div>

              {/* Dynamic Parameter Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '12px 16px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '8px', border: `1px solid ${THEME.colors.borderLight}` }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: THEME.colors.textMuted, marginBottom: '4px' }}>
                    Ownership Category
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: THEME.colors.navyMain }}>
                    Woman Entrepreneur
                  </span>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '8px', border: `1px solid ${THEME.colors.borderLight}` }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: THEME.colors.textMuted, marginBottom: '4px' }}>
                    Business Stage
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: THEME.colors.navyMain }}>
                    Greenfield (Ideation)
                  </span>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '8px', border: `1px solid ${THEME.colors.borderLight}` }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: THEME.colors.textMuted, marginBottom: '4px' }}>
                    Economic Sector
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: THEME.colors.navyMain }}>
                    Manufacturing Unit
                  </span>
                </div>

                <div style={{ padding: '12px 16px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '8px', border: `1px solid ${THEME.colors.borderLight}` }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: THEME.colors.textMuted, marginBottom: '4px' }}>
                    Outlay / Loan Requirement
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: THEME.colors.navyMain, fontFamily: THEME.fonts.mono }}>
                    ₹25,00,000 (25 Lakhs)
                  </span>
                </div>
              </div>

              {/* Live Evaluated Schemes Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: THEME.fonts.mono, color: THEME.colors.textMuted }}>
                  <span style={{ fontWeight: 700 }}>EVALUATED CENTRAL SCHEMES</span>
                  <span>Evaluated in 0.02ms</span>
                </div>

                {/* PMEGP Result */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    backgroundColor: THEME.colors.successBg,
                    border: `1px solid ${THEME.colors.successBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: THEME.colors.navyMain }}>
                        PMEGP Scheme
                      </span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700 }}>
                        Verified
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#14532d', marginTop: '4px', display: 'block' }}>
                      Eligible for 25%–35% Margin Money Subsidy (up to ₹8.75 Lakhs)
                    </span>
                  </div>

                  <div
                    style={{
                      opacity: interpolate(evalSpring, [0, 1], [0, 1]),
                      transform: `scale(${interpolate(evalSpring, [0, 1], [0.8, 1])})`,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      fontFamily: THEME.fonts.mono,
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    PASS
                  </div>
                </div>

                {/* Stand-Up India Result */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    backgroundColor: THEME.colors.successBg,
                    border: `1px solid ${THEME.colors.successBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: THEME.colors.navyMain }}>
                        Stand-Up India Scheme
                      </span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700 }}>
                        Verified
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#14532d', marginTop: '4px', display: 'block' }}>
                      Eligible for Greenfield Bank Loan between ₹10L and ₹1 Crore
                    </span>
                  </div>

                  <div
                    style={{
                      opacity: interpolate(evalSpring, [0, 1], [0, 1]),
                      transform: `scale(${interpolate(evalSpring, [0, 1], [0.8, 1])})`,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      fontFamily: THEME.fonts.mono,
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    PASS
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
