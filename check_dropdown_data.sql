-- =================================================================
-- CHECK DROPDOWN DATA ON YOUR DEVELOPMENT PC
-- =================================================================
-- Run these commands in phpMyAdmin on your DEV PC to see what data you have

-- 1. Check distinct departments in your books
SELECT DISTINCT department 
FROM tbl_buku 
WHERE department IS NOT NULL AND department != ''
ORDER BY department;

-- 2. Check distinct file types in your books  
SELECT DISTINCT file_type 
FROM tbl_buku 
WHERE file_type IS NOT NULL AND file_type != ''
ORDER BY file_type;

-- 3. Count books by department
SELECT department, COUNT(*) as book_count
FROM tbl_buku 
WHERE department IS NOT NULL AND department != ''
GROUP BY department
ORDER BY book_count DESC;

-- 4. Count books by file type
SELECT file_type, COUNT(*) as book_count
FROM tbl_buku 
WHERE file_type IS NOT NULL AND file_type != ''
GROUP BY file_type
ORDER BY book_count DESC;

-- 5. Sample data showing department and file_type
SELECT id_buku, title, department, file_type 
FROM tbl_buku 
WHERE department IS NOT NULL AND file_type IS NOT NULL
LIMIT 10;