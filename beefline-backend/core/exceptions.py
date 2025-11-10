"""
Custom exception handler for REST Framework.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error responses.
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code
        }
        
        if hasattr(exc, 'detail'):
            custom_response['details'] = exc.detail
        
        response.data = custom_response
    
    return response
