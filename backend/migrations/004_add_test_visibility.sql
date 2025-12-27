-- Add visibility and scheduling options to tests
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'scheduled')),
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS role_position VARCHAR(255);

-- Update existing tests to be public by default
UPDATE tests SET visibility = 'public' WHERE visibility IS NULL;

