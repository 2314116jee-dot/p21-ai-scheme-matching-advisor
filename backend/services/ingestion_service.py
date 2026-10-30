import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from backend.models.scheme import (
    Scheme, SchemeSource, SchemeDocument, SchemeEligibilityRule, SchemeVersion
)
from backend.services.audit_service import record_audit_log

logger = logging.getLogger(__name__)

# Verified central government entrepreneurial schemes catalogue grounded in official notifications
VERIFIED_SCHEMES_CATALOGUE: List[Dict[str, Any]] = [
    {
        "code": "pmegp",
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "ministry": "Ministry of Micro, Small and Medium Enterprises",
        "department": "Khadi and Village Industries Commission (KVIC)",
        "brief_description": "Credit-linked subsidy programme to generate self-employment through micro-enterprise ventures in manufacturing and service sectors.",
        "detailed_description": "PMEGP is a major credit-linked subsidy programme administered by the Ministry of MSME to generate self-employment opportunities across rural and urban India. Beneficiaries can establish micro-enterprises in manufacturing (project cost up to ₹50 Lakhs) and service sectors (project cost up to ₹20 Lakhs). Financial institutions disburse bank loans, while the Government provides margin money subsidy ranging from 15% to 35% based on location and social category.",
        "target_beneficiaries": "Individuals aged 18+, SHGs, Co-operative Societies, Charitable Trusts. Minimum 8th class pass for projects above ₹10 Lakhs in manufacturing and ₹5 Lakhs in service.",
        "benefits_summary": "Margin Money Subsidy: 15% (General Urban), 25% (General Rural / Special Urban), 35% (Special Rural including Women, SC/ST, OBC, Minorities, Ex-servicemen, Divyangjan, NER). Project ceiling: ₹50 Lakhs for Manufacturing, ₹20 Lakhs for Services.",
        "application_procedure": "Online application via KVIC PMEGP e-Portal. Submit project report, identity proof, caste certificate (if applicable), and educational certificates. Application undergoes District Level Task Force Committee (DLTFC) screening and bank loan sanction.",
        "official_portal_url": "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
        "verification_status": "Verified",
        "verification_notes": "Cross-verified against official KVIC guidelines and Gazette notification of Ministry of MSME (May 2022 revised guidelines).",
        "last_checked_date": datetime.datetime(2026, 3, 1),
        "effective_date": datetime.datetime(2008, 8, 15),
        "sources": [
            {
                "source_title": "KVIC Official PMEGP Portal Guidelines",
                "source_url": "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
                "source_type": "official_portal",
                "extracted_passage": "Quantum of Margin Money Subsidy: General Category 15% urban, 25% rural. Special Category (SC/ST/OBC/Minorities/Women/Ex-servicemen/PH/NER) 25% urban, 35% rural. Maximum project cost ₹50 lakh for manufacturing and ₹20 lakh for service sector.",
                "provenance_fact": "Confirmed maximum project ceilings of ₹50L (mfg) and ₹20L (svc) and subsidy bands 15%-35%."
            },
            {
                "source_title": "MyScheme PMEGP Scheme Details",
                "source_url": "https://www.myscheme.gov.in/schemes/pmegp",
                "source_type": "myscheme_page",
                "extracted_passage": "Any individual above 18 years of age is eligible. For setting up of project costing above ₹10 lakh in manufacturing sector and above ₹5 lakh in service sector, the beneficiaries should possess at least VIII standard pass qualification.",
                "provenance_fact": "Confirmed age limit (18+) and 8th standard pass educational condition for large outlays."
            }
        ],
        "documents": [
            {
                "document_name": "Aadhaar Card / Identity Proof",
                "document_category": "identity",
                "is_mandatory": True,
                "issuing_authority": "UIDAI",
                "instructions": "Clear scanned copy of Aadhaar card of the applicant."
            },
            {
                "document_name": "Detailed Project Report (DPR)",
                "document_category": "project_report",
                "is_mandatory": True,
                "issuing_authority": "Self / Chartered Accountant / Technical Consultant",
                "instructions": "Comprehensive project report detailing capital expenditure, working capital, raw material sources, and projected cash flows."
            },
            {
                "document_name": "Special Category / Caste Certificate",
                "document_category": "caste_category",
                "is_mandatory": False,
                "issuing_authority": "Competent Revenue Authority (Tahsildar / Sub-Divisional Magistrate)",
                "instructions": "Mandatory only if claiming higher subsidy (25%-35%) under SC, ST, OBC, Minority, or Ex-servicemen category."
            },
            {
                "document_name": "Educational Qualification Certificate (8th Pass+)",
                "document_category": "educational",
                "is_mandatory": True,
                "issuing_authority": "Recognized School Board",
                "instructions": "Required for manufacturing projects above ₹10L and service projects above ₹5L."
            },
            {
                "document_name": "Rural Area Certificate",
                "document_category": "address_proof",
                "is_mandatory": False,
                "issuing_authority": "Gram Panchayat / Block Development Officer",
                "instructions": "Required to claim higher rural margin money subsidy."
            }
        ],
        "rules": [
            {
                "rule_code": "PMEGP_APPLICANT_TYPE",
                "rule_name": "Eligible Applicant Type",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["aspiring_entrepreneur", "individual", "existing_business", "startup", "msme"],
                "is_hard_requirement": True,
                "failure_reason": "Applicant type is ineligible. PMEGP supports individual entrepreneurs, aspiring founders, and MSMEs.",
                "source_reference": "KVIC PMEGP Operational Guidelines Clause 3.1"
            },
            {
                "rule_code": "PMEGP_SECTOR",
                "rule_name": "Eligible Economic Sector",
                "target_field": "sector",
                "operator": "IN",
                "expected_value": ["manufacturing", "services", "textiles_handicrafts", "food_processing", "healthcare", "it_technology"],
                "is_hard_requirement": True,
                "failure_reason": "PMEGP covers manufacturing and service enterprises. Direct crop farming and excluded negative list trades are ineligible.",
                "source_reference": "KVIC PMEGP Negative List & Eligible Activities"
            },
            {
                "rule_code": "PMEGP_MAX_INVESTMENT",
                "rule_name": "Project Cost Ceiling (₹50 Lakhs)",
                "target_field": "total_investment_inr",
                "operator": "LTE",
                "expected_value": 5000000,
                "is_hard_requirement": True,
                "failure_reason": "Total initial investment exceeds the PMEGP ceiling of ₹50,00,000.",
                "source_reference": "Ministry of MSME Notification No. PMEGP/Policy/2022"
            }
        ]
    },
    {
        "code": "stand-up-india",
        "name": "Stand-Up India Scheme",
        "ministry": "Ministry of Finance",
        "department": "Department of Financial Services / SIDBI",
        "brief_description": "Bank financing between ₹10 Lakhs and ₹1 Crore for greenfield enterprises set up by SC, ST, or Women entrepreneurs.",
        "detailed_description": "The Stand-Up India Scheme facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise. The enterprise may be in manufacturing, services, agri-allied activities, or the trading sector. In case of non-individual enterprises, at least 51% of the shareholding and controlling stake must be held by an SC/ST or woman entrepreneur.",
        "target_beneficiaries": "SC, ST, and Women entrepreneurs above 18 years establishing first-time ventures (Greenfield enterprises).",
        "benefits_summary": "Composite loan (term loan and working capital) between ₹10 Lakhs and ₹1 Crore covering up to 85% of project cost. Repayable in 7 years with a moratorium period of up to 18 months.",
        "application_procedure": "Apply online at standupmitra.in portal or directly at any scheduled commercial bank branch. SIDBI Handholding agencies assist borrowers with project preparation and loan processing.",
        "official_portal_url": "https://www.standupmitra.in/",
        "verification_status": "Verified",
        "verification_notes": "Verified against Stand-Up India guidelines issued by Department of Financial Services, Ministry of Finance.",
        "last_checked_date": datetime.datetime(2026, 3, 5),
        "effective_date": datetime.datetime(2016, 4, 5),
        "sources": [
            {
                "source_title": "Stand-Up India Official Portal Guidelines",
                "source_url": "https://www.standupmitra.in/",
                "source_type": "official_portal",
                "extracted_passage": "The objective is to facilitate bank loans between ₹10 lakh and ₹100 lakh to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, agri-allied activities or trading.",
                "provenance_fact": "Confirmed loan limits (₹10L to ₹1Cr), beneficiary eligibility (SC, ST, Women), and greenfield criterion."
            },
            {
                "source_title": "MyScheme Stand-Up India Record",
                "source_url": "https://www.myscheme.gov.in/schemes/suis",
                "source_type": "myscheme_page",
                "extracted_passage": "In case of non-individual enterprises, 51% of the shareholding and controlling stake should be held by either SC/ST and/or Women Entrepreneur.",
                "provenance_fact": "Verified non-individual 51% ownership requirement."
            }
        ],
        "documents": [
            {
                "document_name": "Proof of Identity (Aadhaar / Voter ID / Passport)",
                "document_category": "identity",
                "is_mandatory": True,
                "issuing_authority": "Government of India",
                "instructions": "Valid government-issued identity proof."
            },
            {
                "document_name": "Caste Certificate (for SC/ST Applicants)",
                "document_category": "caste_category",
                "is_mandatory": False,
                "issuing_authority": "Authorized Revenue Authority",
                "instructions": "Mandatory for SC or ST applicants; not required for general woman entrepreneurs."
            },
            {
                "document_name": "Business Entity Registration / Incorporation Certificate",
                "document_category": "business_proof",
                "is_mandatory": False,
                "issuing_authority": "MCA / Registrar of Firms / Udyam",
                "instructions": "Required if applying as a Partnership, LLP, or Private Limited Company."
            },
            {
                "document_name": "Detailed Project Report with Financial Projections",
                "document_category": "project_report",
                "is_mandatory": True,
                "issuing_authority": "Self / CA / Consultant",
                "instructions": "Financial projections for 7 years including balance sheet, P&L, and debt service coverage ratio (DSCR)."
            }
        ],
        "rules": [
            {
                "rule_code": "SUI_BENEFICIARY_CATEGORY",
                "rule_name": "Target Category (Women or SC/ST)",
                "target_field": "ownership_category",
                "operator": "IN",
                "expected_value": ["women", "sc_st"],
                "is_hard_requirement": True,
                "failure_reason": "Stand-Up India is strictly reserved for Women or SC/ST entrepreneurs. General male entrepreneurs are ineligible.",
                "source_reference": "Stand-Up India Guidelines Section 2"
            },
            {
                "rule_code": "SUI_BUSINESS_STAGE",
                "rule_name": "Greenfield Enterprise (New Venture)",
                "target_field": "business_stage",
                "operator": "IN",
                "expected_value": ["ideation", "prototype", "early_stage"],
                "is_hard_requirement": True,
                "failure_reason": "Stand-Up India mandates a 'greenfield' venture (first-time venture). Existing operational units expanding cannot apply.",
                "source_reference": "DFS Stand-Up India Circular Section 1.2"
            },
            {
                "rule_code": "SUI_MAX_INVESTMENT",
                "rule_name": "Loan Upper Limit (₹1 Crore)",
                "target_field": "total_investment_inr",
                "operator": "LTE",
                "expected_value": 10000000,
                "is_hard_requirement": False,
                "failure_reason": "Total investment requirement exceeds Stand-Up India maximum assistance of ₹1,00,00,000.",
                "source_reference": "Stand-Up India Loan Limits"
            }
        ]
    },
    {
        "code": "pmmy-mudra",
        "name": "Pradhan Mantri Mudra Yojana (PMMY)",
        "ministry": "Ministry of Finance",
        "department": "Department of Financial Services",
        "brief_description": "Collateral-free institutional loans up to ₹20 Lakhs for micro and small non-corporate, non-farm enterprises.",
        "detailed_description": "PMMY provides collateral-free loans to micro and small enterprises across three sub-schemes: Shishu (loans up to ₹50,000), Kishore (loans between ₹50,000 and ₹5 Lakhs), Tarun (loans between ₹5 Lakhs and ₹10 Lakhs), and Tarun Plus (up to ₹20 Lakhs for entrepreneurs who have successfully repaid previous Tarun loans). Loans are disbursed by Member Lending Institutions (MLIs) including Public and Private Banks, Regional Rural Banks, Small Finance Banks, and NBFCs.",
        "target_beneficiaries": "Non-Corporate Small Business Segment (NCSB) comprising proprietorship/partnership firms running small manufacturing units, service sector units, shopkeepers, fruit/vegetable vendors, truck operators, food-service units, repair shops, machine operators, small industries, food processors and other rural/urban micro-enterprises.",
        "benefits_summary": "Zero collateral requirement. Low interest rates linked to MCLR. Repayment period up to 5 years. Loan sizes: Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L), Tarun Plus (up to ₹20L).",
        "application_procedure": "Apply via Udyamimitra portal (udyamimitra.in) or submit standard MUDRA loan application form to any participating bank, NBFC, or Micro Finance Institution.",
        "official_portal_url": "https://www.mudra.org.in/",
        "verification_status": "Verified",
        "verification_notes": "Verified against MUDRA official guidelines and Union Budget enhanced limits for Tarun Plus.",
        "last_checked_date": datetime.datetime(2026, 3, 10),
        "effective_date": datetime.datetime(2015, 4, 8),
        "sources": [
            {
                "source_title": "MUDRA Official Guidelines",
                "source_url": "https://www.mudra.org.in/",
                "source_type": "official_portal",
                "extracted_passage": "MUDRA loans are designed to bring non-corporate small business enterprises into formal banking. Loans are given without collateral for amounts up to ₹10 Lakhs under Shishu, Kishore and Tarun categories.",
                "provenance_fact": "Confirmed collateral-free nature and 3-tier loan structure."
            },
            {
                "source_title": "MyScheme PMMY Details",
                "source_url": "https://www.myscheme.gov.in/schemes/pmmy",
                "source_type": "myscheme_page",
                "extracted_passage": "Eligible for all non-farm micro and small enterprises engaged in manufacturing, trading and service activities.",
                "provenance_fact": "Verified sector eligibility covering non-farm MSEs."
            }
        ],
        "documents": [
            {
                "document_name": "Identity Proof (Voter ID / Aadhaar / PAN / Passport)",
                "document_category": "identity",
                "is_mandatory": True,
                "issuing_authority": "Government of India",
                "instructions": "Standard photo identity document."
            },
            {
                "document_name": "Proof of Residence",
                "document_category": "address_proof",
                "is_mandatory": True,
                "issuing_authority": "Competent Authority / Utility Provider",
                "instructions": "Recent electricity bill, telephone bill, or voter ID."
            },
            {
                "document_name": "Quotation for Machinery / Equipment",
                "document_category": "financial",
                "is_mandatory": False,
                "issuing_authority": "Equipment Supplier",
                "instructions": "Required if loan is requested for equipment or machinery purchase."
            },
            {
                "document_name": "Bank Statement (Last 6 Months)",
                "document_category": "financial",
                "is_mandatory": False,
                "issuing_authority": "Applicant's Bank",
                "instructions": "Required for Kishore and Tarun loans; not required for initial Shishu loans."
            }
        ],
        "rules": [
            {
                "rule_code": "PMMY_APPLICANT_TYPE",
                "rule_name": "Eligible Micro/Small Business",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["aspiring_entrepreneur", "individual", "existing_business", "startup", "msme"],
                "is_hard_requirement": True,
                "failure_reason": "PMMY is meant for micro and small enterprises and individual proprietors.",
                "source_reference": "MUDRA Scheme Architecture"
            },
            {
                "rule_code": "PMMY_SECTOR",
                "rule_name": "Non-Farm Economic Activity",
                "target_field": "sector",
                "operator": "NOT_IN",
                "expected_value": ["direct_farming"],
                "is_hard_requirement": True,
                "failure_reason": "Direct agricultural crop farming is excluded (handled by KCC). Agri-allied, manufacturing, retail, and services are eligible.",
                "source_reference": "DFS PMMY Eligible Activities"
            },
            {
                "rule_code": "PMMY_MAX_LOAN",
                "rule_name": "Loan Ceiling (₹20 Lakhs)",
                "target_field": "total_investment_inr",
                "operator": "LTE",
                "expected_value": 2000000,
                "is_hard_requirement": False,
                "failure_reason": "Total investment exceeds MUDRA maximum ceiling of ₹20,00,000.",
                "source_reference": "Union Budget Enhanced PMMY Limit"
            }
        ]
    },
    {
        "code": "cgtmse-champions",
        "name": "Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)",
        "ministry": "Ministry of Micro, Small and Medium Enterprises",
        "department": "SIDBI & Ministry of MSME",
        "brief_description": "Third-party credit guarantee cover up to ₹5 Crore for collateral-free credit extended to Micro and Small Enterprises.",
        "detailed_description": "CGTMSE was set up by the Ministry of MSME and Small Industries Development Bank of India (SIDBI) to provide institutional credit guarantee support. Under the scheme, commercial banks and financial institutions provide collateral-free term loans and working capital facilities to viable new and existing micro and small enterprises, with CGTMSE providing guarantee coverage between 75% and 85% of the sanctioned facility.",
        "target_beneficiaries": "New and existing Micro and Small Enterprises (MSEs) holding valid Udyam Registration.",
        "benefits_summary": "Collateral-free credit facility up to ₹500 Lakhs (₹5 Crore). Guarantee cover up to 85% for micro enterprises (up to ₹5 Lakhs) and women-operated/SC/ST enterprises, and 75% for others. Concessional annual guarantee fees.",
        "application_procedure": "Approach any scheduled commercial bank or member lending institution with Udyam registration and business project proposal. The bank evaluates creditworthiness and applies directly to CGTMSE for guarantee coverage.",
        "official_portal_url": "https://www.cgtmse.in/",
        "verification_status": "Verified",
        "verification_notes": "Verified against CGTMSE circulars and revised limits announced by Ministry of MSME (ceiling upgraded to ₹5 Crore).",
        "last_checked_date": datetime.datetime(2026, 3, 12),
        "effective_date": datetime.datetime(2000, 8, 30),
        "sources": [
            {
                "source_title": "CGTMSE Official Portal Scheme Features",
                "source_url": "https://www.cgtmse.in/",
                "source_type": "official_portal",
                "extracted_passage": "Credit facility eligible for guarantee coverage is up to ₹500 Lakh per borrower. Both new and existing Micro and Small Enterprises are eligible.",
                "provenance_fact": "Confirmed maximum guarantee limit of ₹5 Crore per MSE borrower."
            },
            {
                "source_title": "MSME Champions Portal Guidelines",
                "source_url": "https://champions.gov.in/",
                "source_type": "official_portal",
                "extracted_passage": "Udyam Registration is mandatory for availing benefits under Credit Guarantee Scheme. Retail trade is now covered under MSE guarantee.",
                "provenance_fact": "Confirmed mandatory Udyam registration requirement."
            }
        ],
        "documents": [
            {
                "document_name": "Udyam Registration Certificate",
                "document_category": "business_proof",
                "is_mandatory": True,
                "issuing_authority": "Ministry of MSME (udyamregistration.gov.in)",
                "instructions": "Valid digital certificate containing 16-digit Udyam Registration Number."
            },
            {
                "document_name": "Audited Financial Statements / Income Tax Returns (Last 2 Years)",
                "document_category": "financial",
                "is_mandatory": False,
                "issuing_authority": "Chartered Accountant / ITD",
                "instructions": "Required for existing operational business seeking credit expansion."
            },
            {
                "document_name": "Project Appraisal & Cash Flow Forecast",
                "document_category": "project_report",
                "is_mandatory": True,
                "issuing_authority": "Applicant / Project Consultant",
                "instructions": "Detailed project report outlining debt service viability."
            }
        ],
        "rules": [
            {
                "rule_code": "CGTMSE_REGISTRATION",
                "rule_name": "Mandatory Udyam Registration",
                "target_field": "registration_status",
                "operator": "IN",
                "expected_value": ["udyam_registered", "pvt_ltd", "llp"],
                "is_hard_requirement": True,
                "failure_reason": "CGTMSE mandates formal enterprise recognition via Udyam Registration.",
                "source_reference": "Ministry of MSME Circular CGTMSE/2021"
            },
            {
                "rule_code": "CGTMSE_APPLICANT_TYPE",
                "rule_name": "Micro or Small Enterprise Classification",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["msme", "existing_business", "startup"],
                "is_hard_requirement": True,
                "failure_reason": "Applicant must be a recognized Micro or Small Enterprise. Medium enterprises and unorganized informal units are ineligible.",
                "source_reference": "CGTMSE Operations Manual Clause 2"
            },
            {
                "rule_code": "CGTMSE_MAX_INVESTMENT",
                "rule_name": "Assistance Limit (₹5 Crore)",
                "target_field": "total_investment_inr",
                "operator": "LTE",
                "expected_value": 50000000,
                "is_hard_requirement": False,
                "failure_reason": "Requested credit requirement exceeds the CGTMSE single-borrower ceiling of ₹5,00,00,000.",
                "source_reference": "CGTMSE Gazette Revision 2023"
            }
        ]
    },
    {
        "code": "sisfs-seed-fund",
        "name": "Startup India Seed Fund Scheme (SISFS)",
        "ministry": "Ministry of Commerce and Industry",
        "department": "Department for Promotion of Industry and Internal Trade (DPIIT)",
        "brief_description": "Financial assistance up to ₹50 Lakhs to early-stage DPIIT-recognized startups for proof of concept, prototype, product trials, and market entry.",
        "detailed_description": "The Startup India Seed Fund Scheme (SISFS) was created by DPIIT to address early-stage capital shortage faced by Indian tech and innovation startups. Under SISFS, DPIIT allocates funds to selected incubators across India, which in turn evaluate startups and sanction grants up to ₹20 Lakhs for Proof of Concept, prototype development, or product trials, and convertible debentures/debt up to ₹50 Lakhs for market entry, commercialization, and scaling.",
        "target_beneficiaries": "DPIIT-recognized startups incorporated not more than 2 years prior to application date, with viable technology-driven or innovative business concepts.",
        "benefits_summary": "Up to ₹20 Lakhs as grant for validation of Proof of Concept or prototype development. Up to ₹50 Lakhs as investment through convertible debentures or debt-linked instruments for commercialization. Mentorship through approved incubators.",
        "application_procedure": "Apply online at seedfund.startupindia.gov.in. Startups select up to 3 preferred partner incubators, submit pitch deck, prototype status and financial breakdown. Incubator Seed Management Committees (ISMC) interview shortlisted applicants.",
        "official_portal_url": "https://seedfund.startupindia.gov.in/",
        "verification_status": "Verified",
        "verification_notes": "Verified against SISFS guidelines published by DPIIT, Ministry of Commerce and Industry.",
        "last_checked_date": datetime.datetime(2026, 3, 15),
        "effective_date": datetime.datetime(2021, 4, 1),
        "sources": [
            {
                "source_title": "DPIIT SISFS Official Guidelines",
                "source_url": "https://seedfund.startupindia.gov.in/",
                "source_type": "official_portal",
                "extracted_passage": "A startup recognized by DPIIT, incorporated not more than 2 years ago at the time of application. Startup must have a business idea to develop a product or service with market fit, viable commercialization, and scope of scaling.",
                "provenance_fact": "Confirmed 2-year age restriction, mandatory DPIIT recognition, and funding brackets (₹20L grant, ₹50L debt)."
            },
            {
                "source_title": "MyScheme SISFS Overview",
                "source_url": "https://www.myscheme.gov.in/schemes/sisfs",
                "source_type": "myscheme_page",
                "extracted_passage": "Startups should not have received more than ₹10 lakh of monetary support under any other Central or State Government scheme (excluding prize money).",
                "provenance_fact": "Confirmed exclusion rule regarding prior state/central support over ₹10 Lakhs."
            }
        ],
        "documents": [
            {
                "document_name": "DPIIT Startup Recognition Certificate",
                "document_category": "business_proof",
                "is_mandatory": True,
                "issuing_authority": "DPIIT (startupindia.gov.in)",
                "instructions": "Valid certificate of recognition with DIPP number."
            },
            {
                "document_name": "Certificate of Incorporation / Partnership Deed",
                "document_category": "business_proof",
                "is_mandatory": True,
                "issuing_authority": "Ministry of Corporate Affairs (MCA)",
                "instructions": "Private Limited Company or LLP incorporation certificate dated within 2 years."
            },
            {
                "document_name": "Pitch Deck & Product Demonstration",
                "document_category": "project_report",
                "is_mandatory": True,
                "issuing_authority": "Founding Team",
                "instructions": "Slide deck detailing problem statement, solution, target market, competitive advantage, and fund utilization roadmap."
            }
        ],
        "rules": [
            {
                "rule_code": "SISFS_APPLICANT_TYPE",
                "rule_name": "Startup Classification",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["startup", "aspiring_entrepreneur"],
                "is_hard_requirement": True,
                "failure_reason": "SISFS exclusively funds innovative startups recognized by DPIIT.",
                "source_reference": "SISFS Eligibility Criteria Clause 4"
            },
            {
                "rule_code": "SISFS_REGISTRATION",
                "rule_name": "Startup India / MCA Registration",
                "target_field": "registration_status",
                "operator": "IN",
                "expected_value": ["startup_india_recognized", "pvt_ltd", "llp"],
                "is_hard_requirement": True,
                "failure_reason": "Startup must be incorporated as Private Limited or LLP and hold or be eligible for DPIIT recognition.",
                "source_reference": "DPIIT Startup Recognition Order 2019"
            },
            {
                "rule_code": "SISFS_BUSINESS_AGE",
                "rule_name": "Incorporation Age Under 24 Months",
                "target_field": "business_age_months",
                "operator": "LTE",
                "expected_value": 24,
                "is_hard_requirement": True,
                "failure_reason": "Enterprise age exceeds 24 months. SISFS only admits startups incorporated within the last 2 years.",
                "source_reference": "SISFS Guidelines Section 4.1(a)"
            },
            {
                "rule_code": "SISFS_STAGE",
                "rule_name": "Early-Stage Innovation",
                "target_field": "business_stage",
                "operator": "IN",
                "expected_value": ["ideation", "prototype", "early_stage"],
                "is_hard_requirement": True,
                "failure_reason": "SISFS is dedicated to early validation and prototyping stages. Mature scaling ventures are ineligible.",
                "source_reference": "SISFS Core Mandate"
            }
        ]
    },
    {
        "code": "pm-vishwakarma",
        "name": "PM Vishwakarma Scheme",
        "ministry": "Ministry of Micro, Small and Medium Enterprises",
        "department": "MSME, Skill Development & Entrepreneurship, and DFS",
        "brief_description": "Comprehensive institutional support, modern toolkit grant of ₹15,000, and subsidized loans up to ₹3 Lakhs for traditional artisans and craftspeople.",
        "detailed_description": "PM Vishwakarma is a Central Sector Scheme designed to support traditional artisans and craftspeople across India who work with their hands and tools. Covered trades include carpenters, boat makers, blacksmiths, locksmiths, potters, sculptors, cobblers, masons, basket weavers, doll & toy makers, barbers, garland makers, washermen, tailors, and fishing net makers. Benefits include digital verification and issuance of PM Vishwakarma Certificate & ID card, 5-7 days basic skilling with ₹500/day stipend, modern toolkit incentive of ₹15,000, and enterprise credit up to ₹3 Lakhs at a concessional interest rate of 5%.",
        "target_beneficiaries": "Artisans and craftspeople engaged in one of the 18 specified traditional family-based trades, aged 18+, with one beneficiary per household.",
        "benefits_summary": "Recognition via PM Vishwakarma Certificate & ID. Skill training with ₹500 daily stipend. Toolkit grant of ₹15,000. Collateral-free enterprise credit: 1st tranche up to ₹1 Lakh (repayable in 18 months), 2nd tranche up to ₹2 Lakhs (repayable in 30 months) at 5% interest.",
        "application_procedure": "Enrolment through Common Services Centres (CSCs). Three-tier verification: Gram Panchayat / Urban Local Body screening, District Implementation Committee (DIC) scrutiny, and National Steering Committee approval.",
        "official_portal_url": "https://pmvishwakarma.gov.in/",
        "verification_status": "Verified",
        "verification_notes": "Cross-verified against official PM Vishwakarma Operational Guidelines approved by Cabinet Committee on Economic Affairs (CCEA).",
        "last_checked_date": datetime.datetime(2026, 3, 16),
        "effective_date": datetime.datetime(2023, 9, 17),
        "sources": [
            {
                "source_title": "PM Vishwakarma Scheme Portal",
                "source_url": "https://pmvishwakarma.gov.in/",
                "source_type": "official_portal",
                "extracted_passage": "An artisan or craftsperson working with hands and tools and engaged in one of the 18 family-based traditional trades mentioned in scheme guidelines. Age not less than 18 years.",
                "provenance_fact": "Confirmed list of 18 trades, minimum age (18), and family one-member restriction."
            },
            {
                "source_title": "Cabinet Notification - PM Vishwakarma Financial Outlay",
                "source_url": "https://www.myscheme.gov.in/schemes/pm-vishwakarma",
                "source_type": "myscheme_page",
                "extracted_passage": "Toolkit incentive of ₹15,000 in form of e-voucher. Concessional credit support: 1st tranche ₹1,00,000, 2nd tranche ₹2,00,000 at concessional interest rate of 5% with subvention.",
                "provenance_fact": "Verified ₹15,000 toolkit voucher and loan tranches (₹1L + ₹2L @ 5%)."
            }
        ],
        "documents": [
            {
                "document_name": "Aadhaar Card (Biometric-linked)",
                "document_category": "identity",
                "is_mandatory": True,
                "issuing_authority": "UIDAI",
                "instructions": "Biometric authentication conducted at Common Services Centre (CSC)."
            },
            {
                "document_name": "Active Bank Account Passbook",
                "document_category": "financial",
                "is_mandatory": True,
                "issuing_authority": "Commercial Bank / Post Office",
                "instructions": "Bank account linked with Aadhaar for direct benefit transfer (DBT) of stipend and toolkit grant."
            },
            {
                "document_name": "Ration Card / Family Proof",
                "document_category": "address_proof",
                "is_mandatory": True,
                "issuing_authority": "Food & Civil Supplies Department",
                "instructions": "Required to confirm single-member benefit entitlement per family unit."
            }
        ],
        "rules": [
            {
                "rule_code": "VISHWAKARMA_SECTOR",
                "rule_name": "Traditional Artisanship / Handicrafts Sector",
                "target_field": "sector",
                "operator": "IN",
                "expected_value": ["textiles_handicrafts", "manufacturing", "services", "other"],
                "is_hard_requirement": True,
                "failure_reason": "PM Vishwakarma applies exclusively to artisans and craftspeople engaged in the 18 designated traditional trades.",
                "source_reference": "PM Vishwakarma List of 18 Covered Trades"
            },
            {
                "rule_code": "VISHWAKARMA_APPLICANT_TYPE",
                "rule_name": "Individual Artisan / Aspiring Entrepreneur",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["individual", "aspiring_entrepreneur", "msme"],
                "is_hard_requirement": True,
                "failure_reason": "Beneficiary must be an individual craftsperson or family enterprise.",
                "source_reference": "PM Vishwakarma Guidelines Section 3"
            }
        ]
    }
]


CANDIDATE_SCHEMES_CATALOGUE: List[Dict[str, Any]] = [
    {
        "code": "pmfme-food",
        "name": "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
        "ministry": "Ministry of Food Processing Industries",
        "department": "National Institute of Food Technology Entrepreneurship and Management",
        "brief_description": "Centrally sponsored scheme providing credit-linked subsidy up to ₹10 Lakhs for upgrading unorganized micro food processing enterprises.",
        "detailed_description": "PMFME is aimed at enhancing the competitiveness of existing individual micro-enterprises in the unorganized segment of the food processing industry and promote formalization of the sector. The scheme adopts One District One Product (ODOP) approach to reap benefits of scale in terms of procurement of inputs, common services, and marketing of products.",
        "target_beneficiaries": "Individual and group micro food processing enterprises, FPOs, SHGs, and Producer Co-operatives.",
        "benefits_summary": "Credit-linked capital subsidy @ 35% of the eligible project cost with a maximum ceiling of ₹10 Lakh per unit. Seed capital of ₹40,000 per SHG member for working capital.",
        "application_procedure": "Online application on PMFME portal with District Resource Person (DRP) facilitation.",
        "official_portal_url": "https://pmfme.mofpi.gov.in/",
        "verification_status": "Candidate",
        "verification_notes": "Imported from MyScheme repository under Apache-2.0 license. Requires official officer review before verification.",
        "last_checked_date": datetime.datetime(2026, 3, 1),
        "sources": [
            {
                "source_title": "MyScheme HuggingFace Dataset Record (shrijayan/gov_myscheme)",
                "source_url": "https://huggingface.co/datasets/shrijayan/gov_myscheme",
                "source_type": "myscheme_page",
                "extracted_passage": "Centrally Sponsored Scheme to enhance competitiveness of individual micro food processing enterprises with 35% capital subsidy up to ₹10 Lakhs.",
                "provenance_fact": "Imported as Candidate with Apache 2.0 dataset provenance."
            }
        ],
        "documents": [
            {
                "document_name": "Food Safety and Standards Authority of India (FSSAI) License/Registration",
                "document_category": "business_proof",
                "is_mandatory": True,
                "issuing_authority": "FSSAI",
                "instructions": "Valid FSSAI food business license or basic registration receipt."
            },
            {
                "document_name": "Electricity Bill of Processing Unit",
                "document_category": "address_proof",
                "is_mandatory": True,
                "issuing_authority": "State DISCOM",
                "instructions": "Proof of ownership or rental lease of operational food processing facility."
            }
        ],
        "rules": [
            {
                "rule_code": "PMFME_SECTOR",
                "rule_name": "Food Processing Sector Activity",
                "target_field": "sector",
                "operator": "IN",
                "expected_value": ["food_processing", "agriculture_allied", "manufacturing"],
                "is_hard_requirement": True,
                "failure_reason": "PMFME exclusively funds food processing and agro-processing micro units.",
                "source_reference": "MoFPI PMFME Scheme Guidelines Clause 2.3"
            }
        ]
    },
    {
        "code": "aspire-innovation",
        "name": "ASPIRE - A Scheme for Promotion of Innovation, Rural Industries & Entrepreneurship",
        "ministry": "Ministry of Micro, Small and Medium Enterprises",
        "department": "National Small Industries Corporation (NSIC)",
        "brief_description": "Promotes innovation and rural agro-business entrepreneurship through Livelihood Business Incubators (LBIs) and Technology Business Incubators (TBIs).",
        "detailed_description": "ASPIRE was launched to set up a network of technology centers and incubation centers to accelerate entrepreneurship and promote start-ups for innovation in the agro-industry. It supports financial assistance to setting up LBI and TBI centers as well as fund-of-funds managed by SIDBI for rural startups.",
        "target_beneficiaries": "Aspiring entrepreneurs, rural youths, and agro-business innovators.",
        "benefits_summary": "Hands-on skilling and incubation support. Grants up to ₹100 Lakhs for setting up LBIs and up to ₹100 Lakhs for TBIs. Seed capital assistance through SIDBI fund of funds.",
        "application_procedure": "Submit proposals through the MSME Champions portal or designated regional NSIC incubation centers.",
        "official_portal_url": "https://aspire.msme.gov.in/",
        "verification_status": "Candidate",
        "verification_notes": "Bulk imported candidate record awaiting primary ministry cross-verification.",
        "last_checked_date": datetime.datetime(2026, 3, 5),
        "sources": [
            {
                "source_title": "MyScheme HuggingFace Dataset Record (shrijayan/gov_myscheme)",
                "source_url": "https://huggingface.co/datasets/shrijayan/gov_myscheme",
                "source_type": "myscheme_page",
                "extracted_passage": "ASPIRE promotes rural industrialization and creates local employment through business incubators across India.",
                "provenance_fact": "Bulk imported as Candidate under Apache 2.0 license."
            }
        ],
        "documents": [
            {
                "document_name": "Identity and Educational Certificates",
                "document_category": "identity",
                "is_mandatory": True,
                "issuing_authority": "Government of India",
                "instructions": "Proof of age and educational qualifications."
            }
        ],
        "rules": [
            {
                "rule_code": "ASPIRE_APPLICANT",
                "rule_name": "Aspiring or Rural Entrepreneur",
                "target_field": "applicant_type",
                "operator": "IN",
                "expected_value": ["aspiring_entrepreneur", "startup", "individual"],
                "is_hard_requirement": False,
                "failure_reason": "ASPIRE prioritizes aspiring entrepreneurs and innovation-stage founders.",
                "source_reference": "ASPIRE Scheme Manual"
            }
        ]
    }
]


def seed_candidate_schemes(db: Session, admin_user_id: Optional[int] = None) -> int:
    """Import Candidate schemes derived from MyScheme / Hugging Face dataset."""
    imported_count = 0
    for scheme_data in CANDIDATE_SCHEMES_CATALOGUE:
        code = scheme_data["code"]
        existing = db.query(Scheme).filter(Scheme.code == code).first()
        if not existing:
            scheme = Scheme(
                code=code,
                name=scheme_data["name"],
                ministry=scheme_data["ministry"],
                department=scheme_data.get("department"),
                brief_description=scheme_data["brief_description"],
                detailed_description=scheme_data["detailed_description"],
                target_beneficiaries=scheme_data.get("target_beneficiaries"),
                benefits_summary=scheme_data["benefits_summary"],
                application_procedure=scheme_data["application_procedure"],
                official_portal_url=scheme_data["official_portal_url"],
                verification_status="Candidate",
                verification_notes=scheme_data.get("verification_notes"),
                last_checked_date=scheme_data["last_checked_date"],
                is_active=True
            )
            db.add(scheme)
            db.commit()
            db.refresh(scheme)

            for s in scheme_data.get("sources", []):
                db.add(SchemeSource(
                    scheme_id=scheme.id,
                    source_title=s["source_title"],
                    source_url=s["source_url"],
                    source_type=s.get("source_type", "myscheme_page"),
                    extracted_passage=s["extracted_passage"],
                    provenance_fact=s["provenance_fact"],
                    last_verified_date=datetime.datetime.utcnow()
                ))

            for d in scheme_data.get("documents", []):
                db.add(SchemeDocument(
                    scheme_id=scheme.id,
                    document_name=d["document_name"],
                    document_category=d.get("document_category", "identity"),
                    is_mandatory=d.get("is_mandatory", True),
                    issuing_authority=d.get("issuing_authority"),
                    instructions=d.get("instructions")
                ))

            for r in scheme_data.get("rules", []):
                db.add(SchemeEligibilityRule(
                    scheme_id=scheme.id,
                    rule_code=r["rule_code"],
                    rule_name=r["rule_name"],
                    target_field=r["target_field"],
                    operator=r["operator"],
                    expected_value=r["expected_value"],
                    is_hard_requirement=r.get("is_hard_requirement", True),
                    failure_reason=r["failure_reason"],
                    source_reference=r.get("source_reference")
                ))

            db.commit()
            imported_count += 1

    if imported_count > 0:
        record_audit_log(
            db,
            action="IMPORT_CANDIDATE_SCHEMES",
            resource_type="scheme",
            user_id=admin_user_id,
            details={"count": imported_count, "source": "shrijayan/gov_myscheme (Apache-2.0)"}
        )
    return imported_count


def seed_verified_schemes(db: Session, admin_user_id: Optional[int] = None) -> int:
    """Populate the database with the verified Central Government schemes catalogue."""
    imported_count = 0

    for scheme_data in VERIFIED_SCHEMES_CATALOGUE:
        code = scheme_data["code"]
        existing = db.query(Scheme).filter(Scheme.code == code).first()

        if not existing:
            scheme = Scheme(
                code=code,
                name=scheme_data["name"],
                ministry=scheme_data["ministry"],
                department=scheme_data.get("department"),
                brief_description=scheme_data["brief_description"],
                detailed_description=scheme_data["detailed_description"],
                target_beneficiaries=scheme_data.get("target_beneficiaries"),
                benefits_summary=scheme_data["benefits_summary"],
                application_procedure=scheme_data["application_procedure"],
                official_portal_url=scheme_data["official_portal_url"],
                verification_status=scheme_data["verification_status"],
                verification_notes=scheme_data.get("verification_notes"),
                last_checked_date=scheme_data["last_checked_date"],
                effective_date=scheme_data.get("effective_date"),
                is_active=True
            )
            db.add(scheme)
            db.commit()
            db.refresh(scheme)

            # Add sources
            for s in scheme_data.get("sources", []):
                source = SchemeSource(
                    scheme_id=scheme.id,
                    source_title=s["source_title"],
                    source_url=s["source_url"],
                    source_type=s.get("source_type", "official_portal"),
                    extracted_passage=s["extracted_passage"],
                    provenance_fact=s["provenance_fact"],
                    last_verified_date=datetime.datetime.utcnow()
                )
                db.add(source)

            # Add documents
            for d in scheme_data.get("documents", []):
                doc = SchemeDocument(
                    scheme_id=scheme.id,
                    document_name=d["document_name"],
                    document_category=d.get("document_category", "identity"),
                    is_mandatory=d.get("is_mandatory", True),
                    issuing_authority=d.get("issuing_authority"),
                    instructions=d.get("instructions")
                )
                db.add(doc)

            # Add rules
            for r in scheme_data.get("rules", []):
                rule = SchemeEligibilityRule(
                    scheme_id=scheme.id,
                    rule_code=r["rule_code"],
                    rule_name=r["rule_name"],
                    target_field=r["target_field"],
                    operator=r["operator"],
                    expected_value=r["expected_value"],
                    is_hard_requirement=r.get("is_hard_requirement", True),
                    failure_reason=r["failure_reason"],
                    source_reference=r.get("source_reference")
                )
                db.add(rule)

            # Initial version snapshot
            snapshot = {
                "name": scheme.name,
                "ministry": scheme.ministry,
                "benefits": scheme.benefits_summary,
                "rules_count": len(scheme_data.get("rules", [])),
                "sources_count": len(scheme_data.get("sources", [])),
            }
            version = SchemeVersion(
                scheme_id=scheme.id,
                version_number=1,
                changed_by_user_id=admin_user_id,
                change_summary="Initial verified scheme publication based on official gazette guidelines.",
                content_snapshot=snapshot
            )
            db.add(version)

            db.commit()
            imported_count += 1

    if imported_count > 0:
        record_audit_log(
            db,
            action="SEED_VERIFIED_SCHEMES",
            resource_type="scheme",
            user_id=admin_user_id,
            details={"count": imported_count}
        )

    return imported_count


def get_catalogue_coverage_stats(db: Session) -> Dict[str, Any]:
    """Calculate and return comprehensive database coverage and verification metrics."""
    from sqlalchemy import func

    total_schemes = db.query(func.count(Scheme.id)).scalar() or 0
    verified_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Verified").scalar() or 0
    candidate_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Candidate").scalar() or 0
    needs_review_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Needs Review").scalar() or 0
    stale_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Stale").scalar() or 0
    superseded_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Superseded").scalar() or 0
    rejected_count = db.query(func.count(Scheme.id)).filter(Scheme.verification_status == "Rejected").scalar() or 0

    total_sources = db.query(func.count(SchemeSource.id)).scalar() or 0
    total_rules = db.query(func.count(SchemeEligibilityRule.id)).scalar() or 0
    total_documents = db.query(func.count(SchemeDocument.id)).scalar() or 0

    # Records with official links (non-placeholder)
    official_link_count = db.query(func.count(Scheme.id)).filter(
        Scheme.official_portal_url != "",
        Scheme.official_portal_url.isnot(None),
        Scheme.official_portal_url != "https://www.myscheme.gov.in"
    ).scalar() or 0

    return {
        "total_schemes_in_db": total_schemes,
        "verified_count": verified_count,
        "candidate_count": candidate_count,
        "needs_review_count": needs_review_count,
        "stale_count": stale_count,
        "superseded_count": superseded_count,
        "rejected_count": rejected_count,
        "total_sources_cited": total_sources,
        "total_rules_defined": total_rules,
        "total_documents_required": total_documents,
        "schemes_with_specific_portal_links": official_link_count,
    }


def ingest_myscheme_dataset(
    db: Session,
    max_items: Optional[int] = None,
    filter_central_only: bool = True,
    admin_user_id: Optional[int] = None,
    progress_callback: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Ingest schemes from the MyScheme Hugging Face dataset (shrijayan/gov_myscheme).
    Handles manifest caching, duplicate detection via content hashes and normalized titles,
    empty/corrupt document detection, structured parsing, and batch database persistence.
    """
    import os
    import json
    import httpx
    from backend.services.dataset_parser import extract_text_from_pdf, parse_myscheme_content, slugify

    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    raw_dir = os.path.join(data_dir, "raw_dataset")
    manifest_dir = os.path.join(data_dir, "manifests")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(manifest_dir, exist_ok=True)

    manifest_path = os.path.join(manifest_dir, "dataset_manifest.json")
    scripts_manifest = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "hf_dataset_manifest.json"))

    # Load or fetch manifest
    items = []
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            items = json.load(f)
    elif os.path.exists(scripts_manifest):
        with open(scripts_manifest, "r", encoding="utf-8") as f:
            items = json.load(f)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2)
    else:
        # Fetch from Hugging Face API
        logger.info("Fetching Hugging Face dataset manifest...")
        url = "https://huggingface.co/api/datasets/shrijayan/gov_myscheme/tree/main/text_data"
        all_tree = []
        while url:
            r = httpx.get(url, timeout=30.0)
            if r.status_code != 200:
                break
            batch_items = r.json()
            all_tree.extend(batch_items)
            link = r.headers.get("link", "")
            url = None
            if 'rel="next"' in link:
                for part in link.split(","):
                    if 'rel="next"' in part:
                        url = part.split("<")[1].split(">")[0]
        items = [{"path": x["path"], "size": x.get("size", 0), "oid": x.get("oid")} for x in all_tree]
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2)

    total_discovered = len(items)

    # 1. Deduplication using content hash (oid) and copy detection
    seen_hashes = set()
    unique_candidates = []
    duplicate_copies = 0

    for item in items:
        oid = item.get("oid")
        path = item.get("path", "")
        if " copy" in path:
            duplicate_copies += 1
            continue
        if oid and oid in seen_hashes:
            duplicate_copies += 1
            continue
        if oid:
            seen_hashes.add(oid)
        unique_candidates.append(item)

    if max_items:
        process_queue = unique_candidates[:max_items]
    else:
        process_queue = unique_candidates

    logger.info(f"Ingesting {len(process_queue)} unique candidates out of {total_discovered} discovered files...")

    successfully_processed = 0
    failed_or_corrupt = 0
    duplicate_records_skipped = 0
    imported_candidates = 0
    updated_records = 0

    for idx, item in enumerate(process_queue):
        path = item["path"]
        filename = os.path.basename(path)
        local_pdf_path = os.path.join(raw_dir, filename)

        # Download if not cached
        if not os.path.exists(local_pdf_path):
            try:
                hf_url = f"https://huggingface.co/datasets/shrijayan/gov_myscheme/resolve/main/{path}"
                resp = httpx.get(hf_url, follow_redirects=True, timeout=30.0)
                if resp.status_code == 200:
                    with open(local_pdf_path, "wb") as pf:
                        pf.write(resp.content)
                else:
                    failed_or_corrupt += 1
                    continue
            except Exception as e:
                logger.warning(f"Failed to download {path}: {e}")
                failed_or_corrupt += 1
                continue

        # Extract text
        try:
            with open(local_pdf_path, "rb") as pf:
                pdf_bytes = pf.read()
        except Exception:
            failed_or_corrupt += 1
            continue

        raw_text, err = extract_text_from_pdf(pdf_bytes)
        if err or not raw_text:
            failed_or_corrupt += 1
            continue

        # Parse text into structured scheme attributes
        parsed = parse_myscheme_content(raw_text, filename)
        name = parsed["name"].strip()
        if not name or len(name) < 4:
            failed_or_corrupt += 1
            continue

        # Filter Central Government if specified
        if filter_central_only and not parsed["is_central"]:
            continue

        code = slugify(name)
        successfully_processed += 1

        # Check existing scheme in DB
        existing = db.query(Scheme).filter(
            (Scheme.code == code) | (func.lower(Scheme.name) == name.lower())
        ).first()

        if existing:
            # If already verified or user-modified, do NOT overwrite verified ground truth
            if existing.verification_status == "Verified":
                duplicate_records_skipped += 1
                continue
            # Otherwise update candidate details
            existing.brief_description = parsed["brief_description"]
            existing.detailed_description = parsed["detailed_description"]
            existing.benefits_summary = parsed["benefits_summary"]
            existing.application_procedure = parsed["application_procedure"]
            existing.target_beneficiaries = parsed["target_beneficiaries"]
            existing.updated_at = datetime.datetime.now(datetime.timezone.utc)
            updated_records += 1
            scheme_id = existing.id
        else:
            # Create new Candidate scheme
            scheme = Scheme(
                code=code,
                name=name,
                ministry=parsed["ministry"],
                department=parsed.get("department"),
                brief_description=parsed["brief_description"],
                detailed_description=parsed["detailed_description"],
                target_beneficiaries=parsed.get("target_beneficiaries"),
                benefits_summary=parsed["benefits_summary"],
                application_procedure=parsed["application_procedure"],
                official_portal_url=parsed["official_portal_url"],
                verification_status="Candidate",
                verification_notes=f"Ingested from MyScheme Apache-2.0 public dataset ({filename}). Awaiting administrative verification.",
                last_checked_date=datetime.datetime.now(datetime.timezone.utc),
                is_active=True,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(scheme)
            db.commit()
            db.refresh(scheme)
            scheme_id = scheme.id
            imported_candidates += 1

            # Add source citation
            db.add(
                SchemeSource(
                    scheme_id=scheme_id,
                    source_title=f"MyScheme Record: {name}",
                    source_url=parsed["official_portal_url"],
                    source_type="myscheme_page",
                    extracted_passage=parsed["brief_description"],
                    provenance_fact=f"Imported from {filename} with Apache 2.0 license provenance.",
                    last_verified_date=datetime.datetime.now(datetime.timezone.utc),
                    created_at=datetime.datetime.now(datetime.timezone.utc)
                )
            )

            # Add required documents
            for doc_name in parsed.get("documents_required", []):
                db.add(
                    SchemeDocument(
                        scheme_id=scheme_id,
                        document_name=doc_name[:250],
                        document_category="identity",
                        is_mandatory=True,
                        issuing_authority="Competent Authority / Government",
                        instructions="Submit as part of official application checklist.",
                        created_at=datetime.datetime.now(datetime.timezone.utc)
                    )
                )

            # Add structured rules
            for r in parsed.get("rules", []):
                db.add(
                    SchemeEligibilityRule(
                        scheme_id=scheme_id,
                        rule_code=r["rule_code"],
                        rule_name=r["rule_name"],
                        target_field=r["target_field"],
                        operator=r["operator"],
                        expected_value=r["expected_value"],
                        is_hard_requirement=r.get("is_hard_requirement", True),
                        failure_reason=r["failure_reason"],
                        source_reference=r.get("source_reference"),
                        created_at=datetime.datetime.now(datetime.timezone.utc)
                    )
                )

            # Add initial version snapshot
            db.add(
                SchemeVersion(
                    scheme_id=scheme_id,
                    version_number=1,
                    changed_by_user_id=admin_user_id,
                    change_summary="Initial dataset extraction and candidate ingestion.",
                    content_snapshot={
                        "name": name,
                        "ministry": parsed["ministry"],
                        "source_file": filename,
                    },
                    created_at=datetime.datetime.now(datetime.timezone.utc)
                )
            )

            db.commit()

        if progress_callback and idx % 10 == 0:
            progress_callback(idx, len(process_queue))

    if imported_candidates > 0 or updated_records > 0:
        record_audit_log(
            db,
            action="INGEST_MYSCHEME_DATASET",
            resource_type="scheme_catalogue",
            user_id=admin_user_id,
            details={
                "discovered": total_discovered,
                "imported": imported_candidates,
                "updated": updated_records,
                "skipped_duplicates": duplicate_copies + duplicate_records_skipped,
                "failed": failed_or_corrupt,
            }
        )

    coverage_stats = get_catalogue_coverage_stats(db)

    return {
        "total_source_files_discovered": total_discovered,
        "duplicate_files_skipped": duplicate_copies,
        "processed_in_batch": len(process_queue),
        "successfully_processed": successfully_processed,
        "failed_or_corrupt": failed_or_corrupt,
        "new_candidate_records_imported": imported_candidates,
        "existing_records_updated": updated_records,
        "duplicate_records_skipped": duplicate_records_skipped,
        "coverage": coverage_stats
    }

