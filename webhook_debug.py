#!/usr/bin/env python3
"""
Simple webhook test to debug the issue
"""

import requests
import json

BASE_URL = "https://deliveron-pay.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_simple_webhook():
    """Test webhook with minimal event"""
    print("Testing webhook with minimal event...")
    
    # Test with a simple event that doesn't require Stripe API calls
    mock_event = {
        "type": "customer.subscription.updated",
        "data": {
            "object": {
                "id": "sub_test_12345",
                "status": "active",
                "current_period_end": 1643723400  # Unix timestamp
            }
        }
    }
    
    try:
        response = requests.post(f"{API_BASE}/webhooks/stripe", 
                               json=mock_event,
                               headers={"Content-Type": "application/json"},
                               timeout=15)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_simple_webhook()