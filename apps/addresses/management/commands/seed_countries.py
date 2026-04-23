import csv
import os
from django.core.management.base import BaseCommand
from apps.addresses.models import Country
from django.conf import settings

class Command(BaseCommand):
    help = 'Seed countries from CSV file'

    def handle(self, *args, **options):
        csv_file_path = os.path.join(settings.BASE_DIR, 'apps', 'addresses', 'fixtures', 'country code.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Seeding from {csv_file_path}...'))

        Country.objects.all().delete()

        # On utilise utf-8-sig pour gérer le BOM
        with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                try:
                    # Nettoyage des noms de colonnes et valeurs
                    name = row.get('Nom', '').strip()
                    iso2 = row.get('ISO 3166-1 (A-2)', '').strip()
                    
                    if not name or not iso2:
                        continue

                    Country.objects.create(
                        name=name,
                        sovereignty=row.get('Souverainté', '').strip(),
                        iso2=iso2,
                        iso3=row.get('ISO 3166-1 (A-3)', '').strip(),
                        iso_num=int(row['ISO 3166-1 (NUM)']) if row.get('ISO 3166-1 (NUM)', '').isdigit() else None,
                        subdivision_code=row.get('sub divisiob code', '').strip(),
                        tld=row.get('contry code top level domain', '').strip()
                    )
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Error seeding row: {e}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} countries.'))
