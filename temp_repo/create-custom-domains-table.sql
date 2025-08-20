-- Create custom_domains table
CREATE TABLE IF NOT EXISTS custom_domains (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    advertiser_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('a_record', 'cname')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'error')),
    verification_value VARCHAR(255) NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    error_message TEXT,
    last_checked TIMESTAMP,
    next_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_custom_domains_advertiser FOREIGN KEY (advertiser_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_domains_advertiser_id ON custom_domains(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);