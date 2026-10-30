import httpx
import io
import pypdf

def print_pdf_text(slug):
    url = f"https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/text_data/{slug}.pdf"
    r = httpx.get(url, follow_redirects=True, timeout=30.0)
    reader = pypdf.PdfReader(io.BytesIO(r.content))
    full = "\n".join(page.extract_text() or "" for page in reader.pages)
    print(f"=== {slug} ({len(full)} chars) ===")
    print(full)

if __name__ == "__main__":
    print_pdf_text("25-ciss")
