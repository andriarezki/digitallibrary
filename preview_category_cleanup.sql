-- PREVIEW CATEGORIES TO BE DELETED
-- Run this first to see what will be removed

USE projek_perpus;

-- Show all current categories
SELECT 'CURRENT CATEGORIES:' as info;
SELECT id_kategori, nama_kategori, 
    CASE 
        WHEN nama_kategori IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper')
        THEN '✅ KEEP' 
        ELSE '❌ DELETE' 
    END as action
FROM tbl_kategori 
ORDER BY 
    CASE 
        WHEN nama_kategori IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper')
        THEN 0 
        ELSE 1 
    END,
    nama_kategori;

-- Show count of categories to be deleted
SELECT 'SUMMARY:' as info;
SELECT 
    COUNT(*) as total_categories,
    SUM(CASE WHEN nama_kategori IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper') THEN 1 ELSE 0 END) as categories_to_keep,
    SUM(CASE WHEN nama_kategori NOT IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper') THEN 1 ELSE 0 END) as categories_to_delete
FROM tbl_kategori;

-- Check if any books are using categories that will be deleted
SELECT 'BOOKS USING CATEGORIES TO BE DELETED:' as info;
SELECT 
    k.nama_kategori,
    COUNT(b.id_buku) as books_count
FROM tbl_kategori k
LEFT JOIN tbl_buku b ON k.id_kategori = b.id_kategori
WHERE k.nama_kategori NOT IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper')
GROUP BY k.id_kategori, k.nama_kategori
HAVING COUNT(b.id_buku) > 0
ORDER BY books_count DESC;