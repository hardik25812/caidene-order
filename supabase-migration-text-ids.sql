-- ===========================================
-- MIGRATION SCRIPT: Subscription → Fulfillment Platform
-- FOR DATABASES WITH TEXT IDs (not UUID)
-- ===========================================
-- Use this if your existing IDs are TEXT like "test-user-id-12345"

-- Step 1: Drop existing policies that conflict
DROP POLICY IF EXISTS "Allow all users" ON users;
DROP POLICY IF EXISTS "Allow all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;

-- Step 2: Add phone column to users (keep TEXT id)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 3: Add new columns to orders table (keep TEXT ids)
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

-- Step 4: Create new tables (use TEXT for compatibility with existing system)
CREATE TABLE IF NOT EXISTS pending_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  phone TEXT,
  domains JSONB DEFAULT '[]',
  domain_count INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create new indexes
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_dns_status ON orders(dns_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_orders_email ON pending_orders(email);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status ON admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(type);

-- Step 6: Enable RLS on new tables
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Step 7: Create new policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

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

-- Step 8: Keep subscriptions table for backward compatibility
-- You can drop it later if not needed:
-- DROP TABLE IF EXISTS subscriptions CASCADE;

-- Migration complete!
-- The old subscription-based orders are preserved in the orders table
-- New fulfillment orders will have the additional fields populated
-- All IDs remain as TEXT for compatibility with existing data
