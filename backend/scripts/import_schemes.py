import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.database import SessionLocal
from backend.services.ingestion_service import (
    seed_verified_schemes,
    seed_candidate_schemes,
    ingest_myscheme_dataset,
    get_catalogue_coverage_stats
)
from backend.models.scheme import Scheme

def main():
    db = SessionLocal()
    try:
        print("[1/3] Ingesting verified Central Government schemes...")
        v_count = seed_verified_schemes(db)
        print(f"  [OK] Verified schemes initialized ({v_count} added or verified).")

        print("[2/3] Seeding initial baseline candidate schemes...")
        c_count = seed_candidate_schemes(db)
        print(f"  [OK] Baseline candidates checked ({c_count} added).")

        print("[3/3] Ingesting candidate schemes from MyScheme dataset (Hugging Face Apache-2.0)...")
        res = ingest_myscheme_dataset(db, max_items=80, filter_central_only=True)
        print(f"  [OK] Ingestion run completed.")
        print(f"       - Candidates structured & imported: {res['new_candidate_records_imported']}")
        print(f"       - Duplicates skipped: {res['duplicate_records_skipped'] + res['duplicate_files_skipped']}")

        cov = get_catalogue_coverage_stats(db)
        print("\n=== Catalogue Summary ===")
        print(f"Total Schemes in Database: {cov['total_schemes_in_db']}")
        print(f" - Verified:   {cov['verified_count']}")
        print(f" - Candidate:  {cov['candidate_count']}")
        print(f" - Other:      {cov['needs_review_count'] + cov['stale_count']}")
        print(f"Total Sources: {cov['total_sources_cited']}")
        print(f"Total Rules:   {cov['total_rules_defined']}")
        print(f"Total Docs:    {cov['total_documents_required']}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    main()
