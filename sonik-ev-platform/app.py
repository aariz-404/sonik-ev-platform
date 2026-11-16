"""
app.py — Sonik EV Platform application entry point.

Run directly:
    python app.py

Or via Flask CLI:
    flask run
"""

import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app

env = os.getenv("FLASK_ENV", "development")
app = create_app(config_name=env)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=app.config.get("DEBUG", False),
    )
