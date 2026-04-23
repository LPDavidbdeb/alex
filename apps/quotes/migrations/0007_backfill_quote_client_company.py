from django.db import migrations

def backfill_company(apps, schema_editor):
    QuoteRequest = apps.get_model('quotes', 'QuoteRequest')
    UserCompanyMembership = apps.get_model('companies', 'UserCompanyMembership')
    
    for quote in QuoteRequest.objects.filter(client__isnull=False):
        # 1. On cherche d'abord la company liée au user directement (legacy)
        if quote.client.company:
            quote.client_company = quote.client.company
        else:
            # 2. Sinon on cherche son affiliation primaire
            membership = UserCompanyMembership.objects.filter(
                user=quote.client, is_primary=True, is_active=True
            ).first()
            if membership:
                quote.client_company = membership.company
        
        if quote.client_company:
            quote.save()

def reverse_backfill(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0006_remove_quoterequest_assigned_employee_and_more'),
        ('companies', '0004_migrate_user_company_to_membership'),
    ]

    operations = [
        migrations.RunPython(backfill_company, reverse_backfill),
    ]
