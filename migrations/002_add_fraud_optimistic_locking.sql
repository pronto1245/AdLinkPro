-- Add version column for optimistic locking to fraud_reports table
ALTER TABLE fraud_reports ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_fraud_reports_version ON fraud_reports(id, version);

-- Add fraud_reason to tracking_clicks for better tracking
ALTER TABLE tracking_clicks ADD COLUMN fraud_reason TEXT;
ALTER TABLE tracking_clicks ADD COLUMN is_fraud BOOLEAN DEFAULT FALSE;

-- Create webhook configuration table for external integrations
CREATE TABLE IF NOT EXISTS fraud_webhooks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST' CHECK (method IN ('GET', 'POST', 'PUT')),
  headers JSONB DEFAULT '{}',
  events TEXT[] DEFAULT '{}', -- Array of event types to send
  is_active BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create external fraud service configuration table
CREATE TABLE IF NOT EXISTS fraud_external_services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('fraudscore', 'forensiq', 'anura', 'botbox', 'custom')),
  api_key TEXT,
  endpoint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_response_time INTEGER DEFAULT 0, -- milliseconds
  last_check_at TIMESTAMP,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default external services
INSERT INTO fraud_external_services (service_name, service_type, endpoint, is_active, configuration) VALUES
('FraudScore', 'fraudscore', 'https://api.fraudscore.io/v1', false, '{"timeout": 5000}'),
('Forensiq', 'forensiq', 'https://api.forensiq.com/v2', false, '{"timeout": 3000}'),
('Anura', 'anura', 'https://api.anura.io/direct', false, '{"timeout": 5000}'),
('Botbox', 'botbox', 'https://api.botbox.io/v1', false, '{"timeout": 3000}')
ON CONFLICT (service_name) DO NOTHING;

-- Create production configuration table
CREATE TABLE IF NOT EXISTS antifraud_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN DEFAULT TRUE,
  auto_triggers_enabled BOOLEAN DEFAULT FALSE,
  real_time_analysis BOOLEAN DEFAULT TRUE,
  auto_blocking_enabled BOOLEAN DEFAULT FALSE,
  ip_click_threshold INTEGER DEFAULT 50,
  bot_score_threshold INTEGER DEFAULT 70,
  conversion_rate_threshold DECIMAL(5,4) DEFAULT 0.0050,
  geo_anomaly_threshold INTEGER DEFAULT 80,
  external_services_enabled BOOLEAN DEFAULT FALSE,
  webhook_notifications_enabled BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}',
  updated_by TEXT REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO antifraud_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Create audit log entries for fraud-related actions
INSERT INTO audit_logs (id, action, entity_type, entity_id, details, metadata, created_by, ip_address)
SELECT 
  gen_random_uuid(),
  'ANTIFRAUD_SCHEMA_MIGRATION',
  'system',
  'antifraud_v2',
  'Added optimistic locking and production configuration for anti-fraud system',
  jsonb_build_object(
    'changes', json_build_array(
      'Added version column to fraud_reports',
      'Created fraud_webhooks table',
      'Created fraud_external_services table', 
      'Created antifraud_config table',
      'Added fraud tracking fields to tracking_clicks'
    ),
    'migration_date', NOW()
  ),
  'system',
  '127.0.0.1';