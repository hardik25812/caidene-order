-- ===========================================
-- MIGRATION SCRIPT: Subscription → Fulfillment Platform
-- ===========================================
-- This script migrates from the old subscription schema to the new fulfillment schema
-- Run this INSTEAD of supabase-schema.sql if you have existing data

-- Step 1: Drop existing policies that conflict
DROP POLICY IF EXISTS "Allow all users" ON users;
DROP POLICY IF EXISTS "Allow all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;

-- Step 2: Drop foreign key constraints before type change
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Step 3: Modify users table (change id from TEXT to UUID if needed)
-- Also update related tables
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE subscriptions ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE orders ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE orders ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE orders ALTER COLUMN subscription_id TYPE UUID USING subscription_id::uuid;

-- Re-create foreign key constraints
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Add phone column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 4: Add new columns to orders table
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_subscription_id_fkey;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS domain_count INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS domains JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_results JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nameservers JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dns_status TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dns_last_checked TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing orders to have email from users table
UPDATE orders o
SET email = u.email
FROM users u
WHERE o.user_id = u.id AND o.email IS NULL;

-- Make email NOT NULL after populating
ALTER TABLE orders ALTER COLUMN email SET NOT NULL;

-- Step 5: Create new tables
CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  domains JSONB DEFAULT '[]',
  domain_count INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create new indexes
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_dns_status ON orders(dns_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_orders_email ON pending_orders(email);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status ON admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(type);

-- Step 7: Enable RLS on new tables
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Step 8: Create new policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (email = auth.jwt()->>'email');

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access pending_orders" ON pending_orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_alerts" ON admin_alerts
  FOR ALL USING (auth.role() = 'service_role');

-- Step 9: Keep subscriptions table for backward compatibility (optional)
-- You can drop it later if not needed:
-- DROP TABLE IF EXISTS subscriptions CASCADE;

-- Migration complete!
-- The old subscription-based orders are preserved in the orders table
-- New fulfillment orders will have the additional fields populated
