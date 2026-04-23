import pytest
from apps.companies.models import Company
from apps.addresses.models import Address

@pytest.mark.django_db
class TestCompanyModel:
    def test_create_hierarchy(self):
        # Create a Banner
        banner = Company.objects.create(
            name="COSTCO",
            company_type="BANNER",
            is_billing_center=True
        )
        
        # Create a Branch
        branch = Company.objects.create(
            name="Costco Longueuil",
            company_type="BRANCH",
            parent=banner,
            is_billing_center=False
        )
        
        assert branch.parent == banner
        assert banner.branches.count() == 1
        assert banner.is_billing_center is True

    def test_independent_company(self):
        independent = Company.objects.create(
            name="9999-9999 Quebec Inc",
            company_type="INDEPENDENT"
        )
        assert independent.parent is None
        assert independent.company_type == "INDEPENDENT"

    def test_company_str(self):
        c = Company(name="Test Unit", company_type="BRANCH")
        # Le format attendu est "Test Unit (Succursale / Magasin)"
        assert "Test Unit" in str(c)
        assert "Succursale" in str(c)
