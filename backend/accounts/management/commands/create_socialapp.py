from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from decouple import config, Csv

class Command(BaseCommand):
    help = "Create Google SocialApp automatically for production"

    def handle(self, *args, **kwargs):
       

        site, created = Site.objects.get_or_create(
            id=1,
            defaults={
                "domain": "plagirism-websites.onrender.com",
                "name": "BRI Plagiarism Platform",
            },
        )

        if not created:
            site.domain = "plagirism-websites.onrender.com"
            site.name = "BRI Plagiarism Platform"
            site.save()

     

        app, created = SocialApp.objects.get_or_create(
            provider="google",
            name="Google OAuth",
            defaults={
                "client_id": config("GOOGLE_CLIENT_ID"),
                "secret": config("GOOGLE_CLIENT_SECRET"),
            },
        )

       
        app.client_id = config("GOOGLE_CLIENT_ID")
        app.secret = config("GOOGLE_CLIENT_SECRET")
        app.save()

        
        app.sites.clear()
        app.sites.add(site)

        self.stdout.write(
            self.style.SUCCESS(
                " Google SocialApp created/updated successfully!"
            )
        )