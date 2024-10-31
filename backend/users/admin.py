from django.contrib import admin
from users.models import User, Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'date']

admin.site.register(User)
admin.site.register(Profile, ProfileAdmin)