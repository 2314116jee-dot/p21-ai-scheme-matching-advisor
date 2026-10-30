import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { SceneTransition } from '../components/Transitions';
import { CheckCircle2, HelpCircle, ShieldCheck } from '../components/Icons';

export const SchemeDetailsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.schemeDetails.duration;

  // Staggered springs
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const scoreSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const passRowsSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const gapSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const docSpring = spring({
    frame: frame - 130,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const compatibilityScore = Math.round(interpolate(scoreSpring, [0, 1], [0, 88]));

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
          initialScale={0.96}
          targetScale={1.03}
          initialTranslateY={10}
          targetTranslateY={-10}
        >
          <div
            style={{
              width: '1520px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              padding: '30px 0',
              zIndex: 10,
              textAlign: 'left',
            }}
          >
            {/* Header Roadmap Banner */}
            <div
              style={{
                opacity: interpolate(headerSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(headerSpring, [0, 1], [25, 0])}px)`,
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${THEME.colors.borderMain}`,
                padding: '28px 36px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={18} color={THEME.colors.emerald} />
                  <span
                    style={{
                      fontFamily: THEME.fonts.mono,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: THEME.colors.emerald,
                      letterSpacing: '0.08em',
                    }}
                  >
                    DETERMINISTIC ELIGIBILITY ROADMAP • GAP.EVAL
                  </span>
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: 800,
                    color: THEME.colors.navyMain,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Eligibility Gap Analysis: PMEGP Scheme
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: THEME.colors.textMuted }}>
                  Targeted analysis revealing passed conditions, profile gaps, and precise next steps to claim maximum subsidies.
                </p>
              </div>

              {/* Compatibility Score Widget */}
              <div
                style={{
                  padding: '16px 28px',
                  backgroundColor: THEME.colors.bgSubtle,
                  borderRadius: '10px',
                  border: `1px solid ${THEME.colors.borderLight}`,
                  textAlign: 'right',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: THEME.fonts.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: THEME.colors.textMuted,
                  }}
                >
                  CALCULATED COMPATIBILITY
                </span>
                <span
                  style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: '36px',
                    fontWeight: 800,
                    color: THEME.colors.navyMain,
                  }}
                >
                  {compatibilityScore}%
                </span>
              </div>
            </div>

            {/* Split Content: Evaluated Rules vs Missing Profile Gaps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column: Passed Deterministic Conditions */}
              <div
                style={{
                  opacity: interpolate(passRowsSpring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(passRowsSpring, [0, 1], [25, 0])}px)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: `1px solid ${THEME.colors.borderMain}`,
                  padding: '28px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: `1px solid ${THEME.colors.borderLight}`,
                    paddingBottom: '14px',
                    marginBottom: '18px',
                  }}
                >
                  <CheckCircle2 size={20} color={THEME.colors.emerald} />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: THEME.colors.navyMain }}>
                    Satisfied Deterministic Criteria (3/3)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: THEME.colors.successBg,
                      border: `1px solid ${THEME.colors.successBorder}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: THEME.colors.navyMain }}>
                        Applicant Type: Aspiring Entrepreneur
                      </span>
                      <span style={{ fontSize: '11px', color: '#166534' }}>Rule code: PMEGP_APPLICANT_TYPE</span>
                    </div>
                    <span style={{ fontFamily: THEME.fonts.mono, fontSize: '11px', fontWeight: 800, color: '#166534' }}>
                      PASS
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: THEME.colors.successBg,
                      border: `1px solid ${THEME.colors.successBorder}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: THEME.colors.navyMain }}>
                        Economic Sector: Manufacturing Unit
                      </span>
                      <span style={{ fontSize: '11px', color: '#166534' }}>Rule code: PMEGP_SECTOR</span>
                    </div>
                    <span style={{ fontFamily: THEME.fonts.mono, fontSize: '11px', fontWeight: 800, color: '#166534' }}>
                      PASS
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: THEME.colors.successBg,
                      border: `1px solid ${THEME.colors.successBorder}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: THEME.colors.navyMain }}>
                        Project Outlay: ₹25 Lakhs ≤ ₹50 Lakhs Ceiling
                      </span>
                      <span style={{ fontSize: '11px', color: '#166534' }}>Rule code: PMEGP_MAX_INVESTMENT</span>
                    </div>
                    <span style={{ fontFamily: THEME.fonts.mono, fontSize: '11px', fontWeight: 800, color: '#166534' }}>
                      PASS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actionable Profile Gap */}
              <div
                style={{
                  opacity: interpolate(gapSpring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(gapSpring, [0, 1], [25, 0])}px)`,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: `1px solid ${THEME.colors.warningBorder}`,
                  padding: '28px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${THEME.colors.borderLight}`,
                    paddingBottom: '14px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={20} color={THEME.colors.warningText} />
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: THEME.colors.navyMain }}>
                      Missing Information In Profile (1)
                    </h3>
                  </div>

                  <span
                    style={{
                      fontFamily: THEME.fonts.mono,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: THEME.colors.warningText,
                    }}
                  >
                    ACTION REQUIRED
                  </span>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: THEME.colors.warningBg,
                    border: `1px solid ${THEME.colors.warningBorder}`,
                    borderRadius: '8px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.colors.warningText }}>
                      Special Category Status Verification
                    </span>
                    <code style={{ fontSize: '11px', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                      ownership_category
                    </code>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
                    Please verify whether your enterprise qualifies under Special Category (Woman, SC/ST, OBC, Rural).
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#92400e', fontStyle: 'italic', fontWeight: 600 }}>
                    Why it matters: Unlocks higher 35% Margin Money Subsidy (₹8.75 Lakhs) instead of 15% General rate.
                  </p>
                </div>

                {/* Document Checklist Snapshot */}
                <div style={{ opacity: interpolate(docSpring, [0, 1], [0, 1]) }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono, marginBottom: '8px' }}>
                    REQUIRED DOCUMENT CHECKLIST:
                  </span>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <div style={{ padding: '6px 12px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '6px', border: `1px solid ${THEME.colors.borderLight}` }}>
                      ✓ Aadhaar (UIDAI)
                    </div>
                    <div style={{ padding: '6px 12px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '6px', border: `1px solid ${THEME.colors.borderLight}` }}>
                      ✓ DPR Project Report (CA)
                    </div>
                    <div style={{ padding: '6px 12px', backgroundColor: THEME.colors.bgSubtle, borderRadius: '6px', border: `1px solid ${THEME.colors.borderLight}` }}>
                      ✓ Caste/Category Cert
                    </div>
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
