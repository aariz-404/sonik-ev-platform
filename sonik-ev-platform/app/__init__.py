"""
app/__init__.py — Application factory for the Sonik EV Platform backend.
"""

import os
from flask import Flask, jsonify
from dotenv import load_dotenv

load_dotenv()

from app.extensions import db, cors
from config import config
from app.middleware.error_handlers import register_error_handlers


def _register_blueprints(app: Flask) -> None:
    """Import and register all route blueprints."""
    from app.routes.auth import auth_bp
    from app.routes.stations import stations_bp
    from app.routes.chargers import chargers_bp
    from app.routes.sessions import sessions_bp
    from app.routes.tickets import tickets_bp
    from app.routes.analytics import analytics_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(stations_bp)
    app.register_blueprint(chargers_bp)
    app.register_blueprint(sessions_bp)
    app.register_blueprint(tickets_bp)
    app.register_blueprint(analytics_bp)


def create_app(config_name: str = None) -> Flask:
    """
    Create and configure a Flask application instance.

    Args:
        config_name: One of 'development', 'production', 'testing', or None (reads FLASK_ENV).

    Returns:
        A fully configured Flask application.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)

    # 1. Load configuration
    cfg = config.get(config_name, config["development"])
    app.config.from_object(cfg)

    # 2. Initialise extensions
    db.init_app(app)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # 3. Register blueprints
    _register_blueprints(app)

    # 4. Register standardized JSON error handlers
    register_error_handlers(app)

    # 5. Health-check endpoint
    @app.get("/api/v1/health")
    def health_check():
        """Liveness probe — returns 200 when the application is running."""
        return jsonify({
            "success": True,
            "status": "ok",
            "service": "Sonik EV Platform",
            "version": "1.0.0",
        }), 200

    # 6. Create database tables in testing mode (or development if DB is reachable)
    if config_name == "testing":
        with app.app_context():
            db.create_all()
    elif config_name == "development":
        try:
            with app.app_context():
                db.create_all()
        except Exception as e:
            app.logger.warning("Database connection deferred or not yet ready: %s", e)

    return app
