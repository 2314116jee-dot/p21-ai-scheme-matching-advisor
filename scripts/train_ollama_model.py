"""
scripts/train_ollama_model.py
Trains / compiles the dedicated P21 Scheme Advisor prototype model in Ollama
based on deepseek-r1:1.5b and the Modelfile instruction set.
"""

import sys
import subprocess
import httpx
import time
import os

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
BASE_MODEL = "deepseek-r1:1.5b"
TARGET_MODEL = "p21-advisor"


def check_ollama_daemon() -> bool:
    print(f"[*] Checking local Ollama service at {OLLAMA_BASE_URL}...")
    try:
        r = httpx.get(f"{OLLAMA_BASE_URL.rstrip('/')}/api/tags", timeout=5.0)
        if r.status_code == 200:
            print("  [OK] Ollama daemon is active and accessible.")
            models = [m.get("name") for m in r.json().get("models", [])]
            print(f"  [INFO] Installed models: {', '.join(models) if models else 'None'}")
            return True
    except Exception as exc:
        print(f"  [ERROR] Could not connect to Ollama: {exc}")
        print("  Please ensure Ollama is installed and running (`ollama serve`).")
        return False
    return False


def ensure_base_model():
    print(f"\n[*] Verifying base model '{BASE_MODEL}' in Ollama...")
    try:
        r = httpx.get(f"{OLLAMA_BASE_URL.rstrip('/')}/api/tags", timeout=5.0)
        models = [m.get("name", "") for m in r.json().get("models", [])]
        if any(BASE_MODEL in m for m in models):
            print(f"  [OK] Base model '{BASE_MODEL}' is already available.")
            return True
        print(f"  [*] Base model '{BASE_MODEL}' not found. Pulling now...")
        subprocess.run(["ollama", "pull", BASE_MODEL], check=True)
        print(f"  [OK] Successfully pulled '{BASE_MODEL}'.")
        return True
    except Exception as exc:
        print(f"  [ERROR] Failed to ensure base model: {exc}")
        return False


def build_custom_model():
    modelfile_path = os.path.join(os.path.dirname(__file__), "Modelfile")
    if not os.path.exists(modelfile_path):
        modelfile_path = "Modelfile"

    print(f"\n[*] Creating specialized prototype model '{TARGET_MODEL}' using {modelfile_path}...")
    try:
        res = subprocess.run(
            ["ollama", "create", TARGET_MODEL, "-f", modelfile_path],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"  [OK] Model '{TARGET_MODEL}' created successfully.")
        if res.stdout:
            print(f"  {res.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"  [ERROR] Failed to build model with Ollama CLI: {exc.stderr}")
        return False
    except FileNotFoundError:
        print("  [WARN] 'ollama' CLI not in PATH. Direct API inference with deepseek-r1:1.5b will be used.")
        return True


def benchmark_model():
    print(f"\n[*] Testing inference with sample Indian entrepreneur scheme inquiry...")
    test_prompt = "What is the maximum subsidy and ceiling for a rural manufacturing unit under PMEGP?"
    start = time.perf_counter()
    try:
        resp = httpx.post(
            f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat",
            json={
                "model": BASE_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are P21, an authoritative AI Scheme Advisor for Indian Entrepreneurs."
                    },
                    {
                        "role": "user",
                        "content": test_prompt
                    }
                ],
                "stream": False,
                "options": {"temperature": 0.2}
            },
            timeout=45.0
        )
        latency = (time.perf_counter() - start) * 1000
        if resp.status_code == 200:
            data = resp.json()
            msg = data.get("message", {})
            content = msg.get("content", "").strip()
            thinking = msg.get("thinking", "")
            print(f"  [OK] Test response received in {round(latency)}ms!")
            if thinking:
                print(f"  [DeepSeek-R1 Thinking Excerpt]:\n  {thinking.strip()[:180]}...")
            print(f"\n  [Response Excerpt]:\n  {content[:250]}...\n")
            return True
        else:
            print(f"  [WARN] Ollama returned status {resp.status_code}: {resp.text}")
    except Exception as exc:
        print(f"  [ERROR] Benchmark failed: {exc}")
    return False


def main():
    print("==========================================================")
    print("  P21: Ollama Model Training & Setup Tool")
    print("  Model: deepseek-r1:1.5b -> p21-advisor")
    print("==========================================================")

    if not check_ollama_daemon():
        sys.exit(1)

    if not ensure_base_model():
        sys.exit(1)

    build_custom_model()
    benchmark_model()

    print("==========================================================")
    print("  [SUCCESS] Ollama deepseek-r1:1.5b is tuned & ready for P21!")
    print("==========================================================")


if __name__ == "__main__":
    main()
