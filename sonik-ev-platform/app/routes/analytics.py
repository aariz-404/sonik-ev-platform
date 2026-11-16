from flask import Blueprint
from app.services import analytics_service
from app.middleware.auth import token_required, role_required
from app.middleware.response import success_response, error_response

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/v1/analytics')

@analytics_bp.route('/summary', methods=['GET'])
@role_required('ADMIN', 'OPERATOR', 'SUPPORT')
def get_summary():
    try:
        data = analytics_service.get_summary()
        return success_response(data)
    except Exception as e:
        return error_response('Internal Server Error', 'Failed to fetch analytics', 500)
