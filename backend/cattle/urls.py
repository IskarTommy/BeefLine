from django.urls import path
from .views import (
    CattleListCreateView,
    CattleDetailView,
    MyCattleListView,
    CattleImageUploadView,
    CattleImageDeleteView,
    HealthDocumentUploadView,
    HealthDocumentDeleteView,
    MarkCattleAsSoldView,
)

app_name = 'cattle'

urlpatterns = [
    # Cattle CRUD
    path('', CattleListCreateView.as_view(), name='cattle-list-create'),
    path('<int:pk>/', CattleDetailView.as_view(), name='cattle-detail'),
    path('my-listings/', MyCattleListView.as_view(), name='my-cattle'),
    
    # Images
    path('<int:cattle_id>/images/', CattleImageUploadView.as_view(), name='image-upload'),
    path('<int:cattle_id>/images/<int:image_id>/', CattleImageDeleteView.as_view(), name='image-delete'),
    
    # Health Documents
    path('<int:cattle_id>/documents/', HealthDocumentUploadView.as_view(), name='document-upload'),
    path('<int:cattle_id>/documents/<int:document_id>/', HealthDocumentDeleteView.as_view(), name='document-delete'),
    
    # Actions
    path('<int:cattle_id>/mark-sold/', MarkCattleAsSoldView.as_view(), name='mark-sold'),
]
