from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

class User(AbstractUser):
    username = models.CharField(unique=True, max_length=50)
    email = models.EmailField(unique=True)
    name = models.CharField(unique=True, max_length=50) #
    otp = models.CharField(max_length=100, null=True, blank=True)
    refresh_token = models.CharField(max_length=1000, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        email_username, name = self.email.split("@")
        if self.name == "" or self.name == None:
            self.name = email_username
        if self.username == "" or self.username == None:
            self.username = email_username
        super(User, self).save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.FileField(upload_to="user_folder", default="user.png", null=True, blank=True) #
    name = models.CharField(max_length=50)
    country = models.CharField(max_length=50, null=True, blank=True)
    about_me = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.name:
            return str(self.name)
        else:
            return str(self.user.name)
        
    
    def save(self, *args, **kwargs):
        if self.name == "" or self.name == None:
            self.name = self.user.username
        super(Profile, self).save(*args, **kwargs)

        from api.models import Teacher

        try:
            teacher = Teacher.objects.get(user=self.user)
            teacher.name = self.name
            teacher.profile_image = self.profile_image
            teacher.country = self.country
            teacher.about_me = self.about_me
            teacher.save()
        except Teacher.DoesNotExist:
            pass


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)