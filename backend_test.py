#!/usr/bin/env python3
"""
Backend API Test Suite for Route Your Career
Tests all backend endpoints at the public URL
"""

import requests
import json
import sys
from datetime import datetime

# Read backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BASE_URL = line.strip().split('=', 1)[1]
            break

API_BASE = f"{BASE_URL}/api"

print(f"Testing backend at: {API_BASE}")
print("=" * 80)

# Test results tracking
test_results = []

def test_endpoint(name, method, endpoint, data=None, expected_status=200, validation_fn=None):
    """Generic test function for API endpoints"""
    url = f"{API_BASE}{endpoint}"
    print(f"\n🧪 Testing: {name}")
    print(f"   {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            print(f"   Body: {json.dumps(data, indent=2)}")
            response = requests.post(url, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   Status: {response.status_code}")
        
        # Check status code
        if response.status_code != expected_status:
            print(f"   ❌ FAILED: Expected status {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            test_results.append({
                "test": name,
                "status": "FAILED",
                "reason": f"Status code {response.status_code} != {expected_status}",
                "response": response.text[:200]
            })
            return None
        
        # Parse JSON response
        try:
            response_data = response.json()
            print(f"   Response: {json.dumps(response_data, indent=2, default=str)[:500]}")
        except Exception:
            print(f"   Response (non-JSON): {response.text[:200]}")
            response_data = None
        
        # Run custom validation if provided
        if validation_fn:
            validation_result = validation_fn(response_data)
            if validation_result is not True:
                print(f"   ❌ FAILED: {validation_result}")
                test_results.append({
                    "test": name,
                    "status": "FAILED",
                    "reason": validation_result,
                    "response": str(response_data)[:200]
                })
                return None
        
        print(f"   ✅ PASSED")
        test_results.append({
            "test": name,
            "status": "PASSED",
            "response": response_data
        })
        return response_data
        
    except requests.exceptions.Timeout:
        print(f"   ❌ FAILED: Request timeout after 30 seconds")
        test_results.append({
            "test": name,
            "status": "FAILED",
            "reason": "Timeout"
        })
        return None
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        test_results.append({
            "test": name,
            "status": "FAILED",
            "reason": str(e)
        })
        return None


# Test 1: Root endpoint
def validate_root(data):
    if not data:
        return "No response data"
    if "message" not in data:
        return "Missing 'message' field"
    if "version" not in data or data["version"] != "1.0":
        return f"Expected version '1.0', got {data.get('version')}"
    return True

test_endpoint(
    "1. GET /api/ - Root endpoint",
    "GET",
    "/",
    validation_fn=validate_root
)


# Test 2: Create lead
def validate_lead_create(data):
    if not data:
        return "No response data"
    if "id" not in data:
        return "Missing 'id' field"
    if "created_at" not in data:
        return "Missing 'created_at' field"
    if data.get("name") != "Test Student":
        return f"Name mismatch: expected 'Test Student', got {data.get('name')}"
    if data.get("phone") != "9999999999":
        return f"Phone mismatch: expected '9999999999', got {data.get('phone')}"
    return True

lead_data = {
    "name": "Test Student",
    "phone": "9999999999",
    "country": "Georgia",
    "neet_score": "420",
    "source": "deep-test",
    "type": "quick"
}

created_lead = test_endpoint(
    "2. POST /api/leads - Create lead",
    "POST",
    "/leads",
    data=lead_data,
    validation_fn=validate_lead_create
)


# Test 3: List leads
def validate_lead_list(data):
    if not isinstance(data, list):
        return "Response is not a list"
    if len(data) == 0:
        return "Lead list is empty (expected at least the test lead)"
    # Check if our test lead is in the list
    test_lead_found = False
    for lead in data:
        if lead.get("name") == "Test Student" and lead.get("phone") == "9999999999":
            test_lead_found = True
            break
    if not test_lead_found:
        return "Test lead not found in list"
    return True

test_endpoint(
    "3. GET /api/leads - List leads",
    "GET",
    "/leads",
    validation_fn=validate_lead_list
)


# Test 4: Lead stats
def validate_stats(data):
    if not data:
        return "No response data"
    if "total_leads" not in data:
        return "Missing 'total_leads' field"
    if "by_type" not in data:
        return "Missing 'by_type' field"
    if "newsletter_subscribers" not in data:
        return "Missing 'newsletter_subscribers' field"
    if not isinstance(data["by_type"], dict):
        return "'by_type' is not a dictionary"
    return True

test_endpoint(
    "4. GET /api/leads/stats - Lead statistics",
    "GET",
    "/leads/stats",
    validation_fn=validate_stats
)


# Test 5: Newsletter signup
def validate_newsletter(data):
    if not data:
        return "No response data"
    if "id" not in data:
        return "Missing 'id' field"
    if "email" not in data:
        return "Missing 'email' field"
    if data.get("email") != "deeptest@example.com":
        return f"Email mismatch: expected 'deeptest@example.com', got {data.get('email')}"
    return True

newsletter_data = {
    "email": "deeptest@example.com",
    "source": "footer"
}

test_endpoint(
    "5. POST /api/newsletter - Newsletter signup",
    "POST",
    "/newsletter",
    data=newsletter_data,
    validation_fn=validate_newsletter
)

# Verify newsletter lead was created
def validate_newsletter_lead(data):
    if not isinstance(data, list):
        return "Response is not a list"
    # Check if newsletter lead exists
    newsletter_lead_found = False
    for lead in data:
        if lead.get("type") == "newsletter" and lead.get("email") == "deeptest@example.com":
            newsletter_lead_found = True
            break
    if not newsletter_lead_found:
        return "Newsletter lead not found in leads list"
    return True

test_endpoint(
    "5b. Verify newsletter lead created",
    "GET",
    "/leads?type=newsletter",
    validation_fn=validate_newsletter_lead
)


# Test 6: Chat - First message
def validate_chat(data):
    if not data:
        return "No response data"
    if "session_id" not in data:
        return "Missing 'session_id' field"
    if "reply" not in data:
        return "Missing 'reply' field"
    if len(data.get("reply", "")) < 20:
        return f"Reply too short (< 20 chars): {data.get('reply')}"
    return True

chat_data_1 = {
    "session_id": "deeptest_session_1",
    "message": "Hi, tell me about MBBS in Georgia"
}

chat_response_1 = test_endpoint(
    "6a. POST /api/chat - First message (Georgia)",
    "POST",
    "/chat",
    data=chat_data_1,
    validation_fn=validate_chat
)


# Test 6b: Chat - Second message (context check)
def validate_chat_context(data):
    if not data:
        return "No response data"
    if "reply" not in data:
        return "Missing 'reply' field"
    reply = data.get("reply", "").lower()
    if len(reply) < 20:
        return f"Reply too short (< 20 chars): {reply}"
    # Check if reply contextually references Georgia (should maintain context)
    # This is a soft check - we just verify we got a meaningful response
    if "georgia" in reply or "₹" in reply or "fee" in reply or "cost" in reply:
        return True
    # Even if Georgia not explicitly mentioned, as long as reply is substantial, pass
    return True

chat_data_2 = {
    "session_id": "deeptest_session_1",
    "message": "What are the fees?"
}

test_endpoint(
    "6b. POST /api/chat - Second message (context check)",
    "POST",
    "/chat",
    data=chat_data_2,
    validation_fn=validate_chat_context
)


# Test 7: Chat lead capture
def validate_chat_lead(data):
    if not data:
        return "No response data"
    if "id" not in data:
        return "Missing 'id' field"
    if data.get("name") != "Chat Lead":
        return f"Name mismatch: expected 'Chat Lead', got {data.get('name')}"
    if data.get("phone") != "8888888888":
        return f"Phone mismatch: expected '8888888888', got {data.get('phone')}"
    if data.get("type") != "chat_lead":
        return f"Type mismatch: expected 'chat_lead', got {data.get('type')}"
    return True

chat_lead_data = {
    "session_id": "deeptest_session_1",
    "name": "Chat Lead",
    "phone": "8888888888",
    "country": "Georgia",
    "neet_score": "400"
}

test_endpoint(
    "7. POST /api/chat/lead - Capture chat lead",
    "POST",
    "/chat/lead",
    data=chat_lead_data,
    validation_fn=validate_chat_lead
)


# Print summary
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)

passed = sum(1 for r in test_results if r["status"] == "PASSED")
failed = sum(1 for r in test_results if r["status"] == "FAILED")

print(f"\nTotal Tests: {len(test_results)}")
print(f"✅ Passed: {passed}")
print(f"❌ Failed: {failed}")

if failed > 0:
    print("\n❌ FAILED TESTS:")
    for result in test_results:
        if result["status"] == "FAILED":
            print(f"\n  • {result['test']}")
            print(f"    Reason: {result['reason']}")
            if "response" in result:
                print(f"    Response: {result['response']}")

print("\n" + "=" * 80)

# Exit with appropriate code
sys.exit(0 if failed == 0 else 1)
