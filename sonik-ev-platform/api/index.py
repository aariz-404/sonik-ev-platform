import os
import sys
import shutil
import tempfile
import traceback

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# On Vercel Serverless environment, use writable temp directory
if os.getenv("VERCEL"):
    os.environ["FLASK_ENV"] = os.getenv("FLASK_ENV", "production")
    os.environ["CORS_ORIGINS"] = os.getenv("CORS_ORIGINS", "*")

    tmp_dir = tempfile.gettempdir()
    tmp_db = os.path.join(tmp_dir, "sonik_ev.db")
    src_db = os.path.join(PROJECT_ROOT, "instance", "sonik_ev.db")

    if not os.path.exists(tmp_db) and os.path.exists(src_db):
        try:
            shutil.copyfile(src_db, tmp_db)
        except Exception as e:
            print(f"Error copying database: {e}")

    if os.path.exists(tmp_db):
        os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"
    else:
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"

try:
    from app import create_app
    app = create_app(os.getenv("FLASK_ENV", "production"))
except Exception as exc:
    err_msg = str(exc)
    err_tb = traceback.format_exc()
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def fallback_error(path):
        return jsonify({
            "error": "Backend initialization failed",
            "message": err_msg,
            "traceback": err_tb
        }), 500
