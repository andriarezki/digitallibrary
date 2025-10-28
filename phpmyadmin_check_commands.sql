-- =================================================================
-- PHPMYADMIN COMMANDS TO CHECK DATABASE STRUCTURE
-- =================================================================
-- Run these in phpMyAdmin SQL tab to analyze your database

-- 1. Check current database
SELECT DATABASE() as current_database;

-- 2. Show all tables in the database
SHOW TABLES;

-- 3. Check tbl_buku structure (this is the main table causing issues)
DESCRIBE tbl_buku;

-- 4. Show detailed column information for tbl_buku
SHOW COLUMNS FROM tbl_buku;

-- 5. Check if file_type column exists
SHOW COLUMNS FROM tbl_buku LIKE 'file_type';

-- 6. Check if department column exists  
SHOW COLUMNS FROM tbl_buku LIKE 'department';

-- 7. Check tbl_rak structure (for locations)
DESCRIBE tbl_rak;

-- 8. Check tbl_kategori structure (for categories)
DESCRIBE tbl_kategori;

-- 9. Show sample data from tbl_buku (first 5 records)
SELECT * FROM tbl_buku LIMIT 5;

-- 10. Count total books
SELECT COUNT(*) as total_books FROM tbl_buku;

-- 11. Check if analytics tables exist (these might be missing on server)
SHOW TABLES LIKE 'tbl_user_activity';
SHOW TABLES LIKE 'tbl_pdf_views';
SHOW TABLES LIKE 'tbl_site_visitors';

-- 12. Get MySQL version
SELECT VERSION() as mysql_version;