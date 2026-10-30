import sys
from backend.database import SessionLocal
from backend.services.auth_service import bootstrap_admin_user

def main():
    if len(sys.argv) < 4:
        print("Usage: python -m backend.scripts.bootstrap_admin <email> <full_name> <password>")
        sys.exit(1)

    email = sys.argv[1].strip()
    full_name = sys.argv[2].strip()
    password = sys.argv[3]

    db = SessionLocal()
    try:
        admin = bootstrap_admin_user(db, email=email, password=password, full_name=full_name)
        roles = [r.role.name for r in admin.roles]
        print(f"SUCCESS: Administrator {admin.email} (ID: {admin.id}) provisioned with active roles: {roles}")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
