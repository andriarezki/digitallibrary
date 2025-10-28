-- Test Script: Verify Analytics Tables and Functions
-- Run this in phpMyAdmin after migration

-- 1. Check if new tables exist
SHOW TABLES LIKE 'tbl_%views';
SHOW TABLES LIKE 'tbl_site_visitors';

-- 2. Verify table structure
DESCRIBE tbl_pdf_views;
DESCRIBE tbl_site_visitors;

-- 3. Check existing categories for testing
SELECT id_kategori, nama_kategori FROM tbl_kategori LIMIT 5;

-- 4. Check existing books for testing
SELECT id_buku, title, id_kategori FROM tbl_buku WHERE lampiran IS NOT NULL LIMIT 5;

-- 5. Insert test data (optional - for demonstration)
-- INSERT INTO tbl_pdf_views (book_id, category_id, ip_address, user_agent) 
-- VALUES (1, 1, '192.168.1.100', 'Mozilla/5.0 Test Browser');

-- 6. Insert test visitor (optional - for demonstration)
-- INSERT INTO tbl_site_visitors (ip_address, user_agent) 
-- VALUES ('192.168.1.100', 'Mozilla/5.0 Test Browser');

-- 7. Test analytics queries
-- Views by category (should work after some PDF views are recorded)
SELECT 
    k.nama_kategori as category,
    COUNT(pv.id) as views
FROM tbl_kategori k
LEFT JOIN tbl_pdf_views pv ON k.id_kategori = pv.category_id
GROUP BY k.id_kategori, k.nama_kategori
ORDER BY views DESC
LIMIT 5;

-- 8. Visitor statistics
SELECT 
    COUNT(*) as unique_visitors,
    SUM(visit_count) as total_visits
FROM tbl_site_visitors;

-- 9. Recent PDF views (will be empty initially)
SELECT 
    b.title,
    k.nama_kategori,
    pv.ip_address,
    pv.view_date
FROM tbl_pdf_views pv
JOIN tbl_buku b ON pv.book_id = b.id_buku
JOIN tbl_kategori k ON pv.category_id = k.id_kategori
ORDER BY pv.view_date DESC
LIMIT 10;