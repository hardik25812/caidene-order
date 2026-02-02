-- ===========================================
-- FULFILLMENT PLATFORM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending orders (before payment)
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

-- Confirmed orders (after payment)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  phone TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  domain_count INTEGER DEFAULT 1,
  domains JSONB DEFAULT '[]',
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'paid',
  fulfillment_status TEXT DEFAULT 'pending',
  fulfillment_error TEXT,
  fulfillment_results JSONB DEFAULT '[]',
  nameservers JSONB DEFAULT '[]',
  dns_status TEXT DEFAULT NULL,
  dns_last_checked TIMESTAMPTZ DEFAULT NULL,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin alerts (low inventory, errors, etc.)
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_dns_status ON orders(dns_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_orders_email ON pending_orders(email);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status ON admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(type);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for orders - users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (email = auth.jwt()->>'email');

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access pending_orders" ON pending_orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_alerts" ON admin_alerts
  FOR ALL USING (auth.role() = 'service_role');
