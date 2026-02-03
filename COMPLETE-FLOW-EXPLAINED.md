# Complete Fulfillment Platform Flow - Explained

## Overview
This is an automated system that sells Microsoft 365 email domains. When a customer pays, the system automatically provisions their domain with Microsoft accounts and gives them nameservers to configure.

---

## 🎯 The Big Picture

```
Customer → Order Form → Payment → Automated Fulfillment → Nameservers → DNS Setup → Active
```

---

## 📋 Detailed Flow (Step by Step)

### Phase 1: Customer Places Order

**What Happens:**
1. Customer visits `/order` page
2. Fills out form:
   - Email address
   - Phone number
   - Domain name (e.g., "mybusiness.com")
   - Forwarding URL (where emails go)
   - Names for the domain (1-3 people)
3. Clicks "Checkout"

**Behind the Scenes:**
- Order saved to `pending_orders` table in Supabase
- Customer redirected to Stripe payment page

**Database State:**
```
pending_orders table:
- id: abc-123
- email: customer@example.com
- domains: [{ domain: "mybusiness.com", forwardingUrl: "...", names: [...] }]
- status: "pending_payment"
```

---

### Phase 2: Customer Pays

**What Happens:**
1. Customer enters credit card on Stripe
2. Payment processed
3. Stripe sends webhook to your server

**Behind the Scenes:**
- Stripe webhook hits `/api/webhooks/stripe`
- Creates user in `users` table (if new)
- Creates order in `orders` table
- Marks `pending_orders` as "paid"
- **Triggers automated fulfillment**

**Database State:**
```
users table:
- id: user-456
- email: customer@example.com

orders table:
- id: order-789
- user_id: user-456
- email: customer@example.com
- domains: [{ domain: "mybusiness.com", ... }]
- status: "paid"
- fulfillment_status: "pending"
```

---

### Phase 3: Automated Fulfillment (THE MAGIC)

This is where everything happens automatically without any manual work!

#### Step 3.1: Get Microsoft Account from Inventory

**What Happens:**
- System looks in `inventory` table
- Finds an account with `status = 'available'`
- Picks the oldest one (FIFO - First In, First Out)

**Code:**
```javascript
const accounts = await supabaseInventory.getAvailableAccounts(1);
// Returns: [{ email: "ms-account@outlook.com", password: "pass123" }]
```

**Database State:**
```
inventory table BEFORE:
- email: ms-account@outlook.com
- status: "available"
- order_id: null
```

---

#### Step 3.2: Reserve the Account

**What Happens:**
- Marks account as "reserved" (temporary hold)
- Links it to the order ID
- This prevents other orders from using it

**Why Reserve?**
If something fails later (PlugSaaS API down, server crash), we can release the account back to "available" status. This is the **rollback mechanism**.

**Database State:**
```
inventory table AFTER RESERVE:
- email: ms-account@outlook.com
- status: "reserved"
- order_id: order-789
- reserved_date: 2026-02-03T02:00:00Z
```

---

#### Step 3.3: Create Order in PlugSaaS

**What Happens:**
- Calls PlugSaaS API: `POST /api/addOrder`
- Sends:
  - Domain: "mybusiness.com"
  - Forwarding URL: "https://example.com"
  - Names: ["John Doe", "Jane Smith"]
  - Microsoft account credentials

**PlugSaaS Does:**
- Creates email infrastructure for the domain
- Sets up Microsoft 365 integration
- Configures email forwarding
- Returns an order ID

**Code:**
```javascript
const plugsaasOrder = await plugsaas.addOrder({
  domain: "mybusiness.com",
  forwarding_url: "https://example.com",
  names: ["John Doe", "Jane Smith"],
  microsoft_email: "ms-account@outlook.com",
  microsoft_password: "pass123"
});
// Returns: { order_id: "plug-order-123" }
```

---

#### Step 3.4: Get Nameservers

**What Happens:**
- Calls PlugSaaS API: `GET /api/getNameservers?orderId=plug-order-123`
- PlugSaaS returns nameserver addresses

**Example Response:**
```json
{
  "nameservers": [
    "ns1.plugsaas.com",
    "ns2.plugsaas.com"
  ]
}
```

**Why Nameservers?**
The customer needs to update their domain's DNS settings at their registrar (GoDaddy, Namecheap, etc.) to point to these nameservers. This routes email traffic through PlugSaaS.

---

#### Step 3.5: Mark Account as Assigned

**What Happens:**
- Changes account status from "reserved" → "assigned"
- Records customer details
- Records assignment date

**Database State:**
```
inventory table FINAL:
- email: ms-account@outlook.com
- status: "assigned"
- order_id: order-789
- customer_email: customer@example.com
- domain: mybusiness.com
- assigned_date: 2026-02-03T02:05:00Z
```

---

#### Step 3.6: Update Order with Results

**What Happens:**
- Saves all fulfillment details to order
- Stores nameservers
- Marks fulfillment as "completed"

**Database State:**
```
orders table FINAL:
- id: order-789
- fulfillment_status: "completed"
- dns_status: "pending_verification"
- nameservers: [
    {
      domain: "mybusiness.com",
      nameservers: ["ns1.plugsaas.com", "ns2.plugsaas.com"],
      dns_verified: false
    }
  ]
- fulfillment_results: [
    {
      domain: "mybusiness.com",
      msAccountEmail: "ms-account@outlook.com",
      plugsaasOrderId: "plug-order-123",
      nameservers: ["ns1.plugsaas.com", "ns2.plugsaas.com"],
      status: "completed"
    }
  ]
```

---

### Phase 4: Customer Sees Nameservers

**What Happens:**
1. Customer redirected to `/dashboard`
2. Dashboard fetches their orders from database
3. Shows nameservers with copy buttons

**Customer Sees:**
```
Order: mybusiness.com
Status: Completed ✅

Nameservers:
ns1.plugsaas.com [Copy]
ns2.plugsaas.com [Copy]

Instructions:
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update nameservers to the ones above
3. Wait 24-48 hours for DNS propagation
```

---

### Phase 5: DNS Verification (Automatic)

**What Happens:**
- Cron job runs every 5 minutes: `/api/cron/verify-dns`
- Checks if customer configured nameservers correctly
- Uses Google DNS-over-HTTPS to verify

**How It Works:**
```javascript
// Check actual nameservers for "mybusiness.com"
const actualNS = await checkDNS("mybusiness.com");
// Returns: ["ns1.plugsaas.com", "ns2.plugsaas.com"]

// Compare with expected nameservers
if (actualNS matches expectedNS) {
  // Mark order as "active"
  // Send notification to customer
}
```

**Database State:**
```
orders table AFTER DNS VERIFIED:
- dns_status: "verified"
- fulfillment_status: "active"
- dns_last_checked: 2026-02-03T14:00:00Z
```

---

## 🔄 Retry & Rollback Logic

### What If Something Fails?

**Scenario: PlugSaaS API is down**

1. System tries to call PlugSaaS API
2. Fails ❌
3. Waits 2 seconds, tries again (Attempt 2)
4. Fails ❌
5. Waits 4 seconds, tries again (Attempt 3)
6. Fails ❌
7. **Rollback triggered:**
   - Releases reserved Microsoft account
   - Marks order as "failed"
   - Creates admin alert
   - Customer notified

**Database State After Rollback:**
```
inventory table:
- status: "available" (released back)
- order_id: null

orders table:
- fulfillment_status: "failed"
- fulfillment_error: "PlugSaaS API error after 3 retries"

admin_alerts table:
- type: "fulfillment_failure"
- message: "Order order-789 failed: PlugSaaS API error"
```

---

## 📊 Inventory Management

### How You Add Microsoft Accounts

**Option 1: Admin Panel**
1. Go to `/admin/inventory`
2. Upload CSV file:
   ```csv
   email,password,notes
   account1@outlook.com,Pass123!,Production
   account2@outlook.com,Pass456!,Production
   ```
3. Accounts added to `inventory` table with `status = 'available'`

**Option 2: SQL**
```sql
INSERT INTO inventory (email, password, status) VALUES
  ('account@outlook.com', 'password', 'available');
```

### Inventory Lifecycle

```
Available → Reserved → Assigned
    ↑           ↓
    └─ Rollback ─┘
```

- **Available**: Ready to be used
- **Reserved**: Temporarily held for an order (can be released)
- **Assigned**: Permanently assigned to a customer
- **Depleted**: Account no longer usable (optional status)

---

## 🧪 Testing Without Payment

### Why Test Mode Exists

You don't want to make real payments every time you test! The test endpoint simulates the entire flow without Stripe.

**Test Flow:**
```
/test page → /api/test/fulfillment → Creates order → Runs fulfillment → Shows results
```

**What It Does:**
1. Creates test user in database
2. Creates test order (no payment)
3. Runs the EXACT same fulfillment code
4. Shows you the results

**Same as Real Flow, Just Skips:**
- ❌ Stripe payment
- ❌ Stripe webhook
- ✅ Everything else is identical

---

## 🎯 Summary: Who Does What

### Customer:
1. Fills order form
2. Pays with credit card
3. Sees nameservers on dashboard
4. Updates DNS at their registrar
5. Waits for email to work

### Your System (Automated):
1. Receives payment webhook
2. Gets Microsoft account from inventory
3. Creates order in PlugSaaS
4. Gets nameservers
5. Assigns account
6. Shows nameservers to customer
7. Checks DNS every 5 minutes
8. Marks order active when DNS verified

### You (Manual):
1. Add Microsoft accounts to inventory (via admin panel)
2. Monitor alerts (low inventory, failures)
3. Handle edge cases (if any)

---

## 🔑 Key Concepts

**Inventory** = Pool of Microsoft 365 accounts you own
**Fulfillment** = Automatic process of assigning accounts to orders
**Nameservers** = DNS addresses customer needs to configure
**DNS Verification** = Checking if customer configured nameservers
**Rollback** = Releasing reserved accounts if fulfillment fails
**Retry** = Trying failed operations 3 times before giving up

---

## 📁 Database Tables Explained

### `users`
- Customer accounts
- Email, phone, created date

### `orders`
- Confirmed orders (after payment)
- Links to user
- Contains domains, nameservers, fulfillment status

### `pending_orders`
- Orders before payment
- Temporary storage
- Deleted or marked "paid" after checkout

### `inventory`
- Microsoft 365 accounts
- Status: available/reserved/assigned
- Links to orders when assigned

### `admin_alerts`
- Low inventory warnings
- Fulfillment failures
- Rollback issues

---

## ❓ Common Questions

**Q: Where do Microsoft accounts come from?**
A: You buy them from Microsoft and add them to inventory via admin panel.

**Q: What if I run out of inventory?**
A: System queues orders and sends you an alert. You add more accounts.

**Q: Can customers see the Microsoft account credentials?**
A: No! Only stored in your database. PlugSaaS handles the email infrastructure.

**Q: What if PlugSaaS API fails?**
A: System retries 3 times, then rolls back and alerts you.

**Q: How long until emails work?**
A: Customer needs to update DNS (24-48 hours). System auto-detects when ready.

---

Does this make sense now? The key insight is: **Everything after payment is 100% automated**. You just need to keep inventory stocked!
