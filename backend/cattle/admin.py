from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Cattle, CattleImage, HealthDocument


class CattleImageInline(admin.TabularInline):
    """Inline admin for cattle images"""
    model = CattleImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'uploaded_at']
    readonly_fields = ['uploaded_at']


class HealthDocumentInline(admin.TabularInline):
    """Inline admin for health documents"""
    model = HealthDocument
    extra = 1
    fields = ['document_type', 'document_name', 'document', 'issue_date', 'expiry_date']


@admin.register(Cattle)
class CattleAdmin(admin.ModelAdmin):
    """Admin interface for Cattle model"""
    
    list_display = [
        'title',
        'breed',
        'gender',
        'age_display',
        'weight_kg',
        'price_display',
        'region',
        'seller_name',
        'health_status',
        'vaccination_status',
        'is_active',
        'is_sold',
        'view_count',
        'created_at',
    ]
    
    list_filter = [
        'breed',
        'gender',
        'health_status',
        'vaccination_status',
        'is_active',
        'is_sold',
        'region',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'description',
        'seller__email',
        'seller__first_name',
        'seller__last_name',
        'city',
    ]
    
    readonly_fields = [
        'view_count',
        'created_at',
        'updated_at',
        'sold_date',
        'primary_image_preview',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'breed', 'gender', 'age_months', 'weight_kg')
        }),
        ('Pricing', {
            'fields': ('price', 'is_negotiable')
        }),
        ('Health Information', {
            'fields': (
                'health_status',
                'vaccination_status',
                'last_vaccination_date',
                'health_notes',
                'feeding_history'
            )
        }),
        ('Location', {
            'fields': ('region', 'city', 'location_details')
        }),
        ('Seller', {
            'fields': ('seller',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_sold', 'sold_date')
        }),
        ('Statistics', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Preview', {
            'fields': ('primary_image_preview',),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CattleImageInline, HealthDocumentInline]
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    actions = [
        'mark_as_sold',
        'mark_as_active',
        'mark_as_inactive',
    ]
    
    def age_display(self, obj):
        """Display age in readable format"""
        return obj.get_age_display()
    age_display.short_description = 'Age'
    
    def price_display(self, obj):
        """Display price with currency"""
        negotiable = " (Negotiable)" if obj.is_negotiable else ""
        return f"GHS {obj.price:,.2f}{negotiable}"
    price_display.short_description = 'Price'
    
    def seller_name(self, obj):
        """Display seller's full name"""
        return obj.seller.get_full_name()
    seller_name.short_description = 'Seller'
    seller_name.admin_order_field = 'seller__first_name'
    
    def primary_image_preview(self, obj):
        """Show primary image preview"""
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px;" />',
                obj.primary_image.image.url
            )
        return "No image"
    primary_image_preview.short_description = 'Primary Image'
    
    def mark_as_sold(self, request, queryset):
        """Mark selected cattle as sold"""
        for cattle in queryset:
            cattle.mark_as_sold()
        self.message_user(request, f'{queryset.count()} cattle marked as sold.')
    mark_as_sold.short_description = 'Mark selected as sold'
    
    def mark_as_active(self, request, queryset):
        """Mark selected cattle as active"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} cattle marked as active.')
    mark_as_active.short_description = 'Mark selected as active'
    
    def mark_as_inactive(self, request, queryset):
        """Mark selected cattle as inactive"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} cattle marked as inactive.')
    mark_as_inactive.short_description = 'Mark selected as inactive'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('seller').prefetch_related('images', 'health_documents')


@admin.register(CattleImage)
class CattleImageAdmin(admin.ModelAdmin):
    """Admin interface for Cattle Images"""
    
    list_display = [
        'cattle',
        'image_preview',
        'caption',
        'is_primary',
        'uploaded_at',
    ]
    
    list_filter = [
        'is_primary',
        'uploaded_at',
    ]
    
    search_fields = [
        'cattle__title',
        'caption',
    ]
    
    readonly_fields = ['uploaded_at', 'image_preview']
    
    def image_preview(self, obj):
        """Show image preview"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(HealthDocument)
class HealthDocumentAdmin(admin.ModelAdmin):
    """Admin interface for Health Documents"""
    
    list_display = [
        'document_name',
        'cattle',
        'document_type',
        'issue_date',
        'expiry_date',
        'is_expired_display',
        'uploaded_at',
    ]
    
    list_filter = [
        'document_type',
        'issue_date',
        'expiry_date',
        'uploaded_at',
    ]
    
    search_fields = [
        'document_name',
        'cattle__title',
        'notes',
    ]
    
    readonly_fields = ['uploaded_at', 'is_expired_display']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('cattle', 'document_type', 'document_name', 'document')
        }),
        ('Dates', {
            'fields': ('issue_date', 'expiry_date', 'uploaded_at')
        }),
        ('Additional Information', {
            'fields': ('notes', 'is_expired_display'),
            'classes': ('collapse',)
        }),
    )
    
    def is_expired_display(self, obj):
        """Display expiry status"""
        if obj.expiry_date:
            if obj.is_expired():
                return format_html('<span style="color: red;">Expired</span>')
            return format_html('<span style="color: green;">Valid</span>')
        return 'N/A'
    is_expired_display.short_description = 'Status'
