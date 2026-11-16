import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# On Vercel Serverless, use writable /tmp directory and seed initial demo data
if os.getenv("VERCEL"):
    tmp_db = "/tmp/sonik_ev.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"
    if not os.path.exists(tmp_db):
        try:
            from database.seed_demo_data import seed_all
            seed_all(force=True)
        except Exception as e:
            print(f"Error during Vercel initial seeding: {e}")

from app import create_app

app = create_app(os.getenv("FLASK_ENV", "production"))
