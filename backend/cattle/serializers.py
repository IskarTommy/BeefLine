from rest_framework import serializers
from .models import Cattle, CattleImage, HealthDocument
from users.serializers import UserListSerializer


class CattleImageSerializer(serializers.ModelSerializer):
    """Serializer for cattle images"""
    
    class Meta:
        model = CattleImage
        fields = [
            'id',
            'image',
            'caption',
            'is_primary',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']


class HealthDocumentSerializer(serializers.ModelSerializer):
    """Serializer for health documents"""
    is_expired = serializers.BooleanField(source='is_expired', read_only=True)
    
    class Meta:
        model = HealthDocument
        fields = [
            'id',
            'document_type',
            'document',
            'document_name',
            'issue_date',
            'expiry_date',
            'is_expired',
            'notes',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']


class CattleListSerializer(serializers.ModelSerializer):
    """Serializer for cattle list view (minimal data)"""
    seller = UserListSerializer(read_only=True)
    primary_image = CattleImageSerializer(read_only=True)
    age_display = serializers.CharField(source='get_age_display', read_only=True)
    
    class Meta:
        model = Cattle
        fields = [
            'id',
            'title',
            'breed',
            'gender',
            'age_months',
            'age_display',
            'weight_kg',
            'price',
            'is_negotiable',
            'health_status',
            'vaccination_status',
            'region',
            'city',
            'seller',
            'primary_image',
            'is_active',
            'is_sold',
            'view_count',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'seller',
            'view_count',
            'created_at',
        ]


class CattleDetailSerializer(serializers.ModelSerializer):
    """Serializer for cattle detail view (full data)"""
    seller = UserListSerializer(read_only=True)
    images = CattleImageSerializer(many=True, read_only=True)
    health_documents = HealthDocumentSerializer(many=True, read_only=True)
    age_display = serializers.CharField(source='get_age_display', read_only=True)
    has_health_certificate = serializers.BooleanField(read_only=True)
    has_vaccination_record = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cattle
        fields = [
            'id',
            'title',
            'description',
            'breed',
            'gender',
            'age_months',
            'age_display',
            'weight_kg',
            'price',
            'is_negotiable',
            'health_status',
            'vaccination_status',
            'last_vaccination_date',
            'health_notes',
            'feeding_history',
            'region',
            'city',
            'location_details',
            'seller',
            'images',
            'health_documents',
            'has_health_certificate',
            'has_vaccination_record',
            'is_active',
            'is_sold',
            'view_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'seller',
            'view_count',
            'created_at',
            'updated_at',
        ]


class CattleCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating cattle"""
    
    class Meta:
        model = Cattle
        fields = [
            'title',
            'description',
            'breed',
            'gender',
            'age_months',
            'weight_kg',
            'price',
            'is_negotiable',
            'health_status',
            'vaccination_status',
            'last_vaccination_date',
            'health_notes',
            'feeding_history',
            'region',
            'city',
            'location_details',
            'is_active',
        ]
    
    def validate(self, attrs):
        """Custom validation"""
        # Check if user can sell
        user = self.context['request'].user
        if not user.can_sell():
            raise serializers.ValidationError(
                "Only sellers can create cattle listings."
            )
        return attrs
    
    def create(self, validated_data):
        """Create cattle with current user as seller"""
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class CattleImageUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading cattle images"""
    
    class Meta:
        model = CattleImage
        fields = ['image', 'caption', 'is_primary']
    
    def create(self, validated_data):
        """Create image with cattle from context"""
        validated_data['cattle'] = self.context['cattle']
        return super().create(validated_data)


class HealthDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading health documents"""
    
    class Meta:
        model = HealthDocument
        fields = [
            'document_type',
            'document',
            'document_name',
            'issue_date',
            'expiry_date',
            'notes',
        ]
    
    def create(self, validated_data):
        """Create document with cattle from context"""
        validated_data['cattle'] = self.context['cattle']
        return super().create(validated_data)
