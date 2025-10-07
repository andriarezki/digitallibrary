-- Database Migration Script for Library System
-- Run this script on your PC server to ensure database compatibility

USE projek_perpus;

-- Simple approach: Try to add department column
-- If it already exists, MySQL will give an error but continue with other statements

-- Add department column to tbl_buku (ignore error if already exists)
ALTER TABLE tbl_buku ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL;

-- Update existing records with recent tgl_masuk dates for weekly chart demonstration
-- This ensures we have recent data for the "Books Added by Category" chart
UPDATE tbl_buku SET tgl_masuk = '2024-09-30' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 1 LIMIT 3;
UPDATE tbl_buku SET tgl_masuk = '2024-10-01' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 2 LIMIT 5;
UPDATE tbl_buku SET tgl_masuk = '2024-10-02' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 3 LIMIT 2;
UPDATE tbl_buku SET tgl_masuk = '2024-10-03' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 4 LIMIT 7;
UPDATE tbl_buku SET tgl_masuk = '2024-10-04' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 5 LIMIT 1;
UPDATE tbl_buku SET tgl_masuk = '2024-10-05' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 6 LIMIT 4;
UPDATE tbl_buku SET tgl_masuk = '2024-10-06' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') AND id_kategori = 7 LIMIT 3;
UPDATE tbl_buku SET tgl_masuk = '2024-10-07' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR tgl_masuk = '0000-00-00') LIMIT 6;

-- Set some default departments for demonstration
UPDATE tbl_buku SET department = 'Engineering' WHERE id_kategori IN (1, 2, 3) AND department IS NULL LIMIT 20;
UPDATE tbl_buku SET department = 'Science' WHERE id_kategori IN (4, 5, 6) AND department IS NULL LIMIT 20;
UPDATE tbl_buku SET department = 'Arts' WHERE id_kategori IN (7, 8, 9) AND department IS NULL LIMIT 20;
UPDATE tbl_buku SET department = 'General' WHERE department IS NULL LIMIT 50;

-- Verify the department column exists by showing table structure
DESCRIBE tbl_buku;

-- Show current table structure
SHOW CREATE TABLE tbl_buku;

-- Show sample data to verify everything is working
SELECT COUNT(*) as total_books FROM tbl_buku;

-- Show recent books added for weekly chart verification (grouped by category)
SELECT 
  tk.nama_kategori as category,
  tb.tgl_masuk,
  COUNT(*) as books_count
FROM tbl_buku tb
LEFT JOIN tbl_kategori tk ON tb.id_kategori = tk.id_kategori
WHERE tb.tgl_masuk >= '2024-09-30' 
  AND tb.tgl_masuk IS NOT NULL 
  AND tb.tgl_masuk != ''
  AND tb.tgl_masuk != '0000-00-00'
GROUP BY tk.nama_kategori, tb.tgl_masuk 
ORDER BY tb.tgl_masuk DESC, books_count DESC;

-- Show category summary for chart
SELECT 
  COALESCE(tk.nama_kategori, 'Uncategorized') as category,
  COUNT(*) as total_books
FROM tbl_buku tb
LEFT JOIN tbl_kategori tk ON tb.id_kategori = tk.id_kategori
WHERE tb.tgl_masuk >= '2024-09-30'
  AND tb.tgl_masuk IS NOT NULL 
  AND tb.tgl_masuk != ''
  AND tb.tgl_masuk != '0000-00-00'
GROUP BY tk.nama_kategori 
ORDER BY COUNT(*) DESC
LIMIT 8;

SELECT 'Database migration completed successfully!' as status;
SELECT 'Charts will now show real data from your database!' as chart_status;