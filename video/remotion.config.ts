/**
 * Remotion Configuration for P21 Cinematic Showcase
 * 
 * Optimized for 4K UHD (3840x2160) export via 2x scale, lossless PNG frame
 * capture for pixel-perfect typography, and high-fidelity CRF 16 H.264 encoding.
 * 
 * Reference: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

// Fast Rspack bundling
Config.setRspack(true);

// Lossless frame rendering (avoids JPEG ringing on high-contrast HUD text and vector borders)
Config.setVideoImageFormat("png");

// 2x render scale: 1920x1080 composition scales natively to 3840x2160 (4K UHD)
Config.setScale(2);

// High-fidelity H.264 encoding: CRF 16 with 'slow' preset for clean gradients & sharp text
Config.setCodec("h264");
Config.setCrf(16);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");

Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
