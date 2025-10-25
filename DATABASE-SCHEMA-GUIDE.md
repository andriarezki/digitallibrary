# Database Schema & Migration Documentation

## 📋 Overview
This document details the database schema changes and migration procedures for the Digital Library application, including recent updates from October 2025.

---

## 🗄️ Current Database Schema

### Database Information
- **Database Name**: `projek_perpus`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Engine**: InnoDB (recommended)

---

## 📊 Table Structures

### 1. tbl_login (Users & Authentication)
```sql
CREATE TABLE `tbl_login` (
  `id_login` int NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `level` enum('admin','petugas','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_login`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Default Users:**
- `admin` / `admin123` (admin level)
- `user` / `user` (user level)

### 2. tbl_lokasi (Locations - formerly tbl_rak)
```sql
CREATE TABLE `tbl_lokasi` (
  `id_lokasi` int NOT NULL AUTO_INCREMENT,
  `nama_lokasi` varchar(100) NOT NULL,
  `deskripsi` text,
  `kapasitas` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lokasi`),
  UNIQUE KEY `nama_lokasi` (`nama_lokasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Sample Data:**
```sql
INSERT INTO `tbl_lokasi` VALUES 
(1, 'Bookcase', 'Main bookcase in library', 1000),
(2, 'Archive Room', 'Archive storage room', 500),
(3, 'Reference Section', 'Reference books section', 300);
```

### 3. tbl_kategori (Categories)
```sql
CREATE TABLE `tbl_kategori` (
  `id_kategori` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Sample Categories:**
```sql
INSERT INTO `tbl_kategori` VALUES 
(1, 'Agronomy'),
(2, 'Crop Protection'),
(3, 'Plant Breeding'),
(4, 'Journal'),
(5, 'Research Report'),
(21, 'Sustainability');
```

### 4. tbl_buku (Books/Documents)
```sql
CREATE TABLE `tbl_buku` (
  `id_buku` int NOT NULL AUTO_INCREMENT,
  `buku_id` varchar(20) DEFAULT NULL,
  `id_kategori` int DEFAULT NULL,
  `id_lokasi` int DEFAULT NULL,
  `sampul` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `lampiran` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `penerbit` varchar(100) DEFAULT NULL,
  `pengarang` varchar(255) DEFAULT NULL,
  `thn_buku` varchar(4) DEFAULT NULL,
  `isi` text,
  `jml` int DEFAULT 1,
  `tgl_masuk` date DEFAULT NULL,
  `tersedia` int DEFAULT 1,
  `department` varchar(100) DEFAULT NULL,
  `file_type` varchar(20) DEFAULT 'PDF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_buku`),
  KEY `idx_kategori` (`id_kategori`),
  KEY `idx_lokasi` (`id_lokasi`),
  KEY `idx_title` (`title`),
  KEY `idx_year` (`thn_buku`),
  KEY `idx_department` (`department`),
  CONSTRAINT `fk_buku_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `tbl_kategori` (`id_kategori`) ON DELETE SET NULL,
  CONSTRAINT `fk_buku_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `tbl_lokasi` (`id_lokasi`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key Features:**
- Full-text search on title, author, publisher, ISBN
- File type support (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
- Department-based filtering
- Year-based filtering (dynamic from database)
- Location-based organization

### 5. tbl_user_activity (User Activity Logs)
```sql
CREATE TABLE `tbl_user_activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_activity` (`user_id`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_login` (`id_login`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔄 Migration History

### October 2025 Updates

#### 1. Shelf to Location Migration
**Before (tbl_rak):**
- `id_rak` → `id_lokasi`
- `nama_rak` → `nama_lokasi`
- Table name: `tbl_rak` → `tbl_lokasi`

**Migration SQL:**
```sql
-- Rename table
RENAME TABLE tbl_rak TO tbl_lokasi;

-- Rename columns
ALTER TABLE tbl_lokasi 
CHANGE COLUMN id_rak id_lokasi int NOT NULL AUTO_INCREMENT,
CHANGE COLUMN nama_rak nama_lokasi varchar(100) NOT NULL;

-- Update foreign key references in tbl_buku
ALTER TABLE tbl_buku 
CHANGE COLUMN id_rak id_lokasi int DEFAULT NULL;

-- Drop old constraint and add new one
ALTER TABLE tbl_buku 
DROP FOREIGN KEY fk_buku_rak,
ADD CONSTRAINT fk_buku_lokasi 
FOREIGN KEY (id_lokasi) REFERENCES tbl_lokasi(id_lokasi) ON DELETE SET NULL;
```

#### 2. Enhanced Search Features
- Added dynamic year filtering
- Improved indexing for search performance
- Added file_type field support

#### 3. New API Endpoints
- `GET /api/years` - Fetch available years from database
- Enhanced filtering capabilities

---

## 📥 Migration Procedures

### For New Installations
```bash
# Use complete migration file
mysql -u root -p -e "CREATE DATABASE projek_perpus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u library_user -p projek_perpus < complete_migration.sql
```

### For Existing Installations
```bash
# Check current schema version
mysql -u library_user -p projek_perpus -e "SHOW TABLES LIKE 'tbl_rak';"

# If tbl_rak exists, run incremental migration
mysql -u library_user -p projek_perpus < server/migrations/rename_shelf_to_location.sql

# Verify migration
mysql -u library_user -p projek_perpus -e "SHOW TABLES;"
mysql -u library_user -p projek_perpus -e "DESCRIBE tbl_lokasi;"
```

### Migration Verification
```sql
-- Check all tables exist
SHOW TABLES;

-- Verify location table structure
DESCRIBE tbl_lokasi;

-- Verify foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'projek_perpus';

-- Check data integrity
SELECT COUNT(*) FROM tbl_buku WHERE id_lokasi IS NOT NULL;
SELECT COUNT(*) FROM tbl_lokasi;
```

---

## 🔍 Query Examples

### New Features Implementation

#### 1. Dynamic Year Filter Query
```sql
-- Get all available years (used by /api/years endpoint)
SELECT DISTINCT thn_buku 
FROM tbl_buku 
WHERE thn_buku IS NOT NULL 
  AND thn_buku != '' 
ORDER BY thn_buku DESC;
```

#### 2. Enhanced Book Search
```sql
-- Multi-filter search with year and location
SELECT 
    b.*,
    k.nama_kategori,
    l.nama_lokasi
FROM tbl_buku b
LEFT JOIN tbl_kategori k ON b.id_kategori = k.id_kategori
LEFT JOIN tbl_lokasi l ON b.id_lokasi = l.id_lokasi
WHERE 
    (b.title LIKE '%search_term%' 
     OR b.pengarang LIKE '%search_term%' 
     OR b.penerbit LIKE '%search_term%'
     OR b.isbn LIKE '%search_term%')
    AND (b.id_kategori = ? OR ? IS NULL)
    AND (b.id_lokasi = ? OR ? IS NULL)
    AND (b.department = ? OR ? IS NULL)
    AND (b.thn_buku = ? OR ? IS NULL)
ORDER BY b.created_at DESC
LIMIT ? OFFSET ?;
```

#### 3. Dashboard Statistics
```sql
-- Total books by location
SELECT 
    l.nama_lokasi,
    COUNT(b.id_buku) as total_books,
    SUM(b.tersedia) as available_books
FROM tbl_lokasi l
LEFT JOIN tbl_buku b ON l.id_lokasi = b.id_lokasi
GROUP BY l.id_lokasi, l.nama_lokasi;

-- Books by year distribution
SELECT 
    thn_buku as year,
    COUNT(*) as total_books
FROM tbl_buku 
WHERE thn_buku IS NOT NULL 
GROUP BY thn_buku 
ORDER BY thn_buku DESC;
```

---

## 🛠️ Maintenance Queries

### Database Optimization
```sql
-- Update table statistics
ANALYZE TABLE tbl_buku, tbl_lokasi, tbl_kategori, tbl_login, tbl_user_activity;

-- Optimize tables
OPTIMIZE TABLE tbl_buku, tbl_lokasi, tbl_kategori, tbl_login, tbl_user_activity;

-- Check table sizes
SELECT 
    table_name AS 'Table',
    round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'projek_perpus'
ORDER BY (data_length + index_length) DESC;
```

### Data Cleanup
```sql
-- Remove orphaned records
DELETE FROM tbl_buku WHERE id_kategori NOT IN (SELECT id_kategori FROM tbl_kategori);
DELETE FROM tbl_buku WHERE id_lokasi NOT IN (SELECT id_lokasi FROM tbl_lokasi);

-- Clean old activity logs (older than 1 year)
DELETE FROM tbl_user_activity WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## 📊 Performance Indexes

### Current Indexes
```sql
-- tbl_buku indexes for performance
CREATE INDEX idx_title ON tbl_buku(title);
CREATE INDEX idx_year ON tbl_buku(thn_buku);
CREATE INDEX idx_department ON tbl_buku(department);
CREATE INDEX idx_created_at ON tbl_buku(created_at);

-- tbl_user_activity indexes
CREATE INDEX idx_user_activity ON tbl_user_activity(user_id);
CREATE INDEX idx_activity_type ON tbl_user_activity(activity_type);
CREATE INDEX idx_created_at ON tbl_user_activity(created_at);

-- Full-text search index (optional, for better search performance)
ALTER TABLE tbl_buku ADD FULLTEXT(title, pengarang, penerbit, isi);
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Migration Fails - Foreign Key Constraints
```sql
-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
-- Run migration
-- Re-enable checks
SET FOREIGN_KEY_CHECKS = 1;
```

#### 2. Character Encoding Issues
```sql
-- Convert table charset
ALTER TABLE tbl_buku CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Performance Issues
```sql
-- Check slow queries
SHOW PROCESSLIST;

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## 📋 Database Backup & Restore

### Backup Commands
```bash
# Full database backup
mysqldump -u library_user -p --single-transaction --routines --triggers projek_perpus > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only backup
mysqldump -u library_user -p --no-data projek_perpus > schema_backup.sql

# Data only backup
mysqldump -u library_user -p --no-create-info projek_perpus > data_backup.sql
```

### Restore Commands
```bash
# Full restore
mysql -u library_user -p projek_perpus < backup_file.sql

# Schema only restore
mysql -u library_user -p projek_perpus < schema_backup.sql

# Data only restore
mysql -u library_user -p projek_perpus < data_backup.sql
```

---

*Last updated: October 25, 2025*
*Schema version: 2.0 (with location migration and dynamic filtering)*