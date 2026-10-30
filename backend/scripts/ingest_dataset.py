"""
P21 Ingestion CLI Script
Processes the public MyScheme dataset (shrijayan/gov_myscheme),
performs content deduplication, structures rules/sources/documents,
and updates the PostgreSQL database.
"""

import argparse
import sys
import os

# Ensure project root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.database import SessionLocal
from backend.services.ingestion_service import (
    seed_verified_schemes,
    seed_candidate_schemes,
    ingest_myscheme_dataset,
    get_catalogue_coverage_stats
)


def main():
    parser = argparse.ArgumentParser(description="P21 Scheme Ingestion Engine")
    parser.add_argument("--limit", type=int, default=100, help="Maximum unique candidate schemes to process (default 100)")
    parser.add_argument("--all", action="store_true", help="Process all available unique items in dataset")
    parser.add_argument("--all-india-only", action="store_true", default=True, help="Prioritize Central / All-India schemes")
    args = parser.parse_args()

    max_items = None if args.all else args.limit

    print("==========================================================")
    print(" P21 SCHEME DATASET INGESTION & COVERAGE PIPELINE")
    print("==========================================================")

    db = SessionLocal()
    try:
        # Step 1: Ensure Verified Ground Truth Schemes are present
        print("\n[Step 1] Ensuring verified Gazette schemes are loaded...")
        v_count = seed_verified_schemes(db)
        print(f"  -> Verified ground truth: {v_count} added (or already present).")

        # Step 2: Ingest from MyScheme Hugging Face dataset
        print(f"\n[Step 2] Ingesting MyScheme dataset (Limit: {'ALL' if max_items is None else max_items})...")
        def progress(current, total):
            pct = int((current / total) * 100) if total else 0
            print(f"  Processing: [{current}/{total}] ({pct}%)...", end="\r", flush=True)

        res = ingest_myscheme_dataset(
            db=db,
            max_items=max_items,
            filter_central_only=args.all_india_only,
            progress_callback=progress
        )

        print("\n\n==========================================================")
        print(" INGESTION & COVERAGE REPORT")
        print("==========================================================")
        print(f"Total Source Files Discovered:       {res['total_source_files_discovered']}")
        print(f"Duplicate Files Skipped:             {res['duplicate_files_skipped']}")
        print(f"Batch Candidates Processed:          {res['processed_in_batch']}")
        print(f"Successfully Structured:             {res['successfully_processed']}")
        print(f"Corrupt or Empty Files:              {res['failed_or_corrupt']}")
        print(f"New Candidates Ingested into DB:     {res['new_candidate_records_imported']}")
        print(f"Existing Records Updated:            {res['existing_records_updated']}")
        print(f"Duplicates Skipped (DB Match):       {res['duplicate_records_skipped']}")
        print("----------------------------------------------------------")
        cov = res["coverage"]
        print(f"Total Active Schemes in Database:    {cov['total_schemes_in_db']}")
        print(f" - Verified Schemes:                 {cov['verified_count']}")
        print(f" - Candidate Schemes:                {cov['candidate_count']}")
        print(f" - Needs Review:                     {cov['needs_review_count']}")
        print(f" - Stale / Superseded / Rejected:    {cov['stale_count'] + cov['superseded_count'] + cov['rejected_count']}")
        print(f"Total Sources Cited:                 {cov['total_sources_cited']}")
        print(f"Total Eligibility Rules Defined:     {cov['total_rules_defined']}")
        print(f"Total Documents Required:            {cov['total_documents_required']}")
        print(f"Schemes with Official Portal URLs:   {cov['schemes_with_specific_portal_links']}")
        print("==========================================================")

    except Exception as exc:
        print(f"\n[FATAL ERROR] Ingestion failed: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
