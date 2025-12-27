-- Example SQL Query to Create an Admin Account
-- Replace the password_hash with your own bcrypt hash

-- Step 1: Generate a bcrypt hash for your password
-- You can use Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('your_password_here', 10).then(hash => console.log(hash));

-- Step 2: Insert the admin with the hashed password
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'admin',                                    -- Username (change this)
  'admin@example.com',                        -- Email (change this)
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- Bcrypt hash for 'admin123' (REPLACE WITH YOUR OWN HASH)
  'Admin User',                               -- Full name (change this)
  true                                        -- Is active
);

-- Verify the admin was created
SELECT id, username, email, full_name, is_active, created_at 
FROM admins 
WHERE username = 'admin';

-- To create multiple admins:
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES 
  ('admin1', 'admin1@example.com', '$2a$10$...', 'Admin One', true),
  ('admin2', 'admin2@example.com', '$2a$10$...', 'Admin Two', true);

-- To deactivate an admin:
UPDATE admins 
SET is_active = false 
WHERE username = 'admin';

-- To reactivate an admin:
UPDATE admins 
SET is_active = true 
WHERE username = 'admin';

