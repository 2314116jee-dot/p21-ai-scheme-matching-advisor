import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../styles/theme';

interface TelemetryBadgeProps {
  label: string;
  code?: string;
  statusColor?: string;
  delay?: number;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  label,
  code,
  statusColor = THEME.colors.emerald,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        border: `1px solid ${THEME.colors.borderMain}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        fontFamily: THEME.fonts.mono,
        fontSize: '13px',
        fontWeight: 600,
        color: THEME.colors.textMuted,
        letterSpacing: '0.04em',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusColor,
          boxShadow: `0 0 8px ${statusColor}`,
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
      {code && (
        <span
          style={{
            padding: '2px 6px',
            backgroundColor: THEME.colors.bgSubtle,
            borderRadius: '4px',
            fontSize: '11px',
            color: THEME.colors.textMain,
            border: `1px solid ${THEME.colors.borderLight}`,
          }}
        >
          {code}
        </span>
      )}
    </div>
  );
};

interface MaskedHeadlineProps {
  title: string;
  subtitle?: string;
  delay?: number;
  textColor?: string;
  subtitleColor?: string;
  fontSize?: number;
  subtitleSize?: number;
}

export const MaskedHeadline: React.FC<MaskedHeadlineProps> = ({
  title,
  subtitle,
  delay = 0,
  textColor = THEME.colors.navyMain,
  subtitleColor = THEME.colors.textMuted,
  fontSize = 54,
  subtitleSize = 22,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - (delay + 10),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subtitleY = interpolate(subtitleProgress, [0, 1], [25, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  return (
    <div style={{ textAlign: 'left', maxWidth: '1000px' }}>
      <div style={{ overflow: 'hidden', paddingBottom: '4px' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: THEME.fonts.sans,
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </h1>
      </div>

      {subtitle && (
        <div style={{ overflow: 'hidden', marginTop: '14px' }}>
          <p
            style={{
              margin: 0,
              fontFamily: THEME.fonts.sans,
              fontSize: `${subtitleSize}px`,
              fontWeight: 500,
              color: subtitleColor,
              lineHeight: 1.5,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
