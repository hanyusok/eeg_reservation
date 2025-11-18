#!/bin/bash

# Test script for Admin API endpoints
# Make sure you're logged in as admin first

BASE_URL="http://localhost:3000"
SESSION_COOKIE="" # You'll need to set this after logging in

echo "🧪 Testing Admin Portal API Endpoints"
echo "======================================"
echo ""

# Test 1: Admin Stats
echo "1. Testing GET /api/admin/stats"
STATS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/admin/stats" \
  -H "Cookie: $SESSION_COOKIE")
HTTP_STATUS=$(echo "$STATS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$STATS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Stats endpoint working"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "❌ Stats endpoint failed (Status: $HTTP_STATUS)"
  echo "$BODY"
fi
echo ""

# Test 2: Patients List
echo "2. Testing GET /api/patients"
PATIENTS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/patients" \
  -H "Cookie: $SESSION_COOKIE")
HTTP_STATUS=$(echo "$PATIENTS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$PATIENTS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Patients endpoint working"
  PATIENT_COUNT=$(echo "$BODY" | jq '.patients | length' 2>/dev/null || echo "0")
  echo "Found $PATIENT_COUNT patients"
else
  echo "❌ Patients endpoint failed (Status: $HTTP_STATUS)"
  echo "$BODY"
fi
echo ""

# Test 3: Appointments List
echo "3. Testing GET /api/appointments"
APPOINTMENTS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/appointments" \
  -H "Cookie: $SESSION_COOKIE")
HTTP_STATUS=$(echo "$APPOINTMENTS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$APPOINTMENTS_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Appointments endpoint working"
  APPT_COUNT=$(echo "$BODY" | jq '.appointments | length' 2>/dev/null || echo "0")
  echo "Found $APPT_COUNT appointments"
else
  echo "❌ Appointments endpoint failed (Status: $HTTP_STATUS)"
  echo "$BODY"
fi
echo ""

echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "Note: To test with authentication, you need to:"
echo "1. Log in through the browser"
echo "2. Copy the session cookie from browser dev tools"
echo "3. Set SESSION_COOKIE variable in this script"

