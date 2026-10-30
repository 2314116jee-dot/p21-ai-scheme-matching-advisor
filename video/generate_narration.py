"""
P21 Showcase Professional Narration Audio Generator
Uses Microsoft Edge Neural TTS (edge-tts) to produce clean, natural,
cinematic documentary-style voice narration for all 7 P21 video scenes.

Script strictly follows the user-approved text.
Pronunciation: "P-Twenty-One" is used in place of "P21" for phonetically accurate TTS delivery.
"""

import asyncio
import os
import sys
import argparse

# Scene definitions strictly matching the 7 P21 showcase scenes
SCENES = [
    {
        "scene_num": 1,
        "name": "Opening",
        "duration_sec": 6.0,
        "text": "Meet P-Twenty-One, a digital advisory platform helping Indian entrepreneurs explore government support schemes."
    },
    {
        "scene_num": 2,
        "name": "Problem",
        "duration_sec": 7.0,
        "text": "Finding the right support can be difficult, with information spread across notifications, eligibility rules, and documents."
    },
    {
        "scene_num": 3,
        "name": "Introduction",
        "duration_sec": 7.0,
        "text": "P-Twenty-One brings scheme discovery and eligibility checks into one place, using structured rules and official sources."
    },
    {
        "scene_num": 4,
        "name": "Dashboard",
        "duration_sec": 12.0,
        "text": "In the entrepreneur workspace, founders can review relevant programmes, compare eligibility conditions, and understand why each scheme may fit."
    },
    {
        "scene_num": 5,
        "name": "Discovery",
        "duration_sec": 12.0,
        "text": "Ask questions in natural language and explore responses supported by scheme information and source citations."
    },
    {
        "scene_num": 6,
        "name": "SchemeDetails",
        "duration_sec": 9.0,
        "text": "The gap analysis highlights missing profile details and documents, helping founders understand the steps still required."
    },
    {
        "scene_num": 7,
        "name": "Closing",
        "duration_sec": 7.0,
        "text": "P-Twenty-One: making government scheme information easier for Indian entrepreneurs to navigate."
    }
]

# Recommended cinematic documentary neural voices
VOICES = {
    "christopher": "en-US-ChristopherNeural",  # Warm, mature, authoritative, documentary-style
    "prabhat": "en-IN-PrabhatNeural",          # Indian English, mature, articulate, professional
    "ryan": "en-GB-RyanNeural",                # British English, calm, precise, documentary
    "guy": "en-US-GuyNeural",                  # American English, clear, professional
}


async def generate_scene_audio(text: str, voice: str, output_path: str, rate: str = "-4%"):
    import edge_tts
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch="+0Hz")
    await communicate.save(output_path)


async def main():
    parser = argparse.ArgumentParser(description="P21 Narration Audio Generator")
    parser.add_argument(
        "--voice",
        choices=list(VOICES.keys()),
        default="christopher",
        help="Voice style: 'christopher' (warm US documentary), 'prabhat' (Indian English professional), 'ryan' (UK documentary)"
    )
    parser.add_argument(
        "--custom-voice",
        type=str,
        default=None,
        help="Specific custom edge-tts voice ID if desired"
    )
    parser.add_argument(
        "--rate",
        type=str,
        default="-4%",
        help="Speaking rate adjustment (default -4%% for calm documentary pacing)"
    )
    args = parser.parse_args()

    try:
        import edge_tts
    except ImportError:
        print("\n[ERROR] 'edge-tts' package is not installed.")
        print("Please install it by running:")
        print("    .\\venv\\Scripts\\pip install edge-tts\n")
        sys.exit(1)

    voice_id = args.custom_voice if args.custom_voice else VOICES[args.voice]

    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "public", "audio"))
    os.makedirs(output_dir, exist_ok=True)

    print("==================================================================")
    print(" P21 CINEMATIC SHOWCASE: NARRATION AUDIO GENERATION")
    print("==================================================================")
    print(f" Voice: {voice_id}")
    print(f" Pacing Rate: {args.rate}")
    print(f" Output Directory: {output_dir}")
    print("------------------------------------------------------------------")

    for scene in SCENES:
        scene_num = scene["scene_num"]
        name = scene["name"]
        max_duration = scene["duration_sec"]
        text = scene["text"]
        out_file = os.path.join(output_dir, f"scene{scene_num}.mp3")

        print(f"Generating Scene {scene_num} ({name}, target ≤ {max_duration}s)...")
        print(f'  Text: "{text}"')

        await generate_scene_audio(text=text, voice=voice_id, output_path=out_file, rate=args.rate)

        file_size = os.path.getsize(out_file)
        print(f"  -> Generated: scene{scene_num}.mp3 ({file_size / 1024:.1f} KB)\n")

    print("==================================================================")
    print(" SUCCESS: All 7 scene narration audio files generated.")
    print(" Audio files are located in: video/public/audio/")
    print("==================================================================")


if __name__ == "__main__":
    asyncio.run(main())
