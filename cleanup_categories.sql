-- CLEAN UP CATEGORIES - Remove unwanted categories and keep only predefined ones
-- WARNING: This will delete categories not in your predefined list!
-- Backup your database before running this script!

USE projek_perpus;

-- First, let's see what categories currently exist
SELECT id_kategori, nama_kategori FROM tbl_kategori ORDER BY nama_kategori;

-- Delete all categories that are NOT in the predefined list
DELETE FROM tbl_kategori 
WHERE nama_kategori NOT IN (
    'Book',
    'Journal', 
    'Proceeding',
    'Audio Visual',
    'Catalogue',
    'Flyer',
    'Training',
    'Poster', 
    'Thesis',
    'Report',
    'Newspaper'
);

-- Insert the predefined categories (if they don't exist)
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

-- Show final result
SELECT 'Categories after cleanup:' as status;
SELECT id_kategori, nama_kategori FROM tbl_kategori ORDER BY nama_kategori;

-- Reset AUTO_INCREMENT to clean up gaps (optional)
ALTER TABLE tbl_kategori AUTO_INCREMENT = 1;

SELECT 'Category cleanup completed! Only your 11 predefined categories remain.' as final_status;