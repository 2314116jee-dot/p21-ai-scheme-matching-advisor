# P21 | 60-Second Cinematic Product Showcase (4K UHD)

A premium, university-grade cinematic motion graphics showcase for **P21: AI Scheme-Matching Advisor for Indian Entrepreneurs**, created using Remotion.

---

## 1. Video Specifications

- **Duration**: 60 seconds (1,800 frames)
- **Target Resolution**: 4K UHD (3840 × 2160, 16:9) via native 2× render scale
- **Composition Resolution**: 1920 × 1080 (Full HD, 16:9)
- **Frame Rate**: 30 FPS
- **Video Codec**: H.264 (MP4 container)
- **Visual Encoding Quality**: Lossless PNG frame rendering (`Config.setVideoImageFormat("png")`) + CRF 16 (`Config.setCrf(16)`) + `slow` x264 preset for artifact-free gradients and pin-sharp typography
- **Audio Setup**: Single continuous user-supplied MP3 track starting at frame 0, finishing naturally into silence
- **Design Language**: Authentic P21 digital design system (Tricolor institutional accent line, warm parchment `#fcfbf9`, tactical HUD telemetry, verified scheme cataloguing)

---

## 2. Seven Scene Timeline Breakdown

| Scene | Name | Time Range | Frame Range | Duration | Focus |
|---|---|---|---|---|---|
| **Scene 1** | Cinematic Logo Reveal | `0:00` – `0:06` | Frames 0 – 180 | 180 frames (6s) | Luminous slate-900 emblem, Tricolor beam, institutional branding |
| **Scene 2** | The Bureaucratic Dilemma | `0:06` – `0:13` | Frames 180 – 390 | 210 frames (7s) | 3,000+ scattered circulars, hidden disqualifications, unverified aggregator claims |
| **Scene 3** | P21 Platform & Simulator | `0:13` – `0:20` | Frames 390 – 600 | 210 frames (7s) | Hero reveal, 100% deterministic rules, instant eligibility simulator (`SYS.EVAL_LIVE`) |
| **Scene 4** | Entrepreneur Workspace | `0:20` – `0:32` | Frames 600 – 960 | 360 frames (12s) | Dashboard walkthrough, profile completion gauge (85%), explainable scoring formula |
| **Scene 5** | AI Scheme Discovery | `0:32` – `0:44` | Frames 960 – 1320 | 360 frames (12s) | Natural language discovery (`RAG.HYBRID`), grounded gazette synthesis, gemini-2.5-flash |
| **Scene 6** | Eligibility Gap Analysis | `0:44` – `0:53` | Frames 1320 – 1590 | 270 frames (9s) | Roadmaps (`GAP.EVAL`), 88% compatibility, actionable profile gaps, required documents |
| **Scene 7** | Cinematic Brand Closing | `0:53` – `1:00` | Frames 1590 – 1800 | 210 frames (7s) | 3D platform convergence, 111 Central Schemes, authoritative closing call to action |

---

## 3. Workflow Guide (PowerShell)

All commands are executed from the `video` directory:

### Step 1: Verify Audio Track
Place your single continuous MP3 audio file into `video/public/audio/narration.mp3`.

### Step 2: Launch Remotion Studio Preview
Launches the interactive Remotion Studio on `http://localhost:3000` to inspect the visual fidelity, timeline scrubbing, and audio synchronization:
```powershell
npm run dev
```

### Step 3: Render Final 4K MP4 (When Approved)
Renders the complete 60-second video at 4K (3840×2160) with CRF 16 mastering quality:
```powershell
npx remotion render P21Showcase out/p21-showcase-4k.mp4
```
