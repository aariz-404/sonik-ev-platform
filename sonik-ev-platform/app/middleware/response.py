from flask import jsonify
import math


def success_response(data=None, message=None, status_code=200):
    """Return a uniform success JSON response.

    Args:
        data: Serialisable payload to include under the ``data`` key.
        message: Optional human-readable message.
        status_code: HTTP status code (default 200).

    Returns:
        A ``(Response, int)`` tuple ready to be returned from a Flask view.
    """
    body = {'success': True}
    if data is not None:
        body['data'] = data
    if message:
        body['message'] = message
    return jsonify(body), status_code


def error_response(error=None, message=None, status_code=400, errors=None):
    """Return a uniform error JSON response.

    Args:
        error: Short error label (e.g. ``'Not Found'``).
        message: Longer human-readable explanation.
        status_code: HTTP status code (default 400).
        errors: Optional list/dict of field-level validation errors.

    Returns:
        A ``(Response, int)`` tuple ready to be returned from a Flask view.
    """
    body = {'success': False}
    if error:
        body['error'] = error
    if message:
        body['message'] = message
    if errors is not None:
        body['errors'] = errors
    return jsonify(body), status_code


def paginated_response(data, total, limit, offset, status_code=200):
    """Return a uniform paginated JSON response.

    Args:
        data: List of items for the current page.
        total: Total number of items across all pages.
        limit: Maximum items per page.
        offset: Zero-based item offset for the current page.
        status_code: HTTP status code (default 200).

    Returns:
        A ``(Response, int)`` tuple ready to be returned from a Flask view.
    """
    if limit > 0:
        pages = math.ceil(total / limit)
        current_page = (offset // limit) + 1
    else:
        pages = 1
        current_page = 1

    body = {
        'success': True,
        'data': data,
        'pagination': {
            'total': total,
            'limit': limit,
            'offset': offset,
            'pages': pages,
            'current_page': current_page,
        },
    }
    return jsonify(body), status_code
