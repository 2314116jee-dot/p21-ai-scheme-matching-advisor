import re
import json

def parse_myscheme_text(raw_text: str, filename: str) -> dict:
    text = raw_text.replace("\t", " ").replace("\u200b", " ")
    
    # Extract title from start
    title_match = re.search(r"^(.*?)(?:Are\s+you\s+sure\s+you\s+want\s+to\s+sign\s+out|CancelSign\s*Out|BackDetails)", text, re.IGNORECASE | re.DOTALL)
    if title_match and title_match.group(1).strip():
        name = re.sub(r"\s+", " ", title_match.group(1)).strip()
    else:
        name = filename.replace(".pdf", "").replace("-", " ").title()

    # The actual content starts after the second occurrence of "Details" or "Introduction:"
    # Notice in the PDF dump, the word "Details" appears in navigation, then in main content: "...DetailsIntroduction:..."
    content_start = text.find("DetailsIntroduction:")
    if content_start == -1:
        content_start = text.find("Details")
        # Find second occurrence if available
        second = text.find("Details", content_start + 7) if content_start != -1 else -1
        if second != -1:
            content_start = second

    body = text[content_start:] if content_start != -1 else text

    # Extract sections using known order:
    # Details -> Benefits -> Eligibility -> (Exclusions / Negative List) -> Application Process -> Documents Required -> FAQs -> Sources
    
    def extract_between(kw_start, kw_ends, source_text):
        pat = rf"(?:{kw_start})\s*(.*?)(?=(?:{'|'.join(kw_ends)})|\Z)"
        m = re.search(pat, source_text, re.IGNORECASE | re.DOTALL)
        if m and m.group(1):
            val = m.group(1).strip()
            # Clean noise
            val = re.sub(r"Something went wrong.*?Ok", "", val, flags=re.DOTALL)
            val = re.sub(r"Was this helpful\?.*", "", val, flags=re.DOTALL)
            val = re.sub(r"Â©\d{4}.*", "", val, flags=re.DOTALL)
            return re.sub(r"\s+", " ", val).strip()
        return ""

    details = extract_between(r"Details(?:Introduction:)?", [r"BenefitsUnder", r"Benefits"], body)
    
    # Substring after Details for Benefits
    body_after_details = body[body.find("Benefits"):] if "Benefits" in body else body
    benefits = extract_between(r"Benefits", [r"EligibilityAny", r"Eligibility"], body_after_details)

    body_after_benefits = body_after_details[body_after_details.find("Eligibility"):] if "Eligibility" in body_after_details else body_after_details
    eligibility = extract_between(r"Eligibility", [r"Negative\s+List", r"Exclusions", r"Application\s+Process"], body_after_benefits)

    exclusions = extract_between(r"(?:Exclusions|Negative\s+List\s+of\s+Activities:?)", [r"Application\s+Process", r"Documents\s+Required", r"Frequently\s+Asked"], body_after_benefits)

    app_process = extract_between(r"Application\s+Process", [r"Documents\s+Required", r"Frequently\s+Asked\s+Questions"], body)

    docs_required = extract_between(r"Documents\s+Required", [r"Frequently\s+Asked\s+Questions", r"Sources\s+And\s+References"], body)

    faqs = extract_between(r"Frequently\s+Asked\s+Questions", [r"Sources\s+And\s+References", r"News\s+and\s+Updates"], body)

    sources = extract_between(r"Sources\s+And\s+References", [r"News\s+and\s+Updates", r"Quick\s+Links", r"Get\s+in\s+touch"], body)

    # State or UT detection
    state_match = re.search(r"Check\s+Eligibility\s*([A-Za-z\s&,-]+?)(?:[A-Z0-9][a-z]|Details|Introduction)", text)
    location_tag = state_match.group(1).strip() if state_match else "Central Government"

    # Central government check
    full_str = (name + " " + details + " " + benefits + " " + eligibility).lower()
    is_central = any(k in full_str for k in [
        "central sector", "centrally sponsored", "government of india", "ministry of",
        "kvic", "sidbi", "nabard", "msme", "dpiit", "cgtmse", "startup india"
    ])

    ministry = "Central Government"
    min_match = re.search(r"(Ministry of [A-Za-z\s,]+?(?=\.|\n|\(|,|Department))", body, re.IGNORECASE)
    if min_match:
        ministry = min_match.group(1).strip()
    elif "msme" in full_str or "micro and small" in full_str:
        ministry = "Ministry of Micro, Small and Medium Enterprises"
    elif not is_central and location_tag not in ["Central Government", "Check"]:
        ministry = f"State Government ({location_tag})"

    dept = location_tag
    faq_dept = re.search(r"(?:implementing\s+(?:department|ministry|agency)[^?]*\?\s*)([^\n.?]+)", faqs, re.IGNORECASE)
    if faq_dept:
        dept = faq_dept.group(1).strip()

    # Documents
    docs_list = []
    if docs_required:
        candidates = re.split(r"(?=[A-Z][a-z0-9\s/()-]+(?:Certificate|Proof|Card|Report|Passbook|Bill|Statement|License|Receipt|Document|Agreement|Bond))", docs_required)
        for dc in candidates:
            d = dc.strip()
            if 5 < len(d) < 160:
                docs_list.append(d)
        if not docs_list:
            docs_list = [docs_required[:120]]

    # URLs
    urls = re.findall(r"https?://[^\s<>\"']+", text)
    official_urls = [u for u in urls if not any(x in u for x in ["myscheme.gov.in", "digitalindia.gov.in", "w3.org"])]
    portal_url = official_urls[0] if official_urls else "https://www.myscheme.gov.in"

    # Derive candidate structured rules from eligibility text
    rules = []
    # 1. Age rule
    age_match = re.search(r"above\s*(\d{2})\s*years", eligibility, re.IGNORECASE) or re.search(r"age\s*(?:of|is|should be)?\s*(?:at least|minimum|above)?\s*(\d{2})", eligibility, re.IGNORECASE)
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

    # 2. Sector rule
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

    # 3. Investment ceiling rule
    inv_match = re.search(r"below\s*(?:â‚¹|₹|Rs\.?)\s*([\d.]+)\s*(Lakhs?|Crores?|L)", eligibility, re.IGNORECASE)
    if inv_match:
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

    return {
        "name": name,
        "ministry": ministry,
        "department": dept,
        "location": location_tag,
        "is_central": is_central,
        "brief_description": (details[:280] + "...") if len(details) > 280 else details or name,
        "detailed_description": details or name,
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

if __name__ == "__main__":
    with open("scripts/25-ciss_extracted.txt", "r", encoding="utf-8") as f:
        sample_text = f.read()
    res = parse_myscheme_text(sample_text, "25-ciss.pdf")
    print(json.dumps(res, indent=2))
