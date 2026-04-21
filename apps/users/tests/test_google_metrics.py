import pytest
from unittest.mock import patch, MagicMock
from apps.users.services.google_service import GoogleService

@pytest.mark.django_db
class TestGoogleServiceMetrics:
    @patch('google.cloud.monitoring_v3.MetricServiceClient')
    def test_get_usage_metrics_success(self, mock_monitoring_client_class):
        # Mocking monitoring client response
        mock_client = MagicMock()
        mock_monitoring_client_class.return_value = mock_client
        
        # Mock time series results
        mock_point = MagicMock()
        mock_point.value.int64_value = 42
        
        mock_ts = MagicMock()
        mock_ts.points = [mock_point]
        
        mock_client.list_time_series.return_value = [mock_ts]
        
        service = GoogleService(project_number="635779537244")
        result = service.get_usage_metrics()
        
        assert result['status'] == 'success'
        assert result['request_count'] == 42
        assert result['tracked_locally'] is False
