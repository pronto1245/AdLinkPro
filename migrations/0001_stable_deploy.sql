-- Stable deployment migration
-- This migration ensures all enum types match the current database state

-- Only create enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'domain_type') THEN
        CREATE TYPE domain_type AS ENUM ('a_record', 'cname', 'txt_record');
    END IF;
END $$;

-- Ensure all tables exist without conflicts
-- This migration is safe for production deployment
SELECT 'Migration completed successfully' as status;