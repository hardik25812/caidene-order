# Fulfillment Platform - Implementation Summary

## What's Been Built

### 1. Order Form (`/order`)
- **Single Entry Mode**: Add domains one by one with:
  - Domain name
  - Domain forwarding URL
  - 1-3 first/last names per domain
- **Bulk CSV Upload**: Upload CSV with multiple domains
  - Columns: `domain, forwarding, firstname1, lastname1, firstname2, lastname2, firstname3, lastname3`
  - Preview shows first 5 entries
- Dynamic pricing calculation based on domain count

### 2. Stripe Integration (One-Time Payment)
- Changed from subscription to one-time payment mode
- Stores order data in `pending_orders` table before payment
- Passes order ID through Stripe metadata

### 3. PlugSaaS API Integration (`lib/plugsaas.js`)
Full API client with methods for:
- `addOrder()` - Create new order
- `getNameservers()` - Get DNS nameservers
- `setupOrder()`, `onboardOrder()` - Order lifecycle
- `switchDomain()` - Domain management
- `addInboxProvider()`, `listInboxProviders()` - Inbox management
- Bulk operations and troubleshooting endpoints

### 4. Google Sheets Inventory (`lib/google-sheets.js`)
- **Sheet Structure**:
  - Column A: Microsoft Account Email
  - Column B: Password
  - Column C: Status (Available/Assigned/Reserved/Depleted)
  - Column D: Date Added
  - Column E-H: Order tracking info
- **Features**:
  - `getAvailableAccounts()` - Get unused accounts
  - `assignAccounts()` - Mark as used
  - `reserveAccounts()` - Temporary hold
  - `releaseAccounts()` - Release if order fails
  - `isInventoryLow()` - Check against threshold
  - `getStats()` - Inventory statistics

### 5. Automated Fulfillment Workflow
Triggered by Stripe webhook after payment:
1. Get Microsoft account from Google Sheets
2. Reserve the account
3. Create order in PlugSaaS API
4. Get nameservers from PlugSaaS
5. Mark account as assigned
6. Update order with nameserver info
7. Check inventory levels, send alert if low

### 6. Customer Dashboard (`/dashboard`)
- View all orders with fulfillment status
- **Nameserver Display** with copy-to-clipboard:
  - Copy individual nameservers
  - Copy all nameservers at once
- Status badges (Pending, Processing, Completed, Failed)
- Instructions for DNS configuration

### 7. Admin APIs
- `GET /api/admin/orders` - List all orders with stats
- `POST /api/admin/orders/complete` - Mark order complete
- `GET /api/admin/inventory` - Get inventory stats
- `POST /api/admin/inventory` - Add new accounts
- `GET /api/admin/alerts` - Get admin alerts
- `PATCH /api/admin/alerts` - Mark alerts as read

### 8. Database Schema (`supabase-schema.sql`)
Tables created:
- `users` - Customer accounts
- `pending_orders` - Pre-payment orders
- `orders` - Confirmed orders with fulfillment data
- `admin_alerts` - Low inventory and error alerts

---

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PLUGSAAS_API_KEY=
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### 2. Database Setup
Run `supabase-schema.sql` in Supabase SQL Editor

### 3. Google Sheets Setup
Create a sheet with columns:
```
Email | Password | Status | Date Added | Order ID | Customer Name | Domain | Assigned Date
```
Share with your service account email

### 4. Stripe Webhook
Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
Events to listen for:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Flow Summary

```
Customer fills order form
        ↓
Order saved to pending_orders
        ↓
Redirect to Stripe checkout
        ↓
Payment successful → Webhook triggered
        ↓
┌─────────────────────────────────────┐
│ AUTOMATED FULFILLMENT (with retry)  │
│ 1. Get MS account from Sheets (3x)  │
│ 2. Reserve account (3x)             │
│ 3. Create order in PlugSaaS (3x)    │
│ 4. Get nameservers (3x)             │
│ 5. Assign account (3x)              │
│ 6. Update order with NS info        │
│ 7. Check inventory levels           │
│                                     │
│ On failure: ROLLBACK                │
│ - Release reserved accounts         │
│ - Mark order as FAILED              │
│ - Log for admin review              │
└─────────────────────────────────────┘
        ↓
Customer sees nameservers in dashboard
        ↓
Customer updates DNS at registrar
        ↓
┌─────────────────────────────────────┐
│ DNS VERIFICATION CRON (every 5 min) │
│ 1. Check pending orders             │
│ 2. Verify NS via DNS lookup         │
│ 3. Mark as ACTIVE when verified     │
│ 4. Notify customer                  │
└─────────────────────────────────────┘
        ↓
Order marked ACTIVE - Inboxes ready!
```

---

## Files Modified/Created

### New Files
- `lib/plugsaas.js` - PlugSaaS API client
- `lib/google-sheets.js` - Google Sheets inventory
- `app/api/customer/orders/route.js` - Customer orders API
- `app/api/admin/inventory/route.js` - Inventory management API
- `app/api/admin/alerts/route.js` - Admin alerts API
- `app/api/cron/verify-dns/route.js` - DNS verification cron job
- `.env.example` - Environment template
- `supabase-schema.sql` - Database schema

### Modified Files
- `app/order/page.js` - Complete order form with CSV upload
- `app/dashboard/page.js` - Orders view with nameserver display
- `app/api/checkout/route.js` - One-time payment flow
- `app/api/webhooks/stripe/route.js` - Automated fulfillment with retry & rollback
- `app/api/admin/orders/route.js` - Updated order structure
- `app/api/admin/orders/complete/route.js` - Updated completion logic
- `package.json` - Fixed Windows compatibility

---

## Retry & Recovery Logic

### Retry Configuration
- **Max Retries:** 3 attempts per operation
- **Backoff:** Exponential (2s, 4s, 8s)
- **Operations with retry:**
  - Get available accounts from Google Sheets
  - Reserve accounts
  - PlugSaaS API calls (addOrder, getNameservers)
  - Assign accounts

### Rollback on Failure
When fulfillment fails after retries:
1. Reserved accounts are released back to "Available" status
2. Order marked as "failed" with error message
3. Admin alert created for manual review
4. Rollback failures are logged separately

### Order Statuses
| Status | Description |
|--------|-------------|
| `pending` | Payment received, fulfillment not started |
| `processing` | Fulfillment in progress |
| `completed` | All domains fulfilled, awaiting DNS |
| `partial` | Some domains fulfilled, others failed |
| `failed` | All domains failed after retries |
| `queued` | Insufficient inventory, waiting |
| `active` | DNS verified, inboxes ready |

---

## DNS Verification

### Cron Endpoint
`GET /api/cron/verify-dns`

### How It Works
1. Finds orders with `dns_status = 'pending_verification'`
2. Uses Google DNS-over-HTTPS to check nameservers
3. Compares actual NS records with expected values
4. Marks order as `active` when all domains verified
5. Creates notification for admin

### Setup Options

**Option 1: Vercel Cron (vercel.json)**
```json
{
  "crons": [{
    "path": "/api/cron/verify-dns",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option 2: External Cron Service**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/verify-dns
```

**Option 3: Manual Trigger**
```bash
POST /api/cron/verify-dns
Body: { "orderId": "uuid-here" }
```
