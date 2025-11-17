from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def api_root(request):
    """
    API Root - List all available endpoints
    """
    return Response({
        'message': 'Welcome to BeefLine Cattle Marketplace API',
        'version': '1.0',
        'endpoints': {
            'authentication': {
                'register': '/api/users/auth/register/',
                'login': '/api/users/auth/login/',
                'refresh_token': '/api/users/auth/refresh/',
            },
            'user_profile': {
                'get_profile': '/api/users/profile/',
                'update_profile': '/api/users/profile/update/',
                'change_password': '/api/users/profile/change-password/',
                'user_cattle': '/api/users/<user_id>/cattle/',
            },
            'cattle': {
                'list_all': '/api/cattle/',
                'create': '/api/cattle/',
                'detail': '/api/cattle/<id>/',
                'my_listings': '/api/cattle/my-listings/',
                'mark_sold': '/api/cattle/<id>/mark-sold/',
            },
            'cattle_images': {
                'upload': '/api/cattle/<cattle_id>/images/',
                'delete': '/api/cattle/<cattle_id>/images/<image_id>/',
            },
            'health_documents': {
                'upload': '/api/cattle/<cattle_id>/documents/',
                'delete': '/api/cattle/<cattle_id>/documents/<document_id>/',
            },
        },
        'admin': '/admin/',
    })
