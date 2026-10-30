/**
 * Procedural 60-Second Studio-Quality Cinematic Soundtrack Generator
 * 
 * Generates an original, copyright-free 16-bit Stereo 44.1kHz PCM WAV file
 * with dynamic orchestration synchronized to the 7 P21 scenes:
 * 
 * - 0s–6s: Atmospheric sub-bass drone and warm ambient shimmer (Scene 1)
 * - 6s–13s: Tension strings & rhythmic sub-pulse (Scene 2: Problem)
 * - 13s–20s: Warm harmonic piano arpeggios & brass swell (Scene 3: P21 Reveal)
 * - 20s–32s: Driving cinematic rhythm, bassline, and melodic motif (Scene 4: Dashboard)
 * - 32s–44s: High-tech synth pulse, sparkling arpeggios & percussive drive (Scene 5: AI Discovery)
 * - 44s–53s: Full orchestral chords & uplifting brass crescendo (Scene 6: Gap Analysis)
 * - 53s–60s: Resonant cinematic chord tail and pristine sub-bass resolution into silence (Scene 7)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION_SEC = 60;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const NUM_CHANNELS = 2;

// Output buffer (interleaved stereo 16-bit PCM)
const byteLength = TOTAL_SAMPLES * NUM_CHANNELS * 2;
const buffer = Buffer.alloc(44 + byteLength);

// Helper to write WAV header
function writeWavHeader(buf, totalDataBytes) {
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + totalDataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20);  // Format: PCM
  buf.writeUInt16LE(NUM_CHANNELS, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * 2, 28); // Byte rate
  buf.writeUInt16LE(NUM_CHANNELS * 2, 32); // Block align
  buf.writeUInt16LE(16, 34); // Bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(totalDataBytes, 40);
}

writeWavHeader(buffer, byteLength);

// Cinematic frequencies (D minor / F major scale)
const D1 = 36.71;
const D2 = 73.42;
const A2 = 110.0;
const D3 = 146.83;
const F3 = 174.61;
const G3 = 196.0;
const A3 = 220.0;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const A4 = 440.0;

// Reverb / delay buffers
const delayLenL = Math.floor(SAMPLE_RATE * 0.28);
const delayLenR = Math.floor(SAMPLE_RATE * 0.35);
const delayBufL = new Float32Array(delayLenL);
const delayBufR = new Float32Array(delayLenR);
let delayIdxL = 0;
let delayIdxR = 0;

console.log('Synthesizing 60-second cinematic soundtrack (16-bit 44.1kHz Stereo)...');

let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;

  // Scene boundaries
  // Scene 1: 0 - 6s
  // Scene 2: 6 - 13s
  // Scene 3: 13 - 20s
  // Scene 4: 20 - 32s
  // Scene 5: 32 - 44s
  // Scene 6: 44 - 53s
  // Scene 7: 53 - 60s

  let sampleL = 0;
  let sampleR = 0;

  // 1. Foundation Sub-Bass Drone (continuous with gentle filter modulation)
  const droneEnv = t < 55 ? Math.min(1, t / 2) : Math.max(0, (59 - t) / 4);
  const drone = (
    Math.sin(2 * Math.PI * D2 * t) * 0.5 +
    Math.sin(2 * Math.PI * (D1) * t) * 0.35 +
    Math.sin(2 * Math.PI * (A2 + 0.3) * t) * 0.2
  ) * droneEnv;

  sampleL += drone * 0.35;
  sampleR += drone * 0.35;

  // 2. Harmonic Ambient Pad (chords shifting across scenes)
  if (t > 1 && t < 58) {
    let chordRoot = D3;
    let chordThird = F3;
    let chordFifth = A3;

    if (t >= 6 && t < 13) {
      // Darker tension chord (Bb or D dim)
      chordRoot = D3;
      chordThird = F3;
      chordFifth = 207.65; // G# tension
    } else if (t >= 13 && t < 20) {
      // Resolution to uplifting major (F - C - A)
      chordRoot = 174.61; // F3
      chordThird = 220.0;  // A3
      chordFifth = 261.63; // C4
    } else if (t >= 20 && t < 32) {
      // Driving heroic progression (D min -> G min -> Bb -> A)
      const barT = (t - 20) % 8;
      if (barT < 2) { chordRoot = D3; chordThird = F3; chordFifth = A3; }
      else if (barT < 4) { chordRoot = 196.0; chordThird = 233.08; chordFifth = 293.66; } // G min
      else if (barT < 6) { chordRoot = 233.08; chordThird = 293.66; chordFifth = 349.23; } // Bb
      else { chordRoot = 220.0; chordThird = 277.18; chordFifth = 329.63; } // A maj
    } else if (t >= 32 && t < 44) {
      // Tech shimmer progression
      const barT = (t - 32) % 6;
      chordRoot = barT < 3 ? D3 : 233.08;
      chordThird = barT < 3 ? F3 : 293.66;
      chordFifth = barT < 3 ? A3 : 349.23;
    } else if (t >= 44 && t < 53) {
      // Triumphant grand swell
      chordRoot = D3;
      chordThird = F3;
      chordFifth = A3;
    } else if (t >= 53) {
      // Final deep resolution chord
      chordRoot = D2;
      chordThird = F3;
      chordFifth = A3;
    }

    const padDetune = 0.4;
    const padL = (
      Math.sin(2 * Math.PI * chordRoot * t) +
      Math.sin(2 * Math.PI * chordThird * t) * 0.7 +
      Math.sin(2 * Math.PI * chordFifth * t) * 0.6
    ) * 0.12;

    const padR = (
      Math.sin(2 * Math.PI * (chordRoot + padDetune) * t) +
      Math.sin(2 * Math.PI * (chordThird - padDetune) * t) * 0.7 +
      Math.sin(2 * Math.PI * (chordFifth + padDetune) * t) * 0.6
    ) * 0.12;

    const padEnv = t < 54 ? 1 : Math.max(0, (59 - t) / 5);
    sampleL += padL * padEnv;
    sampleR += padR * padEnv;
  }

  // 3. Rhythmic Pulse & Clockwork Ticks (Scene 2 tension: 6s–13s, and Scene 4 & 5: 20s–44s)
  if ((t >= 6 && t < 13) || (t >= 20 && t < 44)) {
    const pulseBpm = 120;
    const pulseSubdiv = (t * (pulseBpm / 60) * 4) % 1; // 16th notes
    const pulseEnv = Math.exp(-pulseSubdiv * 18);
    const pulsePitch = (t >= 6 && t < 13) ? 880 : 440;
    const pulseAudio = Math.sin(2 * Math.PI * pulsePitch * t) * pulseEnv * 0.08;

    sampleL += pulseAudio * 0.8;
    sampleR += pulseAudio * 0.9;

    // Kick/Taiko on downbeats (beats 1 and 3)
    const beat = (t * (pulseBpm / 60)) % 1;
    if (beat < 0.25) {
      const kickEnv = Math.exp(-beat * 24);
      const kickFreq = 110 * Math.exp(-beat * 15);
      const kickAudio = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.35;
      sampleL += kickAudio;
      sampleR += kickAudio;
    }
  }

  // 4. Melodic Bell / Piano Arpeggios (Scene 3, 4, 5, 6: 13s–53s)
  if (t >= 13 && t < 53) {
    const arpBpm = 120;
    const step = Math.floor(t * 4) % 8;
    const arpNotes = [D4, F4, A4, D4 * 2, C4, A4, F4, E4];
    const currentNote = arpNotes[step];
    const notePhase = (t * 4) % 1;
    const noteEnv = Math.exp(-notePhase * 8);
    const bellL = Math.sin(2 * Math.PI * currentNote * t) * noteEnv * 0.14;
    const bellR = Math.sin(2 * Math.PI * (currentNote * 1.002) * t) * noteEnv * 0.14;

    sampleL += bellL;
    sampleR += bellR;
  }

  // 5. Grand Orchestra Climax Swell (Scene 6: 44s–53s)
  if (t >= 44 && t < 53) {
    const swellT = (t - 44) / 9;
    const swellAmp = Math.sin(swellT * Math.PI * 0.5) * 0.25;
    const brass = (
      Math.sin(2 * Math.PI * D3 * t) +
      Math.sin(2 * Math.PI * (D3 * 2) * t) * 0.6 +
      Math.sin(2 * Math.PI * (A3 * 2) * t) * 0.5
    ) * swellAmp;

    sampleL += brass;
    sampleR += brass;
  }

  // 6. Stereo Delay / Reverb Effect
  const wetL = delayBufL[delayIdxL];
  const wetR = delayBufR[delayIdxR];

  delayBufL[delayIdxL] = sampleL + wetR * 0.35;
  delayBufR[delayIdxR] = sampleR + wetL * 0.35;

  delayIdxL = (delayIdxL + 1) % delayLenL;
  delayIdxR = (delayIdxR + 1) % delayLenR;

  sampleL = sampleL * 0.75 + wetL * 0.25;
  sampleR = sampleR * 0.75 + wetR * 0.25;

  // Master Soft Clipping Limiter
  sampleL = Math.tanh(sampleL * 1.25);
  sampleR = Math.tanh(sampleR * 1.25);

  // Global Fade Out at final 1.5 seconds
  if (t > 58.5) {
    const fade = Math.max(0, (60 - t) / 1.5);
    sampleL *= fade;
    sampleR *= fade;
  }

  // Convert float to 16-bit integer
  const intL = Math.max(-32768, Math.min(32767, Math.floor(sampleL * 32767)));
  const intR = Math.max(-32768, Math.min(32767, Math.floor(sampleR * 32767)));

  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
  offset += 4;
}

const outDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'soundtrack.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Soundtrack generated successfully: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
