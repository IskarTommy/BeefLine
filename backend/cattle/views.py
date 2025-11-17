from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Cattle, CattleImage, HealthDocument
from .serializers import (
    CattleListSerializer,
    CattleDetailSerializer,
    CattleCreateUpdateSerializer,
    CattleImageUploadSerializer,
    HealthDocumentUploadSerializer,
)


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow sellers to create/edit cattle.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated sellers
        return request.user.is_authenticated and request.user.can_sell()
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the seller of the cattle
        return obj.seller == request.user


class CattleListCreateView(generics.ListCreateAPIView):
    """
    List all active cattle or create a new cattle listing
    """
    permission_classes = [IsSellerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering
    filterset_fields = {
        'breed': ['exact'],
        'gender': ['exact'],
        'region': ['exact'],
        'price': ['gte', 'lte'],
        'age_months': ['gte', 'lte'],
        'weight_kg': ['gte', 'lte'],
        'health_status': ['exact'],
        'vaccination_status': ['exact'],
    }
    
    # Search
    search_fields = ['title', 'description', 'city']
    
    # Ordering
    ordering_fields = ['price', 'age_months', 'weight_kg', 'created_at', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Cattle.objects.filter(
            is_active=True,
            is_sold=False
        ).select_related('seller').prefetch_related('images')
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CattleCreateUpdateSerializer
        return CattleListSerializer
    
    def perform_create(self, serializer):
        serializer.save()


class CattleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a cattle listing
    """
    queryset = Cattle.objects.all()
    permission_classes = [IsSellerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CattleCreateUpdateSerializer
        return CattleDetailSerializer
    
    def get_queryset(self):
        return Cattle.objects.select_related('seller').prefetch_related(
            'images',
            'health_documents'
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MyCattleListView(generics.ListAPIView):
    """
    List all cattle listings for the current user
    """
    serializer_class = CattleListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Cattle.objects.filter(
            seller=self.request.user
        ).select_related('seller').prefetch_related('images').order_by('-created_at')


class CattleImageUploadView(APIView):
    """
    Upload images for a cattle listing
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, cattle_id):
        try:
            cattle = Cattle.objects.get(id=cattle_id, seller=request.user)
        except Cattle.DoesNotExist:
            return Response(
                {'error': 'Cattle not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CattleImageUploadSerializer(
            data=request.data,
            context={'cattle': cattle}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CattleImageDeleteView(APIView):
    """
    Delete a cattle image
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, cattle_id, image_id):
        try:
            image = CattleImage.objects.get(
                id=image_id,
                cattle_id=cattle_id,
                cattle__seller=request.user
            )
            image.delete()
            return Response(
                {'message': 'Image deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except CattleImage.DoesNotExist:
            return Response(
                {'error': 'Image not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )


class HealthDocumentUploadView(APIView):
    """
    Upload health documents for a cattle listing
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, cattle_id):
        try:
            cattle = Cattle.objects.get(id=cattle_id, seller=request.user)
        except Cattle.DoesNotExist:
            return Response(
                {'error': 'Cattle not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = HealthDocumentUploadSerializer(
            data=request.data,
            context={'cattle': cattle}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HealthDocumentDeleteView(APIView):
    """
    Delete a health document
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, cattle_id, document_id):
        try:
            document = HealthDocument.objects.get(
                id=document_id,
                cattle_id=cattle_id,
                cattle__seller=request.user
            )
            document.delete()
            return Response(
                {'message': 'Document deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except HealthDocument.DoesNotExist:
            return Response(
                {'error': 'Document not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )


class MarkCattleAsSoldView(APIView):
    """
    Mark a cattle listing as sold
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, cattle_id):
        try:
            cattle = Cattle.objects.get(id=cattle_id, seller=request.user)
            cattle.mark_as_sold()
            return Response(
                {'message': 'Cattle marked as sold successfully'},
                status=status.HTTP_200_OK
            )
        except Cattle.DoesNotExist:
            return Response(
                {'error': 'Cattle not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
