-- SYNC CATEGORIES TO DATABASE
-- Run this script to ensure your database has the predefined categories

USE projek_perpus;

-- Insert/Update predefined categories
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

-- Verify categories were added
SELECT id_kategori, nama_kategori FROM tbl_kategori ORDER BY nama_kategori;

SELECT 'Categories synchronized successfully!' as status;