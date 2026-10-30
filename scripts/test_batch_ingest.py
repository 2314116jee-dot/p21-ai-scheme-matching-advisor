import os
import json
import httpx
from backend.services.dataset_parser import extract_text_from_pdf, parse_myscheme_content, slugify

def test_batch_ingest(count=15):
    manifest_path = "scripts/hf_dataset_manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    os.makedirs("data/raw_dataset", exist_ok=True)
    
    seen_oids = set()
    unique_items = []
    for item in manifest:
        if item.get("oid") not in seen_oids and " copy" not in item["path"]:
            seen_oids.add(item.get("oid"))
            unique_items.append(item)

    print(f"Total unique non-copy items: {len(unique_items)}")
    batch = unique_items[:count]
    
    results = []
    for i, item in enumerate(batch):
        path = item["path"]
        filename = os.path.basename(path)
        local_pdf_path = os.path.join("data/raw_dataset", filename)
        
        if not os.path.exists(local_pdf_path):
            url = f"https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/{path}"
            r = httpx.get(url, follow_redirects=True, timeout=30.0)
            if r.status_code == 200:
                with open(local_pdf_path, "wb") as f:
                    f.write(r.content)
            else:
                print(f"Failed to download {path}: HTTP {r.status_code}")
                continue

        with open(local_pdf_path, "rb") as f:
            pdf_bytes = f.read()

        raw_text, err = extract_text_from_pdf(pdf_bytes)
        if err:
            print(f"[{i+1}/{count}] Error in {filename}: {err}")
            continue

        parsed = parse_myscheme_content(raw_text, filename)
        code = slugify(parsed["name"])
        results.append({
            "code": code,
            "name": parsed["name"],
            "ministry": parsed["ministry"],
            "is_central": parsed["is_central"],
            "rules_count": len(parsed["rules"]),
            "docs_count": len(parsed["documents_required"]),
            "char_len": len(raw_text)
        })
        print(f"[{i+1}/{count}] OK: '{parsed['name']}' | {parsed['ministry']} | Central: {parsed['is_central']} | Rules: {len(parsed['rules'])}")

    print(f"\nSuccessfully parsed {len(results)} of {count} items.")

if __name__ == "__main__":
    test_batch_ingest(15)
