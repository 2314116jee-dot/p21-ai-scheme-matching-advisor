import httpx
import io
import pypdf

def save_sample_text(slug):
    url = f"https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/text_data/{slug}.pdf"
    r = httpx.get(url, follow_redirects=True, timeout=30.0)
    reader = pypdf.PdfReader(io.BytesIO(r.content))
    full = "\n".join(page.extract_text() or "" for page in reader.pages)
    with open(f"scripts/{slug}_extracted.txt", "w", encoding="utf-8") as f:
        f.write(full)
    print(f"Saved {len(full)} chars to scripts/{slug}_extracted.txt")

if __name__ == "__main__":
    save_sample_text("25-ciss")
