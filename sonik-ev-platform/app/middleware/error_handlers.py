def register_error_handlers(app):
    """Register JSON error handlers for all common HTTP error codes."""
    from flask import jsonify

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': str(e.description) if hasattr(e, 'description') else 'Bad request',
        }), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authentication required',
        }), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource',
        }), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': 'The requested resource was not found',
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({
            'success': False,
            'error': 'Method Not Allowed',
            'message': 'HTTP method not allowed for this endpoint',
        }), 405

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({
            'success': False,
            'error': 'Conflict',
            'message': str(e.description) if hasattr(e, 'description') else 'Conflict',
        }), 409

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({
            'success': False,
            'error': 'Unprocessable Entity',
            'message': str(e.description) if hasattr(e, 'description') else 'Validation failed',
        }), 422

    @app.errorhandler(429)
    def too_many_requests(e):
        return jsonify({
            'success': False,
            'error': 'Too Many Requests',
            'message': 'Rate limit exceeded. Please try again later.',
        }), 429

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Please try again later.',
        }), 500

    @app.errorhandler(503)
    def service_unavailable(e):
        return jsonify({
            'success': False,
            'error': 'Service Unavailable',
            'message': 'The service is temporarily unavailable. Please try again later.',
        }), 503
