"""
app/extensions.py — Shared Flask extension instances.

Extensions are instantiated here (without an app object) so they can be
imported by any module without triggering circular imports.  They are
bound to the actual Flask application inside create_app() via the
init_app() pattern.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# SQLAlchemy ORM — imported by all model modules
db: SQLAlchemy = SQLAlchemy()

# CORS — initialised in create_app() with per-environment origins
cors: CORS = CORS()
