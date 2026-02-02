# Migration Guide: Subscription → Fulfillment Platform

## Problem
Your existing Supabase database has the old subscription-based schema with policies that conflict with the new fulfillment platform schema.

## Solution
Use the migration script instead of the fresh schema file.

---

## Step-by-Step Migration

### 1. Backup Your Data (Important!)
Before running any migration, backup your existing data:

```sql
-- In Supabase SQL Editor, export your data
SELECT * FROM users;
SELECT * FROM subscriptions;
SELECT * FROM orders;
```

### 2. Run the Migration Script
In Supabase SQL Editor, run **`supabase-migration.sql`** instead of `supabase-schema.sql`.

This script will:
- ✅ Drop conflicting policies
- ✅ Add new columns to existing tables
- ✅ Create new tables (pending_orders, admin_alerts)
- ✅ Migrate existing order data
- ✅ Create new policies for the fulfillment platform
- ✅ Keep subscriptions table for backward compatibility

### 3. Verify Migration
Check that new columns exist:

```sql
-- Should show new columns: email, domains, nameservers, dns_status, etc.
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';

-- Should return data
SELECT * FROM pending_orders LIMIT 1;
SELECT * FROM admin_alerts LIMIT 1;
```

### 4. Update Environment Variables
Make sure your `.env` has all required variables from `.env.example`:

```bash
# New variables needed:
PLUGSAAS_API_KEY=
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
CRON_SECRET=
```

---

## What Changes in Your Database

### Users Table
**Before:**
```
id (TEXT), email, created_at
```

**After:**
```
id (UUID), email, phone, created_at
```

### Orders Table
**Before:**
```
id, user_id, subscription_id, status, created_at
```

**After:**
```
id, user_id, subscription_id (kept for compatibility),
email, phone, stripe_customer_id, stripe_payment_intent_id,
domain_count, domains (JSONB), total_amount,
status, fulfillment_status, fulfillment_error,
fulfillment_results (JSONB), nameservers (JSONB),
dns_status, dns_last_checked, retry_count,
created_at, updated_at
```

### New Tables
- `pending_orders` - Orders before payment
- `admin_alerts` - Low inventory, errors, notifications

---

## Rollback Plan

If something goes wrong, you can restore from backup:

```sql
-- Drop new tables
DROP TABLE IF EXISTS pending_orders CASCADE;
DROP TABLE IF EXISTS admin_alerts CASCADE;

-- Restore from your backup
-- (Re-insert your backed up data)
```

---

## After Migration

1. **Test the order flow:**
   - Go to `/order`
   - Create a test order
   - Check it appears in dashboard

2. **Test fulfillment:**
   - Configure Google Sheets inventory
   - Make a test payment
   - Check webhook processes correctly

3. **Set up DNS cron:**
   - Add to `vercel.json` or external cron service
   - Test with manual trigger

---

## Need Help?

If migration fails:
1. Check Supabase logs for specific error
2. Verify all existing data is backed up
3. Run migration script line-by-line to identify issue
4. Contact support with error message
