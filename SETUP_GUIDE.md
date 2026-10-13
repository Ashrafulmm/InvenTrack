# InvenTrack - Complete Setup Guide

## 🎉 New Features Added

Your inventory management system now includes these additional modules:

### 1. **Products** (Enhanced Inventory)
- Full product management with stock tracking
- Low stock alerts
- Category management
- SKU tracking

### 2. **Purchases**
- Track purchase orders from suppliers
- Record supplier invoices
- Monitor payment status (paid/partial/unpaid)
- Automatic stock updates when purchases are received

### 3. **Expenses**
- Track business expenses by category
- Categories: Rent, Utilities, Salary, Marketing, Transport, Office Supplies, Maintenance, Other
- Monthly expense tracking
- Payment method tracking

### 4. **Stock Transfers**
- Transfer stock between locations/warehouses
- Track pending, completed, and cancelled transfers
- Multi-item transfers
- Transfer history and audit trail

### 5. **Stock Adjustments**
- Manual stock corrections
- Increase or decrease stock levels
- Record reasons for adjustments
- Full audit trail of all changes

### 6. **Payment Accounts**
- Manage bank accounts
- Mobile banking accounts (bKash, Nagad, etc.)
- Track account balances
- Multiple payment methods support

### 7. **User Management**
- Create and manage users
- Role-based access control (Admin, Manager, Staff, Cashier)
- Permission management
- Active/inactive user status

---

## 🗄️ Database Setup

### Step 1: Run the Complete SQL Script

Go to your Supabase project → **SQL Editor** → **New Query** → Paste and run this:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXISTING TABLES (if not already created)
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mobile_banking')),
  customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
  customer_phone TEXT DEFAULT '',
  delivery_address TEXT DEFAULT '',
  courier_service TEXT DEFAULT '',
  tracking_id TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled', 'delivered', 'shipped')) DEFAULT 'completed',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- ============================================
-- NEW TABLES FOR ADDITIONAL FEATURES
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

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
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

-- Categories
CREATE POLICY "Enable all operations for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "Enable all operations for products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Sales
CREATE POLICY "Enable all operations for sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);

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
```

### Step 2: Verify Tables Created

Go to **Table Editor** in the left sidebar. You should see these tables:
- ✅ categories
- ✅ products
- ✅ sales
- ✅ sale_items
- ✅ purchases
- ✅ purchase_items
- ✅ expenses
- ✅ stock_transfers
- ✅ stock_transfer_items
- ✅ stock_adjustments
- ✅ payment_accounts
- ✅ app_users

---

## 🔐 Authentication Setup

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure:
   - Confirm email: Enable (recommended)
   - Site URL: `http://localhost:5173`
   - Redirect URLs:
     ```
     http://localhost:5173
     http://localhost:5173/login
     ```

---

## 🚀 Running the App

### Local Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Features to Test

1. **Login/Register** - Create an account or use guest access
2. **Dashboard** - View overview statistics
3. **Products** - Add/edit/delete products
4. **Purchases** - Record supplier purchases
5. **Expenses** - Track business expenses
6. **Stock Transfers** - Move stock between locations
7. **Stock Adjustments** - Manual stock corrections
8. **POS** - Quick sales interface
9. **Sales History** - View all sales
10. **Payment Accounts** - Manage payment methods
11. **Reports** - Generate reports and analytics
12. **Statistics** - View detailed statistics
13. **Categories** - Manage product categories
14. **User Management** - Manage users and permissions
15. **Settings** - Configure store settings

---

## 📊 Feature Details

### Products (Inventory)
- **Add Products**: Name, SKU, category, price, cost, stock levels
- **Edit Products**: Update any product information
- **Delete Products**: Remove products from inventory
- **Low Stock Alerts**: Automatic alerts when stock falls below minimum
- **Search & Filter**: Find products quickly

### Purchases
- **Record Purchases**: Track supplier invoices
- **Payment Status**: Mark as paid, partial, or unpaid
- **Auto Stock Update**: Automatically increases stock when purchase is recorded
- **Supplier Tracking**: Keep track of all suppliers

### Expenses
- **Categorize Expenses**: Rent, utilities, salary, marketing, etc.
- **Monthly Tracking**: See expenses by month
- **Payment Methods**: Track how expenses were paid
- **Reference Numbers**: Add invoice/receipt numbers

### Stock Transfers
- **Multi-Location**: Transfer between warehouses/locations
- **Status Tracking**: Pending, completed, or cancelled
- **Multi-Item**: Transfer multiple products at once
- **Audit Trail**: Full history of all transfers

### Stock Adjustments
- **Manual Corrections**: Fix inventory discrepancies
- **Increase/Decrease**: Adjust stock up or down
- **Reason Tracking**: Document why adjustments were made
- **Full Audit**: Track all stock changes

### Payment Accounts
- **Bank Accounts**: Track bank account balances
- **Mobile Banking**: bKash, Nagad, Rocket, etc.
- **Cash Accounts**: Track cash on hand
- **Balance Tracking**: Monitor account balances

### User Management
- **Roles**: Admin, Manager, Staff, Cashier
- **Permissions**: Granular access control
- **Active/Inactive**: Enable/disable users
- **Audit Trail**: Track user activities

---

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit with all features"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://fphzlpdrfuomgatwblec.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Rd2skzSxUBVSDGyMxJtPxA_pSwUv280`
4. Click **Deploy**

### Step 3: Update Supabase Redirect URLs

Add your Vercel domain to Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/login
   ```

---

## 🔧 Troubleshooting

### Blank White Page
- Check browser console for errors
- Verify `.env` file has correct Supabase credentials
- Restart development server

### Database Errors
- Make sure you ran the SQL script in Supabase
- Check that all tables were created successfully
- Verify RLS policies are enabled

### Can't Login
- Verify email authentication is enabled in Supabase
- Check email confirmation (check spam folder)
- Try guest access for testing

### Data Not Saving
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies allow operations

---

## 📝 Notes

- **Currency**: Default is Bangladeshi Taka (৳), can be changed in Settings
- **Tax Rate**: Default is 0%, can be configured in Settings
- **Delivery Charge**: Default is ৳60, can be configured in Settings
- **Guest Access**: Available for testing without login
- **Data Persistence**: All data is stored in Supabase cloud database

---

## 🎯 Next Steps

1. ✅ Run the SQL script to create all tables
2. ✅ Enable email authentication in Supabase
3. ✅ Test the app locally with `npm run dev`
4. ✅ Create your first account
5. ✅ Add some products
6. ✅ Make a test sale
7. ✅ Deploy to Vercel

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all database tables are created
3. Ensure environment variables are correct
4. Check Supabase dashboard for any errors

---

**Your InvenTrack system is now fully equipped with comprehensive inventory management, financial tracking, and user management capabilities!** 🚀
