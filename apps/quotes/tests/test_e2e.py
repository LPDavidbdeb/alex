import pytest
import requests
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.quotes.models import QuoteRequest, EquipmentType
from apps.addresses.models import Address

User = get_user_model()

@pytest.mark.django_db
class TestQuoteEndToEnd:
    """
    End-to-End test that validates the full flow using an isolated TEST database.
    Pytest-django automatically handles the creation and destruction of the test DB.
    """
    
    @pytest.fixture(autouse=True)
    def setup_data(self):
        # Create mandatory groups and initial data in the TEST database
        Group.objects.get_or_create(name='Client')
        Group.objects.get_or_create(name='Employé')
        self.eq_type, _ = EquipmentType.objects.get_or_create(name="Dry Van", label_fr="Dry Van")
        
        # Create admin user for private API access
        self.admin = User.objects.create_superuser(
            email='admin_test@rmlogistic.com', 
            password='AdminPassword123!'
        )
        self.admin.groups.add(Group.objects.get(name='Employé'))

    def test_full_submission_and_retrieval_integrity(self, client):
        # 1. Simulate Public Submission
        # Note: We use the django test client which directly hits the app logic 
        # but respects the Pydantic schemas of Ninja.
        
        customer_email = "test-customer@example.com"
        payload = {
            "first_name": "Jean-Pierre",
            "last_name": "Acceptance",
            "email": customer_email,
            "phone": "514-999-8888",
            "equipment_type_ids": [self.eq_type.id],
            "pick_up_address": {
                "label": "Montreal Start",
                "latitude": 45.5,
                "longitude": -73.5,
                "source": "OSM",
                "raw_json": {"city": "Montreal"},
                "country_ref_id": None
            },
            "final_drop_address": {
                "label": "Toronto End",
                "latitude": 43.6,
                "longitude": -79.3,
                "source": "OSM",
                "raw_json": {"city": "Toronto"},
                "country_ref_id": None
            },
            "is_multi_drop": True,
            "special_instructions": "Handle with care",
            "agreed_to_terms": True
        }

        # Submit via public endpoint
        response = client.post(
            "/api/quotes/",
            data=payload,
            content_type="application/json"
        )
        
        assert response.status_code == 200
        quote_uuid = response.json()['uuid']
        
        # 2. Verify Database side effects
        assert User.objects.filter(email=customer_email).exists()
        customer_user = User.objects.get(email=customer_email)
        assert customer_user.groups.filter(name='Client').exists()
        assert Address.objects.count() == 2
        
        # 3. Private Retrieval Verification
        # Login to get token
        login_resp = client.post(
            "/api/auth/token",
            data={"email": 'admin_test@rmlogistic.com', "password": 'AdminPassword123!'},
            content_type="application/json"
        )
        token = login_resp.json()['access']
        
        # Call private list endpoint
        list_resp = client.get(
            "/api/quotes/list",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        assert list_resp.status_code == 200
        quotes = list_resp.json()
        
        # Find our quote
        match = next((q for q in quotes if q['uuid'] == quote_uuid), None)
        assert match is not None
        
        # Get details
        detail_resp = client.get(
            f"/api/quotes/{match['id']}",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        data = detail_resp.json()
        
        # Integrity Assertions
        assert data['quote']['first_name'] == "Jean-Pierre"
        assert data['quote']['pick_up_address']['label'] == "Montreal Start"
        assert len(data['quote']['equipment_types']) == 1
        assert data['quote']['equipment_types'][0]['name'] == "Dry Van"
        assert data['quote']['pick_up_address']['raw_json']['city'] == "Montreal"
        
        # Verify Context History
        assert 'client_history' in data
        assert len(data['client_history']) >= 1
        assert data['client_history'][0]['uuid'] == quote_uuid
