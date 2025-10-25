-- Complete Migration Script: Shelf to Location + File Type Field
-- This script combines all necessary database changes

-- Step 1: Rename the table from tbl_rak to tbl_lokasi
RENAME TABLE tbl_rak TO tbl_lokasi;

-- Step 2: Rename columns in tbl_lokasi
ALTER TABLE tbl_lokasi 
CHANGE COLUMN id_rak id_lokasi int(11) NOT NULL AUTO_INCREMENT,
CHANGE COLUMN nama_rak nama_lokasi varchar(255) NOT NULL,
CHANGE COLUMN lokasi deskripsi varchar(255);

-- Step 3: Rename the foreign key column in tbl_buku
ALTER TABLE tbl_buku 
CHANGE COLUMN id_rak id_lokasi int(11);

-- Step 4: Add the file_type column to tbl_buku
ALTER TABLE tbl_buku 
ADD COLUMN file_type varchar(50) DEFAULT NULL;

-- Step 5: Add department column if it doesn't exist (in case it's missing)
-- This is a safety check - it might already exist
ALTER TABLE tbl_buku 
ADD COLUMN department varchar(255) DEFAULT NULL;

-- Step 6: Update existing data (optional - set default file types based on existing PDFs)
-- UPDATE tbl_buku SET file_type = 'PDF' WHERE lampiran IS NOT NULL AND lampiran != '';
-- UPDATE tbl_buku SET file_type = 'Hardcopy' WHERE lampiran IS NULL OR lampiran = '';

-- Verification queries (uncomment to run after migration):
-- SELECT COUNT(*) as total_locations FROM tbl_lokasi;
-- SELECT COUNT(*) as total_books FROM tbl_buku;
-- DESCRIBE tbl_lokasi;
-- DESCRIBE tbl_buku;