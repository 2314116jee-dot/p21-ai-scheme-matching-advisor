"""
P21 Scheme Dataset Parser & Extraction Engine
Extracts structured scheme metadata, benefits, eligibility criteria, rules,
and provenance citations from MyScheme PDF documents.
"""

import re
import io
import hashlib
from typing import Dict, Any, List, Optional, Tuple
import logging

try:
    import pypdf
except ImportError:
    pypdf = None

logger = logging.getLogger("p21.parser")


def slugify(text: str) -> str:
    """Generate a clean URL-friendly unique code slug."""
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text[:80] if text else "scheme-item"


def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract raw text from PDF bytes using pypdf.
    Returns: (extracted_text, error_message)
    """
    if not pdf_bytes or len(pdf_bytes) < 100:
        return None, "File too small or empty"

    if pypdf is None:
        return None, "pypdf library not available"

    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        if len(reader.pages) == 0:
            return None, "PDF has 0 pages"

        pages_text = []
        for i, page in enumerate(reader.pages):
            txt = page.extract_text()
            if txt:
                pages_text.append(txt)

        full_text = "\n".join(pages_text)
        if len(full_text.strip()) < 100:
            return None, "PDF contains negligible text (possible raster scan without OCR)"

        return full_text, None
    except Exception as exc:
        return None, f"PDF extraction failure: {str(exc)}"


def parse_myscheme_content(raw_text: str, filename_hint: str) -> Dict[str, Any]:
    """
    Parse extracted MyScheme PDF text into structured scheme attributes.
    """
    text = raw_text.replace("\t", " ").replace("\u200b", " ")
    text = re.sub(r" +", " ", text)

    # 1. Scheme Title Extraction
    title_match = re.search(
        r"^(.*?)(?:Are\s+you\s+sure\s+you\s+want\s+to\s+sign\s+out|CancelSign\s*Out|BackDetails|Sign\s*In)",
        text,
        re.IGNORECASE | re.DOTALL
    )
    if title_match and title_match.group(1).strip():
        name = re.sub(r"\s+", " ", title_match.group(1)).strip()
    else:
        # Fallback to filename hint
        base_name = filename_hint.replace(".pdf", "").replace("-", " ")
        name = base_name.strip().title()

    # Clean leading/trailing artifacts
    name = re.sub(r"^(?:EngEnglish/हिंदी|English/हिंदी|Sign\s*In|Back|Details)+\s*", "", name).strip()
    if not name or len(name) < 4:
        name = filename_hint.replace(".pdf", "").replace("-", " ").title()

    # 2. Main content boundary
    content_start = text.find("DetailsIntroduction:")
    if content_start == -1:
        content_start = text.find("Details")
        second = text.find("Details", content_start + 7) if content_start != -1 else -1
        if second != -1:
            content_start = second

    body = text[content_start:] if content_start != -1 else text

    # Helper function for bounded regex extraction
    def extract_between(kw_start, kw_ends, source_text):
        pat = rf"(?:{kw_start})\s*(.*?)(?=(?:{'|'.join(kw_ends)})|\Z)"
        m = re.search(pat, source_text, re.IGNORECASE | re.DOTALL)
        if m and m.group(1):
            val = m.group(1).strip()
            # Clean generic portal noise
            val = re.sub(r"Something went wrong.*?Ok", "", val, flags=re.DOTALL)
            val = re.sub(r"Was this helpful\?.*", "", val, flags=re.DOTALL)
            val = re.sub(r"Â©\d{4}.*", "", val, flags=re.DOTALL)
            val = re.sub(r"News and Updates.*", "", val, flags=re.DOTALL)
            return re.sub(r"\s+", " ", val).strip()
        return ""

    details = extract_between(r"Details(?:Introduction:)?", [r"BenefitsUnder", r"Benefits"], body)
    body_after_details = body[body.find("Benefits"):] if "Benefits" in body else body
    benefits = extract_between(r"Benefits", [r"EligibilityAny", r"Eligibility"], body_after_details)

    body_after_benefits = body_after_details[body_after_details.find("Eligibility"):] if "Eligibility" in body_after_details else body_after_details
    eligibility = extract_between(r"Eligibility", [r"Negative\s+List", r"Exclusions", r"Application\s+Process"], body_after_benefits)

    exclusions = extract_between(
        r"(?:Exclusions|Negative\s+List\s+of\s+Activities:?)",
        [r"Application\s+Process", r"Documents\s+Required", r"Frequently\s+Asked"],
        body_after_benefits
    )

    app_process = extract_between(r"Application\s+Process", [r"Documents\s+Required", r"Frequently\s+Asked\s+Questions"], body)
    docs_required = extract_between(r"Documents\s+Required", [r"Frequently\s+Asked\s+Questions", r"Sources\s+And\s+References"], body)
    faqs = extract_between(r"Frequently\s+Asked\s+Questions", [r"Sources\s+And\s+References", r"News\s+and\s+Updates"], body)
    sources = extract_between(r"Sources\s+And\s+References", [r"News\s+and\s+Updates", r"Quick\s+Links", r"Get\s+in\s+touch"], body)

    # 3. State or Location tag
    state_match = re.search(r"Check\s+Eligibility\s*([A-Za-z\s&,-]+?)(?:[A-Z0-9][a-z]|Details|Introduction)", text)
    location_tag = state_match.group(1).strip() if state_match else "Central Government"

    # Known state names
    states_list = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
        "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
        "Ladakh", "Puducherry", "Lakshadweep", "Chandigarh"
    ]
    detected_state = None
    for st in states_list:
        if st.lower() in location_tag.lower():
            detected_state = st
            break

    # Central government check
    full_str = (name + " " + details + " " + benefits + " " + eligibility).lower()
    is_central = any(k in full_str for k in [
        "central sector", "centrally sponsored", "government of india", "ministry of",
        "kvic", "sidbi", "nabard", "msme", "dpiit", "cgtmse", "startup india", "pmmy", "pmegp"
    ]) or (detected_state is None)

    # 4. Ministry / Department
    ministry = "Central Government"
    min_match = re.search(r"(Ministry of [A-Za-z\s,]+?(?=\.|\n|\(|,|Department))", body, re.IGNORECASE)
    if min_match:
        ministry = min_match.group(1).strip()
    elif "msme" in full_str or "micro and small" in full_str:
        ministry = "Ministry of Micro, Small and Medium Enterprises"
    elif "commerce" in full_str or "dpiit" in full_str:
        ministry = "Ministry of Commerce and Industry"
    elif "finance" in full_str or "banking" in full_str or "mudra" in full_str:
        ministry = "Ministry of Finance"
    elif "food processing" in full_str:
        ministry = "Ministry of Food Processing Industries"
    elif "agriculture" in full_str:
        ministry = "Ministry of Agriculture and Farmers Welfare"
    elif not is_central and detected_state:
        ministry = f"State Government ({detected_state})"

    dept = detected_state or "Central Scheme Administration"
    faq_dept = re.search(r"(?:implementing\s+(?:department|ministry|agency)[^?]*\?\s*)([^\n.?]+)", faqs, re.IGNORECASE)
    if faq_dept:
        dept = faq_dept.group(1).strip()

    # 5. Documents list
    docs_list = []
    if docs_required:
        candidates = re.split(
            r"(?=[A-Z][a-z0-9\s/()-]+(?:Certificate|Proof|Card|Report|Passbook|Bill|Statement|License|Receipt|Document|Agreement|Bond))",
            docs_required
        )
        for dc in candidates:
            d = dc.strip()
            if 5 < len(d) < 160:
                docs_list.append(d)
        if not docs_list and len(docs_required) > 5:
            docs_list = [docs_required[:120]]

    # 6. Official Portal URLs
    urls = re.findall(r"https?://[^\s<>\"']+", text)
    official_urls = [
        u for u in urls
        if not any(x in u.lower() for x in ["myscheme.gov.in", "digitalindia.gov.in", "w3.org", "schema.org"])
    ]
    portal_url = official_urls[0] if official_urls else "https://www.myscheme.gov.in"

    # 7. Structured Rules Extraction
    rules = []
    # Age check
    age_match = (
        re.search(r"above\s*(\d{2})\s*years", eligibility, re.IGNORECASE) or
        re.search(r"age\s*(?:of|is|should be)?\s*(?:at least|minimum|above)?\s*(\d{2})", eligibility, re.IGNORECASE)
    )
    if age_match:
        rules.append({
            "rule_code": "MIN_AGE",
            "rule_name": f"Minimum Age ({age_match.group(1)}+ years)",
            "target_field": "applicant_type",
            "operator": "IN",
            "expected_value": ["aspiring_entrepreneur", "individual", "existing_business", "startup", "msme"],
            "is_hard_requirement": True,
            "failure_reason": f"Applicant must be at least {age_match.group(1)} years old.",
            "source_reference": "Extracted from MyScheme Eligibility Criteria"
        })

    # Sector check
    if "manufacturing" in eligibility.lower() and "service" in eligibility.lower():
        rules.append({
            "rule_code": "SECTOR_COVERAGE",
            "rule_name": "Manufacturing or Services Unit",
            "target_field": "sector",
            "operator": "IN",
            "expected_value": ["manufacturing", "services", "food_processing", "textiles_handicrafts", "it_technology"],
            "is_hard_requirement": True,
            "failure_reason": "Enterprise must operate in manufacturing or services sector.",
            "source_reference": "Extracted from MyScheme Guidelines"
        })
    elif "food processing" in eligibility.lower():
        rules.append({
            "rule_code": "SECTOR_FOOD",
            "rule_name": "Food Processing Activity",
            "target_field": "sector",
            "operator": "IN",
            "expected_value": ["food_processing", "agriculture_allied"],
            "is_hard_requirement": True,
            "failure_reason": "Scheme exclusively covers food processing enterprises.",
            "source_reference": "Extracted from MyScheme Guidelines"
        })

    # Investment ceiling
    inv_match = re.search(r"below\s*(?:â‚¹|₹|Rs\.?)\s*([\d.]+)\s*(Lakhs?|Crores?|L)", eligibility, re.IGNORECASE)
    if inv_match:
        try:
            num = float(inv_match.group(1))
            unit = inv_match.group(2).lower()
            cap = int(num * 100000) if "l" in unit else int(num * 10000000)
            rules.append({
                "rule_code": "MAX_INVESTMENT_CAP",
                "rule_name": f"Investment Ceiling (₹{num} {unit.capitalize()})",
                "target_field": "total_investment_inr",
                "operator": "LTE",
                "expected_value": cap,
                "is_hard_requirement": False,
                "failure_reason": f"Total initial project cost exceeds the scheme maximum ceiling of ₹{cap:,}.",
                "source_reference": "Extracted from MyScheme Eligibility Conditions"
            })
        except ValueError:
            pass

    # Fallback general rule if none parsed
    if not rules:
        rules.append({
            "rule_code": "GENERAL_ELIGIBILITY",
            "rule_name": "Scheme Specific Criteria",
            "target_field": "applicant_type",
            "operator": "IN",
            "expected_value": ["aspiring_entrepreneur", "individual", "existing_business", "startup", "msme"],
            "is_hard_requirement": False,
            "failure_reason": "Applicant must satisfy eligibility terms as published on the official portal.",
            "source_reference": portal_url
        })

    brief = (details[:280] + "...") if len(details) > 280 else details or name

    return {
        "name": name,
        "ministry": ministry,
        "department": dept,
        "location": detected_state or "All India",
        "is_central": is_central,
        "brief_description": brief,
        "detailed_description": details or name,
        "target_beneficiaries": eligibility[:300] if eligibility else "Indian entrepreneurs and enterprises",
        "benefits_summary": benefits or "Financial and technical assistance as per scheme guidelines.",
        "eligibility_text": eligibility,
        "exclusions_text": exclusions,
        "application_procedure": app_process or "Apply online through the official portal or designated regional center.",
        "documents_required": docs_list,
        "official_portal_url": portal_url,
        "rules": rules,
        "faqs": faqs[:500] if faqs else "",
        "sources_text": sources,
    }
