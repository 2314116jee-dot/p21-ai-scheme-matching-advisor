import httpx
import json
import io
import pypdf
import re

def test_multiple_samples():
    with open("scripts/hf_dataset_manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    samples = manifest[10:15]
    for s in samples:
        path = s["path"]
        url = f"https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/{path}"
        r = httpx.get(url, follow_redirects=True, timeout=30.0)
        reader = pypdf.PdfReader(io.BytesIO(r.content))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)
        print(f"\n==========================================")
        print(f"PATH: {path} (Pages: {len(reader.pages)}, Chars: {len(text)})")
        print("FIRST 500 CHARS:")
        print(text[:500].replace("\t", " "))

if __name__ == "__main__":
    test_multiple_samples()
