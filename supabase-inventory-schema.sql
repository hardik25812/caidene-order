-- ===========================================
-- INVENTORY TABLE FOR MICROSOFT 365 ACCOUNTS
-- Alternative to Google Sheets (no service account needed)
-- ===========================================

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'assigned', 'depleted')),
  date_added TIMESTAMPTZ DEFAULT NOW(),
  order_id TEXT DEFAULT NULL,
  customer_name TEXT DEFAULT NULL,
  customer_email TEXT DEFAULT NULL,
  domain TEXT DEFAULT NULL,
  assigned_date TIMESTAMPTZ DEFAULT NULL,
  reserved_date TIMESTAMPTZ DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_email ON inventory(email);
CREATE INDEX IF NOT EXISTS idx_inventory_order_id ON inventory(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_date_added ON inventory(date_added DESC);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access inventory" ON inventory
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Admin users can view inventory (if you want admin UI access)
-- CREATE POLICY "Admin can view inventory" ON inventory
--   FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Insert some sample accounts (REPLACE WITH YOUR REAL ACCOUNTS)
INSERT INTO inventory (email, password, status, notes) VALUES
  ('sample1@outlook.com', 'ChangeMe123!', 'available', 'Sample account - replace with real credentials'),
  ('sample2@outlook.com', 'ChangeMe456!', 'available', 'Sample account - replace with real credentials'),
  ('sample3@outlook.com', 'ChangeMe789!', 'available', 'Sample account - replace with real credentials')
ON CONFLICT (email) DO NOTHING;

-- Function to get available inventory count
CREATE OR REPLACE FUNCTION get_available_inventory_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM inventory WHERE status = 'available');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if inventory is low
CREATE OR REPLACE FUNCTION is_inventory_low(threshold INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_available_inventory_count() < threshold);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
