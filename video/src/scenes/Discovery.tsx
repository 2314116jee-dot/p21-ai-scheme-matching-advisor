import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';
import { CinematicCamera } from '../components/CinematicCamera';
import { SceneTransition } from '../components/Transitions';
import { Sparkles, Search, BookOpen, ArrowRight, Zap } from '../components/Icons';

export const DiscoveryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = THEME.scenes.discovery.duration;

  // Typing animation for natural language query
  const fullQuery = "Which Central Government schemes offer subsidies for women-led greenfield manufacturing?";
  const typingChars = Math.min(
    fullQuery.length,
    Math.floor(interpolate(frame, [15, 90], [0, fullQuery.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  );
  const displayedQuery = fullQuery.slice(0, typingChars);

  // Response generation spring
  const responseSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 16, stiffness: 85 },
  });

  const cardsSpring = spring({
    frame: frame - 150,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

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
          targetScale={1.04}
          initialRotateX={2}
          targetRotateX={0}
        >
          <div
            style={{
              width: '1500px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              padding: '30px 0',
              zIndex: 10,
              textAlign: 'left',
            }}
          >
            {/* Header Telemetry Banner */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${THEME.colors.borderMain}`,
                padding: '24px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
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
                  backgroundColor: THEME.colors.saffron,
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={18} color={THEME.colors.saffron} />
                  <span
                    style={{
                      fontFamily: THEME.fonts.mono,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: THEME.colors.saffron,
                      letterSpacing: '0.08em',
                    }}
                  >
                    AUTONOMOUS ADVISORY LAYER • RAG.HYBRID
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
                  AI Scheme Discovery & Advisory Engine
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: THEME.colors.textMuted }}>
                  Natural language inquiries grounded in verified Central Government gazettes with strict zero-hallucination guardrails.
                </p>
              </div>

              {/* Engine Status Pill */}
              <div
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: THEME.colors.bgSubtle,
                  border: `1px solid ${THEME.colors.borderMain}`,
                  fontFamily: THEME.fonts.mono,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
                <span style={{ fontWeight: 700, color: THEME.colors.navyMain }}>gemini-2.5-flash</span>
                <span style={{ color: '#94a3b8' }}>|</span>
                <span style={{ color: THEME.colors.textMuted }}>Latency: 412ms</span>
              </div>
            </div>

            {/* Interactive Query Input Bar */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: `2px solid ${frame > 20 && frame < 110 ? THEME.colors.tealAccent : THEME.colors.borderMain}`,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              }}
            >
              <Search size={22} color={THEME.colors.textMuted} />
              <div
                style={{
                  flex: 1,
                  fontFamily: THEME.fonts.sans,
                  fontSize: '18px',
                  color: THEME.colors.navyMain,
                  fontWeight: 600,
                }}
              >
                {displayedQuery}
                {frame < 100 && (
                  <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: THEME.colors.tealAccent }}>
                    |
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: '10px 22px',
                  borderRadius: '6px',
                  backgroundColor: THEME.colors.navyMain,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={16} color={THEME.colors.saffronLight} />
                <span>Ask Advisor</span>
              </div>
            </div>

            {/* Grounded Advisory Synthesis Panel */}
            <div
              style={{
                opacity: interpolate(responseSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(responseSpring, [0, 1], [25, 0])}px)`,
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${THEME.colors.borderMain}`,
                padding: '28px 36px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {/* Evidence Telemetry Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${THEME.colors.borderLight}`,
                  paddingBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} color={THEME.colors.saffron} />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: THEME.colors.navyMain, fontFamily: THEME.fonts.mono }}>
                    GROUNDED ADVISORY SYNTHESIS
                  </span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      fontFamily: THEME.fonts.mono,
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    EVIDENCE: SUFFICIENT
                  </span>
                </div>

                <div style={{ fontFamily: THEME.fonts.mono, fontSize: '12px', color: THEME.colors.textMuted }}>
                  Index: 111 Ingested Schemes • 5 Cited Gazettes
                </div>
              </div>

              {/* Synthesized Output Body */}
              <div
                style={{
                  backgroundColor: THEME.colors.bgSubtle,
                  borderRadius: '8px',
                  padding: '20px 24px',
                  border: `1px solid ${THEME.colors.borderLight}`,
                  lineHeight: 1.6,
                  fontSize: '15px',
                  color: THEME.colors.textMain,
                }}
              >
                <p style={{ margin: '0 0 10px 0' }}>
                  Based on verified Central Government notifications, a woman entrepreneur launching a greenfield manufacturing venture with ₹25 Lakhs outlay qualifies for:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', color: THEME.colors.textMuted }}>
                  <li>
                    <strong style={{ color: THEME.colors.navyMain }}>PMEGP (MSME):</strong> Special Category Women founders receive a{' '}
                    <strong style={{ color: THEME.colors.emerald }}>35% Margin Money Subsidy (up to ₹8.75 Lakhs)</strong> for rural units and 25% for urban units under the ₹50L manufacturing ceiling.
                  </li>
                  <li style={{ marginTop: '6px' }}>
                    <strong style={{ color: THEME.colors.navyMain }}>Stand-Up India (Finance):</strong> Mandates bank financing between{' '}
                    <strong style={{ color: THEME.colors.navyMain }}>₹10 Lakhs and ₹1 Crore</strong> for greenfield ventures led by women or SC/ST entrepreneurs, covering up to 85% of project cost.
                  </li>
                </ul>
              </div>

              {/* Action Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  opacity: interpolate(cardsSpring, [0, 1], [0, 1]),
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.colors.textMuted, fontFamily: THEME.fonts.mono }}>
                  ACTIONABLE NEXT STEPS:
                </span>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: THEME.colors.navyMain,
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Evaluate PMEGP Gap Analysis</span>
                  <ArrowRight size={14} color="#ffffff" />
                </div>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${THEME.colors.borderMain}`,
                    color: THEME.colors.navyMain,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>View Official KVIC Portal Source</span>
                </div>
              </div>
            </div>
          </div>
        </CinematicCamera>
      </div>
    </SceneTransition>
  );
};
