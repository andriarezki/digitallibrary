-- Database Migration Script for Library System
-- Run this script on your PC server to ensure database compatibility

USE projek_perpus;

-- Simple approach: Try to add department column
-- If it already exists, MySQL will give an error but continue with other statements

-- Add department column to tbl_buku (ignore error if already exists)
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255) NULL;

-- Verify the department column exists by showing table structure
DESCRIBE tbl_buku;

-- Show current table structure
SHOW CREATE TABLE tbl_buku;

-- Optional: Update some existing records with default department (uncomment if needed)
-- UPDATE tbl_buku SET department = 'general' WHERE department IS NULL LIMIT 10;

-- Show sample data to verify everything is working
SELECT COUNT(*) as total_books FROM tbl_buku;

SELECT 'Database migration completed successfully!' as status;