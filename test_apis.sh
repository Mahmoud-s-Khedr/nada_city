#!/bin/bash
echo "=== 1. Testing Register API ==="
EMAIL="testuser$(date +%s)@nadacity.cloud"
REGISTER_RES=$(curl -s -X POST https://api.nadacity.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\", \"email\":\"$EMAIL\", \"password\":\"password123\", \"phone\":\"1234567890\", \"address\":\"Test Address\"}")
echo "$REGISTER_RES" | jq . || echo "$REGISTER_RES"
echo ""

echo "=== 2. Testing Login API for Admin ==="
LOGIN_RES=$(curl -s -X POST https://api.nadacity.cloud/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nadacity.cloud", "password":"kljdaslhdfla!"}')
echo "$LOGIN_RES" | jq . || echo "$LOGIN_RES"
echo ""

TOKEN=$(echo "$LOGIN_RES" | jq -r '.data.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "=== 3. Testing Upload (presigned-url) API ==="
  UPLOAD_RES=$(curl -s -X POST https://api.nadacity.cloud/api/v1/storage/presigned-url \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"filename":"test.jpg", "contentType":"image/jpeg", "operation":"put"}')
  echo "$UPLOAD_RES" | jq . || echo "$UPLOAD_RES"
else
  echo "Failed to get admin token. Cannot test upload API."
fi
