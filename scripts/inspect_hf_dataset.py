import httpx
import json

def inspect():
    url = "https://huggingface.co/api/datasets/shrijayan/gov_myscheme/tree/main/text_data"
    all_items = []
    page = 1
    while url:
        print(f"Fetching page {page}...")
        r = httpx.get(url, timeout=30.0)
        items = r.json()
        all_items.extend(items)
        link = r.headers.get("link", "")
        url = None
        if "rel=\"next\"" in link:
            for part in link.split(","):
                if "rel=\"next\"" in part:
                    url = part.split("<")[1].split(">")[0]
        page += 1

    print(f"Total files in text_data: {len(all_items)}")
    exts = set(x["path"].split(".")[-1] for x in all_items)
    print(f"Extensions: {exts}")
    copies = [x for x in all_items if " copy" in x["path"]]
    print(f"Files with ' copy' in name: {len(copies)}")
    unique_names = set(x["path"].replace(" copy", "") for x in all_items)
    print(f"Unique canonical paths: {len(unique_names)}")
    total_bytes = sum(x.get("size", 0) for x in all_items)
    print(f"Total size of all files: {total_bytes / (1024*1024):.2f} MB")
    
    # Sample a PDF file content
    sample_file = all_items[0]["path"]
    print(f"Sample file: {sample_file}")

if __name__ == "__main__":
    inspect()
