-- IMMEDIATE FIX for server database
-- Run this on your server to add the missing file_type column

USE projek_perpus;

-- Add file_type column to tbl_buku
ALTER TABLE tbl_buku ADD COLUMN file_type VARCHAR(10);

-- Also check if department column exists, if not add it
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255);

-- Verify the changes
DESCRIBE tbl_buku;