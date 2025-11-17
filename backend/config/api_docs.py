"""
API Documentation for BeefLine Cattle Marketplace
"""

API_ENDPOINTS = {
    "Authentication": {
        "Register": "POST /api/users/auth/register/",
        "Login": "POST /api/users/auth/login/",
        "Refresh Token": "POST /api/users/auth/refresh/",
    },
    "User Profile": {
        "Get Profile": "GET /api/users/profile/",
        "Update Profile": "PUT/PATCH /api/users/profile/update/",
        "Change Password": "POST /api/users/profile/change-password/",
        "User's Cattle": "GET /api/users/<user_id>/cattle/",
    },
    "Cattle": {
        "List All Cattle": "GET /api/cattle/",
        "Create Cattle": "POST /api/cattle/",
        "Get Cattle Detail": "GET /api/cattle/<id>/",
        "Update Cattle": "PUT/PATCH /api/cattle/<id>/",
        "Delete Cattle": "DELETE /api/cattle/<id>/",
        "My Listings": "GET /api/cattle/my-listings/",
        "Mark as Sold": "POST /api/cattle/<id>/mark-sold/",
    },
    "Cattle Images": {
        "Upload Image": "POST /api/cattle/<cattle_id>/images/",
        "Delete Image": "DELETE /api/cattle/<cattle_id>/images/<image_id>/",
    },
    "Health Documents": {
        "Upload Document": "POST /api/cattle/<cattle_id>/documents/",
        "Delete Document": "DELETE /api/cattle/<cattle_id>/documents/<document_id>/",
    },
}
