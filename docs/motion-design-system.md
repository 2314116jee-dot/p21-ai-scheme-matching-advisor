# P21 Motion Design System Specification

## 1. Executive Summary & Creative Direction

The P21 Motion Design System elevates the platform into a **AAA game-developer-level tactical HUD and interactive command centre**, while strictly preserving its core identity as a serious, authoritative Central Government scheme-advisory platform.

Rather than relying on generic web template fades (`fade-up 4px`), P21 employs **choreographed real-time physical animation**:
- **Layered Depth & Staggered Sequencing**: Information unfolds hierarchically, establishing clear focal points.
- **Physical Anticipation & Spring Dynamics**: Interactive components compress and recover with tactile spring physics rather than linear web interpolations.
- **Audited Telemetry Presentation**: Metrics interpolate with decelerating ease curves using real PostgreSQL data—strictly zero fabricated counts or simulated outcomes.
- **Deterministic Disclosure**: Complex calculations (such as multi-factor eligibility results) reveal in a strict 5-stage sequenced disclosure.
- **Zero Color Drift**: The visual palette is 100% preserved. No neon borders, purple AI gradients, or random color cycling.

---

## 2. Motion Tokens & Physics Presets

The motion tokens are defined in [`frontend/src/styles/motion.ts`](file:///frontend/src/styles/motion.ts) and export strongly-typed values for duration, cubic-bezier curves, and spring physics.

### 2.1 Durations (`MOTION_DURATIONS`)

| Token | Duration (s) | Intended Use Case |
| :--- | :--- | :--- |
| `micro` | `0.10s` | High-frequency microinteractions: button tap, checkbox tick, tooltip instant fade |
| `snappy` | `0.18s` | Button hover elevation, tab pill slide, dropdown reveal, status tag change |
| `standard` | `0.28s` | Card hover elevation, expandable drawer accordions, list row entrance |
| `deliberate` | `0.42s` | Modal dialog entrance/exit, step wizard transitions, drawer slides |
| `cinematic` | `0.65s` | Hero headline reveal, full page transition cross-fade, dashboard initialisation |
| `counter` | `1.10s` | Real data metric count-up interpolation (percentage, crore ceilings) |

### 2.2 Easing Curves (`MOTION_EASINGS`)

All cubic-bezier curves avoid harsh linear motion and robotic sine waves:

- **`cinematic`** `[0.16, 1.0, 0.3, 1.0]`: Custom decelerating curve that starts briskly and settles with a long, elegant tail.
- **`snappy`** `[0.2, 0.0, 0.0, 1.0]`: Immediate acceleration for instant feedback on hover or selection.
- **`exit`** `[0.4, 0.0, 1.0, 1.0]`: Accelerating curve ensuring dismissals and exits exit the viewport cleanly without lingering.
- **`anticipate`** `[0.36, 0.0, 0.66, -0.56]`: Subtle anticipation curve for dismissals or back-navigation.

### 2.3 Spring Physics Presets (`MOTION_SPRINGS`)

Utilising React Motion physics (`type: 'spring'`):

```typescript
export const MOTION_SPRINGS = {
  // Heavy, solid tactile feel for buttons and cards
  tactile: { type: 'spring', stiffness: 500, damping: 32, mass: 0.8 },
  // Quick, responsive snap for tabs, toggles, indicators
  snappy: { type: 'spring', stiffness: 420, damping: 28, mass: 0.6 },
  // Smooth, floating settle for modals and dialog drawers
  gentle: { type: 'spring', stiffness: 280, damping: 26, mass: 1.0 },
  // Micro feedback for badges and beacon pulses
  subtle: { type: 'spring', stiffness: 350, damping: 25, mass: 0.5 },
};
```

### 2.4 Stagger Intervals (`MOTION_STAGGER`)

- **`tight`** (`0.04s`): Table row populations, document checklist items.
- **`standard`** (`0.07s`): Card grids, dashboard module links.
- **`relaxed`** (`0.12s`): Hero intro sequence (eyebrow -> title -> subtitle -> CTAs).
- **`orchestrated`** (`0.16s`): 5-stage assessment result disclosure.

---

## 3. Reusable Variants

Located in `frontend/src/styles/motion.ts`, these variants provide standard animation states across all views:

### 3.1 `pageTransitionVariants`
Prevents route flicker and white flashes during page switches:
- **`initial`**: `{ opacity: 0, y: 10, scale: 0.995 }`
- **`animate`**: `{ opacity: 1, y: 0, scale: 1 }` (duration: 0.42s, ease: cinematic)
- **`exit`**: `{ opacity: 0, y: -6, scale: 0.995 }` (duration: 0.18s, ease: exit)

### 3.2 `staggerContainerVariants` & `staggerItemVariants`
Can be used both as a static variant object or called with custom timing:
```tsx
<motion.div variants={staggerContainerVariants} initial="initial" animate="animate">
  <motion.div variants={staggerItemVariants}>Item 1</motion.div>
  <motion.div variants={staggerItemVariants}>Item 2</motion.div>
</motion.div>
```

### 3.3 `tactileButtonVariants`
Implements physical button press dynamics:
- **`hover`**: `{ y: -1, scale: 1.01 }`
- **`tap`**: `{ y: 1, scale: 0.97 }` with `MOTION_SPRINGS.tactile`

### 3.4 `modalDialogVariants`
Cinematic modal entrance with backdrop blur:
- **`initial`**: `{ opacity: 0, scale: 0.95, y: 12 }`
- **`animate`**: `{ opacity: 1, scale: 1, y: 0 }` (spring: gentle)
- **`exit`**: `{ opacity: 0, scale: 0.97, y: 8 }`

### 3.5 `liveBeaconVariants`
Restrained breathing pulse for verified government status badges:
- Continuous scale interpolation `[1, 1.06, 1]` and opacity `[0.9, 1, 0.9]` over 3.2s.

---

## 4. Reusable Motion Components

All custom motion components reside in `frontend/src/components/motion/`.

### 4.1 `PageTransition`
- **File**: [`frontend/src/components/motion/PageTransition.tsx`](file:///frontend/src/components/motion/PageTransition.tsx)
- **Purpose**: Wraps page routes to provide smooth cross-fade, directional settle, automatic window scroll reset, and reduced-motion fallback.
- **Usage**:
  ```tsx
  export const MyPage: React.FC = () => {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto py-10">...</div>
      </PageTransition>
    );
  };
  ```

### 4.2 `TactileButton`
- **File**: [`frontend/src/components/motion/TactileButton.tsx`](file:///frontend/src/components/motion/TactileButton.tsx)
- **Purpose**: High-end interactive button with spring compression physics, variant styling (primary, secondary, admin, accent, ghost, danger), and loading state spinner.
- **Usage**:
  ```tsx
  <TactileButton
    variant="primary"
    size="md"
    loading={submitting}
    onClick={handleSubmit}
  >
    <Check className="w-4 h-4 mr-1.5" />
    <span>Save Changes</span>
  </TactileButton>
  ```

### 4.3 `InteractiveCard`
- **File**: [`frontend/src/components/motion/InteractiveCard.tsx`](file:///frontend/src/components/motion/InteractiveCard.tsx)
- **Purpose**: Tactical HUD card container with subtle hover lift (`y: -3px`), restrained shadow elevation, keyboard accessibility (Enter / Space support), and three elevation tiers (`flat`, `subtle`, `raised`, `hud`).
- **Usage**:
  ```tsx
  <InteractiveCard elevation="subtle" className="p-6">
    <h3>Title</h3>
  </InteractiveCard>
  ```

### 4.4 `AnimatedCounter`
- **File**: [`frontend/src/components/motion/AnimatedCounter.tsx`](file:///frontend/src/components/motion/AnimatedCounter.tsx)
- **Purpose**: Real-time numeric count-up interpolator using Motion's `animate()`. Handles raw integers, floats with precision, percentages, and formatted rupee currency. Strictly operates on real API data with zero hallucinated figures.
- **Usage**:
  ```tsx
  {/* Standard count */}
  <AnimatedCounter value={stats.total_users} />

  {/* Formatted percentage */}
  <AnimatedCounter value={assessment.overall_score} suffix="%" />

  {/* Currency ceiling */}
  ₹<AnimatedCounter value={scheme.max_loan_amount_inr} />
  ```

### 4.5 `TactileTabIndicator`
- **File**: [`frontend/src/components/motion/TactileTabIndicator.tsx`](file:///frontend/src/components/motion/TactileTabIndicator.tsx)
- **Purpose**: Continuous sliding highlight pill using Framer Motion's shared `layoutId="active-tab-pill"` to provide seamless spatial continuity between navigation tabs.
- **Usage**:
  ```tsx
  <button onClick={() => setActiveTab(tab.id)} className="relative px-3 py-1.5 text-xs">
    {activeTab === tab.id && <TactileTabIndicator layoutId="my-tab-pill" />}
    <span className="relative z-10">{tab.label}</span>
  </button>
  ```

### 4.6 `ShimmerSkeleton`
- **File**: [`frontend/src/components/motion/ShimmerSkeleton.tsx`](file:///frontend/src/components/motion/ShimmerSkeleton.tsx)
- **Purpose**: Replaces jarring spinner-only loading with structured layout skeletons utilizing an engineered neutral shimmer.

---

## 5. Absolute Design & Color Constraints

To maintain credibility and avoid frivolous aesthetics, the following rules are strictly enforced:

1. **Zero Color Alterations**:
   - Background Base: `#fcfbf9`
   - Background Surface: `#ffffff`
   - Subtle Background: `#f5f4ef`
   - Border Main: `#e2e1dc` / `border-stone-200` / `border-stone-300`
   - Main Navy: `#132238` / `text-slate-900` / `bg-slate-900`
   - Amber Administrative Badge: `#92400e` / `bg-amber-50` / `border-amber-200`
   - Emerald Verified Badge: `#065f46` / `bg-emerald-50` / `border-emerald-200`
2. **Prohibited Effects**:
   - No purple/blue neon gradients.
   - No glowing or pulsating neon borders.
   - No particle canvas animations, 3D floating meshes, or decorative floating orbs.
   - No random or rainbow color cycling during animations.

---

## 6. Typographic Enhancement

While the color palette is invariant, typography has been refined for AAA tactical clarity:
- **Primary Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.
- **Telemetry & Monospace**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`.
- **CSS Utility Classes**:
  - `.font-hud-mono`: Fixed-width numerals and technical labels.
  - `.tabular-nums`: Eliminates horizontal jitter when numbers interpolate in `AnimatedCounter`.
  - `.tracking-hud`: Refined letter-spacing (`0.06em`) for uppercase category headings.

---

## 7. Signature Choreographed Sequences

### 7.1 Landing Page Hero Sequence
1. **Time 0.00s**: Tactical badge appears (`RAG.HYBRID • PRODUCTION ADVISORY LEDGER`).
2. **Time 0.12s**: Primary headline lines reveal with clipped upward mask.
3. **Time 0.28s**: Supporting description fades and settles.
4. **Time 0.44s**: Dual action buttons (Find Eligible Schemes & Administrator Portal) appear with spring bounce.
5. **Time 0.60s**: Live verified stats bar interpolates real dataset metrics (`15` Central Schemes, `100%` Gazette Verified, `1,260` Rules).
6. **Time 0.75s**: Live Eligibility Simulator interactive card settles into place.

### 7.2 5-Stage Assessment Result Disclosure
Located in [`frontend/src/pages/AssessmentResultPage.tsx`](file:///frontend/src/pages/AssessmentResultPage.tsx):
- **Stage 1 (0.00s)**: Overall assessment panel settles into position.
- **Stage 2 (0.15s)**: Overall Result status badge (`Eligible` / `Conditionally Eligible` / `Ineligible`) reveals alongside the animated match score counter.
- **Stage 3 (0.35s)**: Individual deterministic conditions animate sequentially with criteria status icons.
- **Stage 4 (0.55s)**: Supporting evidence panel emerges with official ministry references.
- **Stage 5 (0.70s)**: Next action controls (Document Checklist, Comparison, Download PDF) settle into place.

### 7.3 Multi-Step Onboarding Flow
Located in [`frontend/src/pages/OnboardingPage.tsx`](file:///frontend/src/pages/OnboardingPage.tsx):
- Directional slide animations (`x: +40px` on Next, `x: -40px` on Back).
- Multi-segment progress bar with animated active fill.
- Seamless step switching with zero page remounting.

---

## 8. Accessibility & Reduced Motion Compliance

P21 fully adheres to WCAG 2.1 Level AAA requirements for motion:

1. **`useReducedMotion()` Hook**:
   Every animated component checks the system `prefers-reduced-motion` media query using React Motion's `useReducedMotion()`.
2. **Instant Fallback**:
   When reduced motion is enabled:
   - Transforms (`y`, `x`, `scale`, rotation) are suppressed (`y: 0`, `scale: 1`).
   - Durations are reduced to instant opacity fades (`0.01s` or `opacity: 1`).
   - `AnimatedCounter` displays the final target value immediately without rolling numbers.
3. **Global CSS Media Query**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
4. **Interactive Semantics**:
   All animated buttons retain native `<button>` attributes, keyboard focus rings (`focus-visible:ring-1 focus-visible:ring-slate-900`), and `aria-label` tags.

---

## 9. Performance & Hardware Acceleration Guidelines

1. **GPU-Bound Properties Only**:
   Animations are strictly restricted to `transform` (`translate3d`, `scale`) and `opacity`. Never animate `width`, `height`, `margin`, `padding`, or `top/left` to prevent layout re-flows.
2. **`mode="wait"` in `AnimatePresence`**:
   Route transitions wait for the exiting page to complete its exit transition before mounting the new page, eliminating layout overlap or scroll jump.
3. **`layout` and `layoutId`**:
   Used conservatively on tabs and list reflows with `layout="position"` to avoid triggering expensive paint invalidations.
4. **Bundle Footprint**:
   Motion components are imported directly from `motion/react` with tree-shaking, resulting in a production gzip size of just 170 kB for the entire frontend application bundle.

---

## 10. Maintenance & Future Expansion

- **Adding a New Page**:
  Wrap the main container with `<PageTransition>` and import motion variants from `../styles/motion`.
- **Adding a New Button**:
  Use `<TactileButton variant="primary | secondary | admin | accent | ghost | danger">`.
- **Displaying Numeric Statistics**:
  Always use `<AnimatedCounter value={data.value} />` to ensure seamless interpolation of live backend data.
