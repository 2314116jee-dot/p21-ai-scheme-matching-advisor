# P21 Project Design & Architecture Reference

This reference document synthesizes the visual tokens, typography, branding, features, and actual data models of the P21 application for high-fidelity representation in the Remotion cinematic product showcase video.

---

## 1. Brand Identity & Header Emblem

- **Brand Name**: `P21`
- **Sub-Brand / Product Title**: `Scheme Advisor`
- **Tagline / Purpose**: `Central Government Entrepreneur Guidance`
- **Emblem Mark**: 
  - Slate-900 square badge with rounded corners (`rounded`, `bg-slate-900`, `text-white`, `border border-slate-800`), crisp bold capital typography `P21`.
- **Institutional Top Accent Bar**:
  - Tricolor gradient spanning full width: `h-1 bg-gradient-to-r from-amber-600 via-stone-400 to-emerald-700`.
- **System Telemetry Badges**:
  - `SYS.EVAL_LIVE`, `RAG.HYBRID`, `GAP.EVAL`, `CATALOGUE.LIVE`, `AUTHORITATIVE.RECORDS`.

---

## 2. Color Palette & Design Tokens

Derived directly from `frontend/src/index.css` and the Tailwind theme:

| Token Name | Hex Value | Semantic Usage |
|---|---|---|
| `--bg-base` | `#fcfbf9` | Primary warm parchment background canvas |
| `--bg-surface` | `#ffffff` | Elevated cards, dialogs, inputs, panels |
| `--bg-subtle` | `#f5f4ef` | Secondary containers, pill backgrounds |
| `--text-main` | `#18191b` | Primary high-contrast typography |
| `--text-muted` | `#57595e` | Body descriptions, secondary labels |
| `--text-faint` | `#8a8d94` | Footers, subtle timestamps |
| `--border-main` | `#e2e1dc` | Standard component and card borders |
| `--border-light` | `#eceae5` | Hairline dividers, inner sub-borders |
| `--navy-main` | `#132238` | Primary brand dark accent & header hero cards |
| `--navy-hover` | `#0c1726` | Interactive hover states |
| `--teal-accent` | `#0f766e` | Interactive highlights and focus outlines |
| `--teal-subtle` | `#f0fdfa` | Selected state backgrounds |
| `--success-bg` | `#f0fdf4` | Verified status badges, PASS condition rows |
| `--success-border` | `#bbf7d0` | Verified borders |
| `--success-text` | `#166534` | Verified & Eligible text |
| `--warning-bg` | `#fffbeb` | Warning / Missing info callouts |
| `--warning-border` | `#fde68a` | Warning borders |
| `--warning-text` | `#92400e` | Warning & Gap analysis text |
| `--danger-bg` | `#fef2f2` | Disqualification & FAIL badges |
| `--danger-border` | `#fecaca` | Disqualification borders |
| `--danger-text` | `#991b1b` | Disqualification text |

---

## 3. Typography Hierarchy

- **Primary Interface Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Font weights: Medium (500), SemiBold (600), Bold (700), ExtraBold (800).
- **Tactical HUD / Metric Font**: `JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace`
  - Characterized by `font-feature-settings: "tnum" 1` (tabular numbers), `-0.02em` tracking, uppercase telemetry indicators.

---

## 4. Real Central Schemes in the P21 Catalogue

All scheme data showcased in the video must strictly match real verified database records:

1. **Prime Minister's Employment Generation Programme (PMEGP)**
   - *Ministry*: Ministry of Micro, Small and Medium Enterprises / KVIC
   - *Ceiling*: ₹50 Lakhs (Manufacturing), ₹20 Lakhs (Services)
   - *Benefits*: 15%–35% Margin Money Subsidy
   - *Status*: Verified (Cross-verified against Gazette May 2022 guidelines)
2. **Stand-Up India Scheme**
   - *Ministry*: Ministry of Finance / SIDBI
   - *Ceiling*: ₹10 Lakhs to ₹1 Crore composite loan
   - *Target Beneficiaries*: SC, ST, and Women entrepreneurs setting up greenfield enterprises
   - *Status*: Verified
3. **Pradhan Mantri Mudra Yojana (PMMY)**
   - *Ministry*: Ministry of Finance / Department of Financial Services
   - *Ceiling*: Up to ₹20 Lakhs (Shishu up to ₹50K, Kishore ₹50K-₹5L, Tarun ₹5L-₹10L, Tarun Plus up to ₹20L)
   - *Collateral*: Zero collateral requirement
   - *Status*: Verified
4. **Catalogue Statistics**:
   - 111 Ingested Central Schemes
   - 115 Official Gazette & Ministry Sources Cited
   - 120 Structured Deterministic Rules
   - 307 Catalogued Documents

---

## 5. Core Workflows & Featured Screens

### Screen 1: The Entrepreneur's Challenge (Scene 2)
- Fragmented government portals (thousands of confusing circulars, PDF gazettes, ambiguous eligibility criteria, high rejection rates).
- Pain points: Information asymmetry, hidden disqualifications, unverified aggregator claims.

### Screen 2: P21 Landing & Live Simulator (Scene 3)
- Cinematic hero with dual action triggers (`Check Your Eligibility`, `Browse Scheme Catalogue`).
- Credibility metrics: `100% Deterministic Rules`, `₹50L - ₹5Cr Assistance Ceilings`, `Zero Fabricated Claims`.
- Interactive Real-Time Simulator (`SYS.EVAL_LIVE`): Dynamic social category (`Women`, `SC/ST`), stage (`Ideation`), sector (`Manufacturing`), outlay (`₹25 Lakhs`) updating PASS/FAIL in `0.02ms`.

### Screen 3: Entrepreneur Advisory Workspace / Dashboard (Scene 4)
- Personal greeting: `Namaste, Priya Sharma (Aura BioTech Pvt Ltd)`
- Telemetry progress card: `Profile Completion: 85%` with visual meter.
- AI Advisory banner: `Autonomous AI Advisory • RAG.HYBRID`.
- Multi-factor recommendation engine cards showing match scores ($w_e \times 50\% + w_p \times 25\% + w_v \times 15\% + w_{ev} \times 10\%$) with `Strong Match` and `Candidate` badges.

### Screen 4: Real Scheme Discovery & Hybrid RAG Engine (Scene 5)
- Natural language inquiry: *"Which Central Government schemes offer grants or subsidies for women-led greenfield manufacturing?"*
- Grounded Advisory Synthesis with `Evidence: SUFFICIENT`, `Engine: gemini-2.5-flash`, `Latency: 412ms`, `Retrieved: 5 docs`.
- Matched Central Schemes cards with Ministry badges and direct action buttons.

### Screen 5: Scheme Details & Deterministic Gap Analysis (Scene 6)
- Route: `/schemes/pmegp/gap-analysis`
- Header badge: `Deterministic Eligibility Roadmap • GAP.EVAL`
- Overall Result: `PASSED` / `COMPATIBLE (88%)`
- Missing Profile Fields with "Why it matters" rationales and actionable roadmaps.
- Required Document Checklist with verification authorities (UIDAI, KVIC, CA).

### Screen 6: Cinematic Brand Closing (Scene 7)
- P21 brand identity resolve with Indian institutional typography, tricolor accent line, and final authoritative call to action.
