# Generated by Django 5.1.2 on 2024-10-27 01:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='profile_image',
            field=models.FileField(blank=True, default='user.png', null=True, upload_to='user_folder'),
        ),
    ]
