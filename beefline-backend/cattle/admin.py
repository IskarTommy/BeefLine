"""
Admin configuration for cattle app.
"""
from django.contrib import admin
from .models import Cattle, CattleImage, HealthDocument


class CattleImageInline(admin.TabularInline):
    model = CattleImage
    extra = 1


class HealthDocumentInline(admin.TabularInline):
    model = HealthDocument
    extra = 1


@admin.register(Cattle)
class CattleAdmin(admin.ModelAdmin):
    list_display = ['breed', 'age', 'weight', 'price', 'region', 'seller', 'vaccination_status', 'is_active', 'created_at']
    list_filter = ['breed', 'region', 'vaccination_status', 'is_active']
    search_fields = ['breed', 'health_notes', 'seller__username']
    inlines = [CattleImageInline, HealthDocumentInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('seller')


@admin.register(CattleImage)
class CattleImageAdmin(admin.ModelAdmin):
    list_display = ['cattle', 'is_primary', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']


@admin.register(HealthDocument)
class HealthDocumentAdmin(admin.ModelAdmin):
    list_display = ['cattle', 'document_type', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']
