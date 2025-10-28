-- Insert some sample PDF view data for testing
-- Run this AFTER creating the tables to see the chart working with real view data

-- First, let's see what categories and books exist:
SELECT id_kategori, nama_kategori FROM tbl_kategori LIMIT 10;
SELECT id_buku, title, id_kategori FROM tbl_buku WHERE id_kategori IS NOT NULL LIMIT 10;

-- Sample data (adjust book_id and category_id based on your actual data):
INSERT INTO tbl_pdf_views (book_id, category_id, ip_address, user_agent, view_date) VALUES
(1, 1, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL 1 DAY),
(2, 1, '192.168.1.101', 'Chrome/90.0', NOW() - INTERVAL 2 DAYS),
(3, 2, '192.168.1.102', 'Firefox/88.0', NOW() - INTERVAL 3 DAYS),
(1, 1, '192.168.1.103', 'Safari/14.0', NOW() - INTERVAL 1 HOUR),
(4, 3, '192.168.1.104', 'Edge/90.0', NOW() - INTERVAL 5 HOURS),
(2, 1, '192.168.1.105', 'Chrome/91.0', NOW() - INTERVAL 2 HOURS),
(5, 4, '192.168.1.106', 'Mozilla/5.0', NOW() - INTERVAL 30 MINUTES),
(3, 2, '192.168.1.107', 'Chrome/90.0', NOW() - INTERVAL 1 MINUTE);

-- Test the analytics query:
SELECT 
    k.nama_kategori as category,
    COUNT(pv.id) as views
FROM tbl_kategori k
LEFT JOIN tbl_pdf_views pv ON k.id_kategori = pv.category_id
GROUP BY k.id_kategori, k.nama_kategori
ORDER BY views DESC
LIMIT 5;