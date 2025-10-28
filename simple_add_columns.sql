-- =================================================================
-- SIMPLE SQL COMMANDS FOR SERVER DATABASE (NO SPECIAL PERMISSIONS NEEDED)
-- =================================================================

-- 1. Connect to your database
USE projek_perpus;

-- 2. Try to add file_type column (ignore error if it already exists)
-- Run this command and ignore any "Duplicate column name" error
ALTER TABLE tbl_buku ADD COLUMN file_type VARCHAR(10) DEFAULT NULL;

-- 3. Try to add department column (ignore error if it already exists)  
-- Run this command and ignore any "Duplicate column name" error
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255) DEFAULT NULL;

-- 4. Show the table structure to verify
SHOW COLUMNS FROM tbl_buku;

-- 5. Check if the columns were added successfully
SELECT 'Setup completed!' as status;