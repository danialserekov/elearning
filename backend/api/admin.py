from django.contrib import admin
from api import models 
from api import views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

admin.site.register(models.Teacher)
admin.site.register(models.Category)
admin.site.register(models.Course)
admin.site.register(models.Variant)
admin.site.register(models.VariantItem)
admin.site.register(models.Question_Answer)
admin.site.register(models.Question_Answer_Message)
admin.site.register(models.Cart)
admin.site.register(models.CartOrder)
admin.site.register(models.CartOrderItem)
admin.site.register(models.Certificate)
admin.site.register(models.CompletedLesson)
admin.site.register(models.EnrolledCourse)
admin.site.register(models.Note)
admin.site.register(models.Review)
admin.site.register(models.Notification)
admin.site.register(models.Coupon)
admin.site.register(models.Wishlist)
admin.site.register(models.Country)
class CustomAdminSite(admin.AdminSite):
    site_header = "DevBook Admin Dashboard"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(path('dashboard/', self.admin_view(views.AdminDashboardView.as_view()), name="admin_dashboard"),), name="admin_dashboard"),
        ]
        return custom_urls + urls

admin_site = CustomAdminSite(name='custom_admin')

# Register your models here
admin_site.register(models.Course)
admin_site.register(models.Teacher)
# etc.