-- DIAGNOSTIC: Check what's in the PDF views table and category distribution

USE projek_perpus;

-- Check recent PDF views and their categories
SELECT 'RECENT PDF VIEWS:' as info;
SELECT 
    pv.id,
    pv.book_id,
    pv.category_id,
    k.nama_kategori as category_name,
    b.title as book_title,
    pv.viewed_at,
    pv.ip_address
FROM tbl_pdf_views pv
LEFT JOIN tbl_kategori k ON pv.category_id = k.id_kategori
LEFT JOIN tbl_buku b ON pv.book_id = b.id_buku
ORDER BY pv.viewed_at DESC
LIMIT 20;

-- Check category distribution in PDF views
SELECT 'CATEGORY DISTRIBUTION IN PDF VIEWS:' as info;
SELECT 
    k.nama_kategori as category,
    COUNT(pv.id) as view_count
FROM tbl_pdf_views pv
LEFT JOIN tbl_kategori k ON pv.category_id = k.id_kategori
GROUP BY pv.category_id, k.nama_kategori
ORDER BY view_count DESC;

-- Check what categories books actually have
SELECT 'BOOK CATEGORY DISTRIBUTION:' as info;
SELECT 
    k.nama_kategori as category,
    COUNT(b.id_buku) as book_count
FROM tbl_buku b
LEFT JOIN tbl_kategori k ON b.id_kategori = k.id_kategori
GROUP BY b.id_kategori, k.nama_kategori
ORDER BY book_count DESC;

-- Check if PDF filenames can be matched to books
SELECT 'SAMPLE BOOKS WITH PDF FILES:' as info;
SELECT 
    b.id_buku,
    b.title,
    b.lampiran as pdf_filename,
    k.nama_kategori as category
FROM tbl_buku b
LEFT JOIN tbl_kategori k ON b.id_kategori = k.id_kategori
WHERE b.lampiran IS NOT NULL
AND b.lampiran != ''
ORDER BY b.id_buku DESC
LIMIT 10;