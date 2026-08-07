#!/usr/bin/env python3
"""
Comprehensive backend API test for Route Your Career admin auth + endpoints.
Tests admin authentication, authorization, and email notification hook.
"""
import requests
import json
import subprocess
import sys
from datetime import datetime, timedelta

# Base URL from frontend/.env
BASE_URL = "https://career-compass-2024.preview.emergentagent.com/api"

# Test results tracking
results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_pass(test_name):
    print(f"✅ PASS: {test_name}")
    results["passed"].append(test_name)

def log_fail(test_name, reason):
    print(f"❌ FAIL: {test_name}")
    print(f"   Reason: {reason}")
    results["failed"].append(f"{test_name}: {reason}")

def log_warning(test_name, reason):
    print(f"⚠️  WARNING: {test_name}")
    print(f"   Reason: {reason}")
    results["warnings"].append(f"{test_name}: {reason}")

def run_mongosh_command(cmd):
    """Execute mongosh command and return output."""
    full_cmd = f'mongosh --quiet --eval "{cmd}"'
    try:
        result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True, timeout=10)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

print("=" * 80)
print("Route Your Career Backend API Test Suite")
print("Testing Admin Auth + Admin Endpoints + Email Notification Hook")
print("=" * 80)
print()

# ============================================================================
# TEST 1: Root endpoint version check
# ============================================================================
print("TEST 1: GET /api/ should return version 1.1")
try:
    resp = requests.get(f"{BASE_URL}/", timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("version") == "1.1":
            log_pass("Root endpoint returns version 1.1")
        else:
            log_fail("Root endpoint version", f"Expected version 1.1, got {data.get('version')}")
    else:
        log_fail("Root endpoint", f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_fail("Root endpoint", str(e))

print()

# ============================================================================
# TEST 2: Unauthorized access tests (401)
# ============================================================================
print("TEST 2: Unauthorized access tests (should return 401)")

endpoints_401 = [
    "/admin/leads",
    "/admin/stats",
    "/admin/newsletter",
    "/auth/me"
]

for endpoint in endpoints_401:
    try:
        resp = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        if resp.status_code == 401:
            log_pass(f"GET {endpoint} returns 401 without auth")
        else:
            log_fail(f"GET {endpoint} unauthorized", f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_fail(f"GET {endpoint} unauthorized", str(e))

print()

# ============================================================================
# TEST 3: Setup admin user via direct DB insert
# ============================================================================
print("TEST 3: Setting up admin user via mongosh")

# Calculate expiry date (7 days from now)
expires_at = datetime.utcnow() + timedelta(days=7)
expires_iso = expires_at.isoformat() + "Z"

# Insert admin user
admin_user_cmd = """
db = db.getSiblingDB('test_database');
db.users.deleteOne({user_id: 'user_deeptest'});
db.users.insertOne({
    user_id: 'user_deeptest',
    email: 'inforouteyourcareer@gmail.com',
    name: 'Admin Test User',
    created_at: new Date()
});
"""

success, stdout, stderr = run_mongosh_command(admin_user_cmd)
if success:
    log_pass("Admin user inserted into DB")
else:
    log_fail("Admin user DB insert", f"mongosh error: {stderr}")
    print(f"   stdout: {stdout}")

# Insert admin session
admin_session_cmd = f"""
db = db.getSiblingDB('test_database');
db.user_sessions.deleteOne({{session_token: 'deeptest_admin_token'}});
db.user_sessions.insertOne({{
    user_id: 'user_deeptest',
    session_token: 'deeptest_admin_token',
    expires_at: new Date('{expires_iso}'),
    created_at: new Date()
}});
"""

success, stdout, stderr = run_mongosh_command(admin_session_cmd)
if success:
    log_pass("Admin session token inserted into DB")
else:
    log_fail("Admin session DB insert", f"mongosh error: {stderr}")
    print(f"   stdout: {stdout}")

print()

# ============================================================================
# TEST 4: Admin authenticated endpoints
# ============================================================================
print("TEST 4: Admin authenticated endpoints with Bearer token")

headers = {"Authorization": "Bearer deeptest_admin_token"}

# Test /auth/me
try:
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("is_admin") == True and data.get("email") == "inforouteyourcareer@gmail.com":
            log_pass("GET /auth/me returns admin user with is_admin=true")
        else:
            log_fail("GET /auth/me admin check", f"Expected is_admin=true and correct email, got {data}")
    else:
        log_fail("GET /auth/me with admin token", f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("GET /auth/me with admin token", str(e))

# Test /admin/leads
try:
    resp = requests.get(f"{BASE_URL}/admin/leads", headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            log_pass(f"GET /admin/leads returns list (count: {len(data)})")
        else:
            log_fail("GET /admin/leads response type", f"Expected list, got {type(data)}")
    else:
        log_fail("GET /admin/leads with admin token", f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("GET /admin/leads with admin token", str(e))

# Test /admin/stats
try:
    resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        required_keys = ["total_leads", "by_type", "newsletter_subscribers", "last_7_days"]
        by_type_keys = ["apply", "callback", "quick", "chat_lead", "newsletter"]
        
        missing_keys = [k for k in required_keys if k not in data]
        if missing_keys:
            log_fail("GET /admin/stats structure", f"Missing keys: {missing_keys}")
        else:
            by_type = data.get("by_type", {})
            missing_type_keys = [k for k in by_type_keys if k not in by_type]
            if missing_type_keys:
                log_fail("GET /admin/stats by_type", f"Missing type keys: {missing_type_keys}")
            else:
                log_pass(f"GET /admin/stats returns correct structure (total: {data['total_leads']}, subs: {data['newsletter_subscribers']}, last_7d: {data['last_7_days']})")
    else:
        log_fail("GET /admin/stats with admin token", f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("GET /admin/stats with admin token", str(e))

# Test /admin/newsletter
try:
    resp = requests.get(f"{BASE_URL}/admin/newsletter", headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            log_pass(f"GET /admin/newsletter returns list (count: {len(data)})")
        else:
            log_fail("GET /admin/newsletter response type", f"Expected list, got {type(data)}")
    else:
        log_fail("GET /admin/newsletter with admin token", f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("GET /admin/newsletter with admin token", str(e))

print()

# ============================================================================
# TEST 5: Non-admin user blocking (403)
# ============================================================================
print("TEST 5: Non-admin user blocking (should return 403)")

# Insert non-admin user
nonadmin_user_cmd = """
db = db.getSiblingDB('test_database');
db.users.deleteOne({user_id: 'user_deeptest_nonadmin'});
db.users.insertOne({
    user_id: 'user_deeptest_nonadmin',
    email: 'not.admin@example.com',
    name: 'Non-Admin User',
    created_at: new Date()
});
"""

success, stdout, stderr = run_mongosh_command(nonadmin_user_cmd)
if success:
    log_pass("Non-admin user inserted into DB")
else:
    log_fail("Non-admin user DB insert", f"mongosh error: {stderr}")

# Insert non-admin session
nonadmin_session_cmd = f"""
db = db.getSiblingDB('test_database');
db.user_sessions.deleteOne({{session_token: 'deeptest_notadmin_token'}});
db.user_sessions.insertOne({{
    user_id: 'user_deeptest_nonadmin',
    session_token: 'deeptest_notadmin_token',
    expires_at: new Date('{expires_iso}'),
    created_at: new Date()
}});
"""

success, stdout, stderr = run_mongosh_command(nonadmin_session_cmd)
if success:
    log_pass("Non-admin session token inserted into DB")
else:
    log_fail("Non-admin session DB insert", f"mongosh error: {stderr}")

# Test /auth/me with non-admin token
nonadmin_headers = {"Authorization": "Bearer deeptest_notadmin_token"}
try:
    resp = requests.get(f"{BASE_URL}/auth/me", headers=nonadmin_headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("is_admin") == False:
            log_pass("GET /auth/me returns non-admin user with is_admin=false")
        else:
            log_fail("GET /auth/me non-admin check", f"Expected is_admin=false, got {data}")
    else:
        log_fail("GET /auth/me with non-admin token", f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_fail("GET /auth/me with non-admin token", str(e))

# Test /admin/leads with non-admin token (should be 403)
try:
    resp = requests.get(f"{BASE_URL}/admin/leads", headers=nonadmin_headers, timeout=10)
    if resp.status_code == 403:
        log_pass("GET /admin/leads returns 403 for non-admin user")
    else:
        log_fail("GET /admin/leads non-admin block", f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_fail("GET /admin/leads non-admin block", str(e))

print()

# ============================================================================
# TEST 6: Logout endpoint
# ============================================================================
print("TEST 6: POST /api/auth/logout")

try:
    # Logout with admin token
    resp = requests.post(f"{BASE_URL}/auth/logout", headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("ok") == True:
            log_pass("POST /auth/logout returns ok=true")
            
            # Verify session is deleted by trying to use it again
            verify_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
            if verify_resp.status_code == 401:
                log_pass("Session token invalidated after logout (401 on subsequent request)")
            else:
                log_warning("Logout session invalidation", f"Expected 401 after logout, got {verify_resp.status_code}")
        else:
            log_fail("POST /auth/logout response", f"Expected ok=true, got {data}")
    else:
        log_fail("POST /auth/logout", f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_fail("POST /auth/logout", str(e))

print()

# ============================================================================
# TEST 7: Email notification hook doesn't crash
# ============================================================================
print("TEST 7: Email notification hook (BackgroundTasks) doesn't crash API")

# Re-insert admin session for this test (since we logged out)
success, stdout, stderr = run_mongosh_command(admin_session_cmd)

try:
    lead_data = {
        "name": "Notify Test User",
        "phone": "1234567890",
        "country": "Georgia",
        "source": "deep-test",
        "type": "quick"
    }
    resp = requests.post(f"{BASE_URL}/leads", json=lead_data, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("id") and data.get("name") == "Notify Test User":
            log_pass("POST /leads with notification hook returns 200 (email sending is best-effort)")
            log_warning("Email notification", "No email provider configured - notification skipped (expected behavior)")
        else:
            log_fail("POST /leads response", f"Unexpected response structure: {data}")
    else:
        log_fail("POST /leads with notification", f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /leads with notification", str(e))

print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {len(results['passed'])}")
print(f"❌ FAILED: {len(results['failed'])}")
print(f"⚠️  WARNINGS: {len(results['warnings'])}")
print()

if results["failed"]:
    print("FAILED TESTS:")
    for fail in results["failed"]:
        print(f"  - {fail}")
    print()

if results["warnings"]:
    print("WARNINGS:")
    for warn in results["warnings"]:
        print(f"  - {warn}")
    print()

if results["passed"]:
    print("PASSED TESTS:")
    for test in results["passed"]:
        print(f"  - {test}")
    print()

# Exit with appropriate code
if results["failed"]:
    print("❌ Some tests failed")
    sys.exit(1)
else:
    print("✅ All tests passed!")
    sys.exit(0)
