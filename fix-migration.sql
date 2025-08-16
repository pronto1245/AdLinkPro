-- Fixed migration to resolve enum conflicts
-- This creates missing enum if needed without breaking existing data

DO $$ 
BEGIN
    -- Check if delivery_status enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('pending', 'success', 'failed', 'retrying');
    END IF;
END $$;