-- ============================================
-- NEW TABLES FOR ADDITIONAL FEATURES
-- Run this in Supabase SQL Editor
-- ============================================

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid')) DEFAULT 'unpaid',
  payment_method TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  reference TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Transfer Items table
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL
);

-- Stock Adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease')),
  reason TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Accounts table
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'mobile_banking', 'cash', 'card')),
  account_number TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for user management)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'cashier')) DEFAULT 'staff',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES FOR PUBLIC ACCESS
-- ============================================

-- Purchases
CREATE POLICY "Enable all operations for purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for purchase_items" ON purchase_items FOR ALL USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY "Enable all operations for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- Stock Transfers
CREATE POLICY "Enable all operations for stock_transfers" ON stock_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for stock_transfer_items" ON stock_transfer_items FOR ALL USING (true) WITH CHECK (true);

-- Stock Adjustments
CREATE POLICY "Enable all operations for stock_adjustments" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);

-- Payment Accounts
CREATE POLICY "Enable all operations for payment_accounts" ON payment_accounts FOR ALL USING (true) WITH CHECK (true);

-- Users
CREATE POLICY "Enable all operations for app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
