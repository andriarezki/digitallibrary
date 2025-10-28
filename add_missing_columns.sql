-- =================================================================
-- SQL COMMANDS TO ADD MISSING COLUMNS TO YOUR SERVER DATABASE
-- =================================================================
-- Copy and paste these commands into your MySQL server

-- 1. Connect to your database
USE projek_perpus;

-- 2. Add the file_type column (this is the main issue causing the error)
ALTER TABLE tbl_buku ADD COLUMN file_type VARCHAR(10) DEFAULT NULL;

-- 3. Add the department column (if it doesn't exist)
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255) DEFAULT NULL;

-- 4. Verify the columns were added successfully
DESCRIBE tbl_buku;

-- 5. Optional: Set some default values for existing records
-- UPDATE tbl_buku SET file_type = 'pdf' WHERE file_type IS NULL;
-- UPDATE tbl_buku SET department = 'General' WHERE department IS NULL;

-- 6. Show the structure to confirm
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'projek_perpus' 
AND TABLE_NAME = 'tbl_buku' 
AND COLUMN_NAME IN ('file_type', 'department');

SELECT 'Database update completed successfully!' as status;