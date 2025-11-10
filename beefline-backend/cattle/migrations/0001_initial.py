# Generated migration file for cattle app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Cattle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('breed', models.CharField(choices=[('West African Shorthorn', 'West African Shorthorn'), ('Zebu', 'Zebu'), ('Sanga', 'Sanga')], max_length=50)),
                ('age', models.IntegerField(help_text='Age in months')),
                ('weight', models.DecimalField(decimal_places=2, help_text='Weight in kg', max_digits=6)),
                ('price', models.DecimalField(decimal_places=2, help_text='Price in GHS', max_digits=10)),
                ('health_notes', models.TextField(blank=True)),
                ('vaccination_status', models.BooleanField(default=False)),
                ('feeding_history', models.TextField(blank=True)),
                ('region', models.CharField(choices=[('Ashanti', 'Ashanti'), ('Brong-Ahafo', 'Brong-Ahafo'), ('Central', 'Central'), ('Eastern', 'Eastern'), ('Greater Accra', 'Greater Accra'), ('Northern', 'Northern'), ('Upper East', 'Upper East'), ('Upper West', 'Upper West'), ('Volta', 'Volta'), ('Western', 'Western'), ('Northern Savannah', 'Northern Savannah'), ('Bono East', 'Bono East'), ('Ahafo', 'Ahafo'), ('Oti', 'Oti'), ('Western North', 'Western North'), ('North East', 'North East')], max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cattle_listings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Cattle',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='HealthDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document', models.FileField(upload_to='health_documents/')),
                ('document_type', models.CharField(choices=[('health_certificate', 'Health Certificate'), ('vaccination_record', 'Vaccination Record')], max_length=50)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('cattle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='health_certificates', to='cattle.cattle')),
            ],
            options={
                'ordering': ['-uploaded_at'],
            },
        ),
        migrations.CreateModel(
            name='CattleImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='cattle_images/')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='cattle_thumbnails/')),
                ('caption', models.CharField(blank=True, max_length=200)),
                ('is_primary', models.BooleanField(default=False)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('cattle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='cattle.cattle')),
            ],
            options={
                'ordering': ['-is_primary', 'uploaded_at'],
            },
        ),
        migrations.AddIndex(
            model_name='cattle',
            index=models.Index(fields=['breed', 'region'], name='cattle_catt_breed_c8e8e5_idx'),
        ),
        migrations.AddIndex(
            model_name='cattle',
            index=models.Index(fields=['price'], name='cattle_catt_price_9e8f8a_idx'),
        ),
        migrations.AddIndex(
            model_name='cattle',
            index=models.Index(fields=['-created_at'], name='cattle_catt_created_7a8b9c_idx'),
        ),
    ]
