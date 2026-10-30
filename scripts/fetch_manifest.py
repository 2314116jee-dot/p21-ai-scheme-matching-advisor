import httpx
import json

def sample_dataset_filenames():
    url = "https://huggingface.co/api/datasets/shrijayan/gov_myscheme/tree/main/text_data"
    all_items = []
    while url:
        r = httpx.get(url, timeout=30.0)
        items = r.json()
        all_items.extend(items)
        link = r.headers.get("link", "")
        url = None
        if "rel=\"next\"" in link:
            for part in link.split(","):
                if "rel=\"next\"" in part:
                    url = part.split("<")[1].split(">")[0]

    # Filter out " copy" duplicates
    non_copies = [x for x in all_items if " copy" not in x["path"]]
    print(f"Total non-copy items: {len(non_copies)}")
    
    # Save list of all paths to a JSON manifest
    with open("scripts/hf_dataset_manifest.json", "w", encoding="utf-8") as f:
        json.dump([{"path": x["path"], "size": x.get("size", 0), "oid": x.get("oid")} for x in non_copies], f, indent=2)
    print("Saved manifest to scripts/hf_dataset_manifest.json")
    
    # Show first 30 filenames
    for item in non_copies[:30]:
        print(item["path"], item.get("size"))

if __name__ == "__main__":
    sample_dataset_filenames()
