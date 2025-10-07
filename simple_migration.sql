-- SIMPLE Database Migration Script (Alternative)
-- Use this if the main migration script gives permission errors

USE projek_perpus;

-- Method 1: Direct ALTER TABLE (will show error if column exists, but that's OK)
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255) NULL;

-- Check if the migration worked
DESCRIBE tbl_buku;