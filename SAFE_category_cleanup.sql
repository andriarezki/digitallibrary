-- SAFE CATEGORY CLEANUP SCRIPT
-- This script will backup existing categories, then clean up to keep only your predefined ones

USE projek_perpus;

-- STEP 1: Create backup of existing categories
CREATE TABLE IF NOT EXISTS tbl_kategori_backup AS 
SELECT * FROM tbl_kategori;

-- STEP 2: Show what we're about to do
SELECT 'CATEGORIES THAT WILL BE DELETED:' as action;
SELECT id_kategori, nama_kategori 
FROM tbl_kategori 
WHERE nama_kategori NOT IN (
    'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
    'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
)
ORDER BY nama_kategori;

-- STEP 3: Count what will happen
SELECT 
    (SELECT COUNT(*) FROM tbl_kategori) as total_before,
    (SELECT COUNT(*) FROM tbl_kategori WHERE nama_kategori IN (
        'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
        'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
    )) as will_keep,
    (SELECT COUNT(*) FROM tbl_kategori WHERE nama_kategori NOT IN (
        'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
        'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
    )) as will_delete;

-- STEP 4: Check books that use categories to be deleted
SELECT 'BOOKS AFFECTED BY DELETION:' as info;
SELECT 
    k.nama_kategori,
    COUNT(b.id_buku) as books_count
FROM tbl_kategori k
LEFT JOIN tbl_buku b ON k.id_kategori = b.id_kategori
WHERE k.nama_kategori NOT IN (
    'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
    'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
)
GROUP BY k.id_kategori, k.nama_kategori
HAVING COUNT(b.id_buku) > 0
ORDER BY books_count DESC;

-- STEP 5: Update books that use deleted categories to NULL (uncategorized)
UPDATE tbl_buku 
SET id_kategori = NULL 
WHERE id_kategori IN (
    SELECT id_kategori FROM (
        SELECT id_kategori FROM tbl_kategori 
        WHERE nama_kategori NOT IN (
            'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
            'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
        )
    ) as subquery
);

-- STEP 6: Delete unwanted categories
DELETE FROM tbl_kategori 
WHERE nama_kategori NOT IN (
    'Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 
    'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper'
);

-- STEP 7: Ensure all predefined categories exist
INSERT INTO tbl_kategori (nama_kategori) VALUES
('Book'),
('Journal'),
('Proceeding'),
('Audio Visual'),
('Catalogue'),
('Flyer'),
('Training'),
('Poster'),
('Thesis'),
('Report'),
('Newspaper')
ON DUPLICATE KEY UPDATE nama_kategori = VALUES(nama_kategori);

-- STEP 8: Show final result
SELECT 'FINAL CATEGORIES:' as result;
SELECT id_kategori, nama_kategori 
FROM tbl_kategori 
ORDER BY nama_kategori;

SELECT 'CLEANUP COMPLETED!' as status, 
       COUNT(*) as final_category_count 
FROM tbl_kategori;