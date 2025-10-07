-- Database Verification Script
-- Run this to check if your database is ready for the new application

USE projek_perpus;

-- Check database exists
SELECT 'Database projek_perpus exists!' as status;

-- Check all required tables exist
SELECT 
    TABLE_NAME,
    CASE 
        WHEN TABLE_NAME IN ('tbl_login', 'tbl_buku', 'tbl_kategori', 'tbl_rak') 
        THEN 'REQUIRED' 
        ELSE 'OPTIONAL' 
    END as status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'projek_perpus'
ORDER BY status DESC, TABLE_NAME;

-- Check if department column exists in tbl_buku
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'projek_perpus' 
  AND TABLE_NAME = 'tbl_buku'
  AND COLUMN_NAME = 'department';

-- Show sample data
SELECT COUNT(*) as total_books FROM tbl_buku;
SELECT COUNT(*) as total_users FROM tbl_login;
SELECT COUNT(*) as total_categories FROM tbl_kategori;
SELECT COUNT(*) as total_shelves FROM tbl_rak;

-- Check for admin user
SELECT user, level FROM tbl_login WHERE level = 'admin' LIMIT 5;

SELECT 'Database verification completed!' as final_status;