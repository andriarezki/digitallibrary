-- Migration to rename shelf (rak) to location (lokasi)
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

-- Step 4: Update any existing foreign key constraints if they exist
-- Note: This might vary depending on your current constraints
-- Check and update foreign key constraints if needed