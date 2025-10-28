# 🧹 Category Cleanup Instructions

## Problem: 
Your database has extra categories that are not in your predefined list, causing the dropdown to show unwanted categories.

## Solution Options:

### Option 1: Use SQL Script (Recommended - Fastest)
1. **Open phpMyAdmin** or your MySQL client
2. **Select your database** (`projek_perpus`)
3. **Run this script**:

```sql
USE projek_perpus;

-- Backup existing categories
CREATE TABLE IF NOT EXISTS tbl_kategori_backup AS SELECT * FROM tbl_kategori;

-- Show what will be deleted
SELECT 'CATEGORIES TO BE DELETED:' as info, nama_kategori 
FROM tbl_kategori 
WHERE nama_kategori NOT IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper');

-- Create Uncategorized category for books that lose their category
INSERT INTO tbl_kategori (nama_kategori) VALUES ('Uncategorized') ON DUPLICATE KEY UPDATE nama_kategori = 'Uncategorized';

-- Move books from deleted categories to Uncategorized
UPDATE tbl_buku b
JOIN tbl_kategori k ON b.id_kategori = k.id_kategori
SET b.id_kategori = (SELECT id_kategori FROM tbl_kategori WHERE nama_kategori = 'Uncategorized' LIMIT 1)
WHERE k.nama_kategori NOT IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper', 'Uncategorized');

-- Delete unwanted categories
DELETE FROM tbl_kategori 
WHERE nama_kategori NOT IN ('Book', 'Journal', 'Proceeding', 'Audio Visual', 'Catalogue', 'Flyer', 'Training', 'Poster', 'Thesis', 'Report', 'Newspaper', 'Uncategorized');

-- Ensure all predefined categories exist
INSERT INTO tbl_kategori (nama_kategori) VALUES
('Book'), ('Journal'), ('Proceeding'), ('Audio Visual'), ('Catalogue'), 
('Flyer'), ('Training'), ('Poster'), ('Thesis'), ('Report'), ('Newspaper')
ON DUPLICATE KEY UPDATE nama_kategori = VALUES(nama_kategori);

-- Show final result
SELECT 'FINAL CATEGORIES:' as result, nama_kategori FROM tbl_kategori ORDER BY nama_kategori;
```

### Option 2: Use API Endpoint (If you're logged in as admin)
1. **Login to your app** as admin
2. **Open browser console** (F12)
3. **Run this code**:

```javascript
fetch('/api/categories/cleanup', {method: 'POST'})
  .then(response => response.json())
  .then(data => {
    console.log('Result:', data);
    location.reload(); // Refresh page
  });
```

### Option 3: Use Node.js Script
1. **Run the cleanup script**:
```bash
node cleanup_categories.js
```

## ✅ What This Does:

1. **Backs up** your existing categories to `tbl_kategori_backup`
2. **Creates "Uncategorized"** category for orphaned books
3. **Moves books** from deleted categories to "Uncategorized"
4. **Deletes** all categories not in your predefined list
5. **Ensures** all your predefined categories exist

## 🎯 Expected Result:

After cleanup, your category dropdown will show only:
- Book
- Journal  
- Proceeding
- Audio Visual
- Catalogue
- Flyer
- Training
- Poster
- Thesis
- Report
- Newspaper
- Uncategorized (for books that lost their original category)

## 🔧 Files Ready for Deployment:

All your code changes are complete and ready to copy to your server:
- Category cleanup functionality ✅
- Loan system ✅  
- Category dropdowns ✅
- Database scripts ✅

**Just run the cleanup script and your categories will be perfect!** 🎉