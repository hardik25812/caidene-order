# Testing Guide - No Payment Required

## Quick Start: Test Without Payment

### Step 1: Run Inventory Schema

Go to Supabase SQL Editor and run:
```sql
-- Copy entire content from supabase-inventory-schema.sql
```

This creates the `inventory` table with 3 sample accounts.

### Step 2: Add Real Microsoft 365 Accounts

**Option A: Via Admin Panel (Recommended)**
1. Visit: http://localhost:3000/admin/inventory
2. Create a CSV file:
   ```csv
   email,password,notes
   account1@outlook.com,YourPassword123,Production
   account2@outlook.com,YourPassword456,Production
   ```
3. Upload the CSV file

**Option B: Via SQL**
```sql
INSERT INTO inventory (email, password, status, notes) VALUES
  ('your-account@outlook.com', 'your-password', 'available', 'Test account');
```

### Step 3: Test Fulfillment

**Option A: Via Test Page (Easiest)**
1. Visit: http://localhost:3000/test
2. Fill in the form
3. Click "Run Test Fulfillment"
4. View results instantly

**Option B: Via API**
```bash
curl -X POST http://localhost:3000/api/test/fulfillment \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+1234567890",
    "domains": [{
      "domain": "testdomain.com",
      "forwardingUrl": "https://example.com",
      "names": [
        {"firstName": "John", "lastName": "Doe"}
      ]
    }]
  }'
```

**Option C: Via Node Script**
```bash
node test-fulfillment.js
```

### Step 4: Verify Results

1. **Check Dashboard**: http://localhost:3000/dashboard
   - See the test order
   - View nameservers (if PlugSaaS API worked)

2. **Check Inventory**: http://localhost:3000/admin/inventory
   - Account status changed from "Available" → "Assigned"
   - Customer email and domain populated

3. **Check Database**: Supabase → Table Editor → `orders`
   - New order created
   - `fulfillment_status` = "completed" or "partial"
   - `fulfillment_results` contains details

---

## What Gets Tested

✅ Inventory retrieval from Supabase
✅ Account reservation
✅ PlugSaaS API integration (addOrder, getNameservers)
✅ Account assignment
✅ Order creation and updates
✅ Retry logic (if API fails)
✅ Rollback logic (if fulfillment fails)
✅ Low inventory alerts

---

## Expected Flow

```
1. Test endpoint creates order in database
2. Gets available Microsoft account from inventory
3. Reserves the account
4. Calls PlugSaaS API to create order
5. Gets nameservers from PlugSaaS
6. Marks account as assigned
7. Updates order with nameservers
8. Returns success response
```

---

## Troubleshooting

### "No inventory available"
- Run inventory schema in Supabase
- Add accounts via admin panel or SQL

### "PlugSaaS API error"
- Check `PLUGSAAS_API_KEY` in .env
- Check `PLUGSAAS_CUSTOMER_ID` in .env
- Verify API key is valid

### "Supabase error"
- Check Supabase credentials in .env
- Verify tables exist (run migration)
- Check RLS policies allow service role access

### "Account not marked as assigned"
- Check inventory table in Supabase
- Look for `status = 'assigned'`
- Check `order_id` matches your test order

---

## Testing Real Payment Flow

Once testing works, you can test with real Stripe:

1. Use Stripe test mode
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC

This will trigger the real webhook flow with payment.

---

## Next Steps After Testing

1. ✅ Test fulfillment works
2. Configure Stripe webhook (after deploy)
3. Generate `CRON_SECRET` for DNS verification
4. Deploy to production
5. Add real Microsoft 365 accounts
