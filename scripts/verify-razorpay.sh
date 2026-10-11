#!/usr/bin/env bash
# Verify Razorpay test/live keys in backend/.env by creating a ₹1 test order.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/backend/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from backend/.env.example first."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${RAZORPAY_KEY_ID:-}" || -z "${RAZORPAY_KEY_SECRET:-}" ]]; then
  echo "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
  echo "Dashboard: https://dashboard.razorpay.com/app/keys (Test mode → Generate Key)"
  exit 1
fi

echo "Checking keys (${RAZORPAY_KEY_ID:0:12}...) against Razorpay API..."
RESP=$(curl -s -w "\n%{http_code}" -u "${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"INR","receipt":"bluestar-verify"}' \
  https://api.razorpay.com/v1/orders)

HTTP=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')

if [[ "$HTTP" == "200" ]]; then
  ORDER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
  echo "OK — Razorpay accepted the keys. Test order: ${ORDER_ID:-(created)}"
  echo "Restart the backend if it was running, then try Register → Submit & pay."
  exit 0
fi

echo "Razorpay API returned HTTP $HTTP"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
exit 1
