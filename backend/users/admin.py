from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin interface for User model"""
    
    list_display = [
        'email',
        'get_full_name',
        'phone_number',
        'user_type',
        'region',
        'is_verified',
        'is_verified_seller',
        'is_active',
        'date_joined',
    ]
    
    list_filter = [
        'user_type',
        'is_verified',
        'is_verified_seller',
        'is_active',
        'is_staff',
        'region',
        'date_joined',
    ]
    
    search_fields = [
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'business_name',
    ]
    
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password', 'phone_number')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'profile_picture')
        }),
        ('User Type & Role', {
            'fields': ('user_type', 'is_staff', 'is_superuser')
        }),
        ('Location', {
            'fields': ('region', 'city', 'address')
        }),
        ('Seller Information', {
            'fields': ('business_name', 'is_verified_seller', 'verification_documents'),
            'classes': ('collapse',)
        }),
        ('Account Status', {
            'fields': ('is_active', 'is_verified', 'failed_login_attempts', 'account_locked_until')
        }),
        ('Security', {
            'fields': ('two_factor_enabled', 'last_password_change'),
            'classes': ('collapse',)
        }),
        ('Payment', {
            'fields': ('payment_verified', 'payment_provider_id'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': (
                'email',
                'phone_number',
                'first_name',
                'last_name',
                'user_type',
                'password1',
                'password2',
            ),
        }),
    )
    
    readonly_fields = ['date_joined', 'updated_at', 'last_login', 'last_password_change']
    
    def get_full_name(self, obj):
        """Display full name in list"""
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    actions = ['verify_sellers', 'unverify_sellers', 'activate_users', 'deactivate_users']
    
    def verify_sellers(self, request, queryset):
        """Bulk verify sellers"""
        updated = queryset.filter(user_type__in=['SELLER', 'BOTH']).update(is_verified_seller=True)
        self.message_user(request, f'{updated} seller(s) verified successfully.')
    verify_sellers.short_description = 'Verify selected sellers'
    
    def unverify_sellers(self, request, queryset):
        """Bulk unverify sellers"""
        updated = queryset.update(is_verified_seller=False)
        self.message_user(request, f'{updated} seller(s) unverified.')
    unverify_sellers.short_description = 'Unverify selected sellers'
    
    def activate_users(self, request, queryset):
        """Bulk activate users"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        """Bulk deactivate users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'
