-- Migration script for payout request system
-- Run this script to add the enhanced payout tables to your database

-- Add new enum types for payout system
DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('crypto', 'bank_transfer', 'paypal', 'stripe', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gateway_type AS ENUM ('stripe', 'coinbase', 'binance', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing payout_requests table with new fields
ALTER TABLE payout_requests 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_network TEXT,
ADD COLUMN IF NOT EXISTS bank_details JSONB,
ADD COLUMN IF NOT EXISTS partner_note TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejected_by VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS invoice_id VARCHAR,
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_type gateway_type,
ADD COLUMN IF NOT EXISTS partner_balance_at_request DECIMAL(15,8),
ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(15,8),
ADD COLUMN IF NOT EXISTS processed_amount DECIMAL(15,8),
ADD COLUMN IF NOT EXISTS gateway_fee DECIMAL(15,8);

-- Update amount column precision for crypto support
ALTER TABLE payout_requests ALTER COLUMN amount TYPE DECIMAL(15,8);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    payout_request_id VARCHAR NOT NULL REFERENCES payout_requests(id),
    advertiser_id VARCHAR NOT NULL REFERENCES users(id),
    partner_id VARCHAR NOT NULL REFERENCES users(id),
    amount DECIMAL(15,8) NOT NULL,
    currency TEXT NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,8) DEFAULT 0.00,
    total_amount DECIMAL(15,8) NOT NULL,
    description TEXT,
    invoice_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    pdf_path TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment gateway configurations table
CREATE TABLE IF NOT EXISTS payment_gateway_configs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id VARCHAR NOT NULL REFERENCES users(id),
    gateway_type gateway_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    api_key TEXT,
    api_secret TEXT,
    webhook_secret TEXT,
    supported_currencies JSONB,
    minimum_amount DECIMAL(15,8),
    maximum_amount DECIMAL(15,8),
    fee_percentage DECIMAL(5,4),
    fixed_fee DECIMAL(15,8),
    processing_time TEXT,
    configuration JSONB,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_partner_id ON payout_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_advertiser_id ON payout_requests(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_invoices_payout_request_id ON invoices(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_invoices_partner_id ON invoices(partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_advertiser_id ON invoices(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_gateway_configs_advertiser_id ON payment_gateway_configs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_gateway_configs_gateway_type ON payment_gateway_configs(gateway_type);
CREATE INDEX IF NOT EXISTS idx_gateway_configs_is_active ON payment_gateway_configs(is_active);

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_payout_requests_updated_at ON payout_requests;
CREATE TRIGGER update_payout_requests_updated_at BEFORE UPDATE ON payout_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gateway_configs_updated_at ON payment_gateway_configs;
CREATE TRIGGER update_gateway_configs_updated_at BEFORE UPDATE ON payment_gateway_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - remove in production)
-- This creates some sample payout requests for testing

-- Insert a sample gateway configuration
INSERT INTO payment_gateway_configs (
    id, advertiser_id, gateway_type, is_active, is_default,
    supported_currencies, minimum_amount, maximum_amount,
    fee_percentage, processing_time
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE role = 'advertiser' LIMIT 1),
    'manual',
    true,
    true,
    '["USD", "EUR", "BTC", "ETH", "USDT"]',
    10.00,
    50000.00,
    0.00,
    'Manual processing - 1-3 business days'
) ON CONFLICT DO NOTHING;

-- Create public/invoices directory (this should be done via mkdir in deployment)
-- mkdir -p public/invoices

COMMENT ON TABLE invoices IS 'Auto-generated invoices for payout requests';
COMMENT ON TABLE payment_gateway_configs IS 'Payment gateway configurations per advertiser';
COMMENT ON COLUMN payout_requests.wallet_address IS 'Cryptocurrency wallet address for payouts';
COMMENT ON COLUMN payout_requests.gateway_fee IS 'Fee charged by payment gateway';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated invoice number (e.g., AUTO-INV-2025-0001)';
COMMENT ON COLUMN payment_gateway_configs.api_key IS 'Encrypted API key for gateway';
COMMENT ON COLUMN payment_gateway_configs.api_secret IS 'Encrypted API secret for gateway';