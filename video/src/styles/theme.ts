/**
 * P21 Cinematic Showcase - Design Tokens and Styles
 * Grounded strictly in the existing P21 digital design system.
 */

export const THEME = {
  colors: {
    // Institutional Canvas & Surfaces
    bgBase: '#fcfbf9',
    bgSurface: '#ffffff',
    bgSubtle: '#f5f4ef',
    bgElevated: '#f9f8f4',

    // Deep Dark Theme / Hero Atmosphere
    darkBg: '#090d16',
    darkSurface: '#0f172a',
    darkCard: '#131e32',
    darkBorder: '#1e293b',

    // Typography
    textMain: '#18191b',
    textMuted: '#57595e',
    textFaint: '#8a8d94',
    textWhite: '#ffffff',
    textLightMuted: '#94a3b8',

    // Primary Brand Navies & Accents
    navyMain: '#132238',
    navyDark: '#0c1726',
    navyHover: '#1e324f',
    tealAccent: '#0f766e',
    tealSubtle: '#f0fdfa',
    tealBorder: '#99f6e4',

    // Indian Institutional Tricolor Accents
    saffron: '#d97706',
    saffronLight: '#f59e0b',
    saffronSubtle: '#fffbeb',
    tricolorWhite: '#ffffff',
    emerald: '#047857',
    emeraldLight: '#10b981',
    emeraldSubtle: '#ecfdf5',

    // Semantic Status Tokens
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    successText: '#166534',

    warningBg: '#fffbeb',
    warningBorder: '#fde68a',
    warningText: '#92400e',

    dangerBg: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerText: '#991b1b',

    // UI Borders
    borderMain: '#e2e1dc',
    borderLight: '#eceae5',
    borderCard: '#e5e7eb',
  },

  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', ui-monospace, SFMono-Regular, monospace",
  },

  timing: {
    fps: 30,
    totalFrames: 1800,
    width: 1920,
    height: 1080,
  },

  scenes: {
    opening: { start: 0, duration: 180 },       // 0–6s
    problem: { start: 180, duration: 210 },     // 6–13s
    introduction: { start: 390, duration: 210 },// 13–20s
    dashboard: { start: 600, duration: 360 },   // 20–32s
    discovery: { start: 960, duration: 360 },   // 32–44s
    schemeDetails: { start: 1320, duration: 270 }, // 44–53s
    closing: { start: 1590, duration: 210 },    // 53–60s
  },
} as const;
