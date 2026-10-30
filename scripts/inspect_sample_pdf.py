import httpx
import io
import pypdf

def inspect_sample():
    url = "https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/text_data/25-ciss.pdf"
    print(f"Downloading {url}...")
    r = httpx.get(url, follow_redirects=True, timeout=30.0)
    print(f"Downloaded {len(r.content)} bytes, status {r.status_code}")
    
    reader = pypdf.PdfReader(io.BytesIO(r.content))
    print(f"Number of pages: {len(reader.pages)}")
    full_text = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        print(f"--- Page {i+1} ({len(text)} chars) ---")
        print(text[:400])
        full_text.append(text)
    
    combined = "\n".join(full_text)
    print(f"\nTotal characters extracted: {len(combined)}")

if __name__ == "__main__":
    inspect_sample()
