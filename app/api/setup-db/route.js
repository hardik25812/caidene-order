import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// This endpoint sets up the database tables
// Should only be called once during initial setup
export async function POST(request) {
  try {
    // Check for a secret to prevent unauthorized access
    const { secret } = await request.json();
    
    if (secret !== 'deliveron-setup-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Note: In Supabase, we can't create tables via the API with the JS client
    // Tables need to be created via the SQL Editor in the Supabase Dashboard
    // This endpoint is here to provide the SQL that needs to be run

    const sql = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT,
  inbox_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  subscription_id TEXT REFERENCES subscriptions(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for MVP - tighten in production)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `;

    return NextResponse.json({ 
      message: 'Please run this SQL in your Supabase SQL Editor',
      sql: sql 
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}
