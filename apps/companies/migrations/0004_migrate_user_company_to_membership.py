from django.db import migrations

def migrate_company_to_membership(apps, schema_editor):
    User = apps.get_model('users', 'User')
    UserCompanyMembership = apps.get_model('companies', 'UserCompanyMembership')
    
    for user in User.objects.filter(company__isnull=False):
        UserCompanyMembership.objects.get_or_create(
            user=user,
            company=user.company,
            defaults={
                'role_in_company': 'EMPLOYEE',
                'is_primary': True,
                'is_active': True
            }
        )

def reverse_migrate(apps, schema_editor):
    pass # On ne supprime pas les memberships en cas de rollback car User.company existe encore

class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0003_usercompanymembership'),
        ('users', '0002_user_company'),
    ]

    operations = [
        migrations.RunPython(migrate_company_to_membership, reverse_migrate),
    ]
