-- =====================================================
-- COMPLETE DATABASE SETUP FOR SERVER DEPLOYMENT
-- =====================================================
-- This script ensures your server database has all the required fields and tables

USE projek_perpus;

-- Check and add file_type column to tbl_buku if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'projek_perpus' 
     AND TABLE_NAME = 'tbl_buku' 
     AND COLUMN_NAME = 'file_type') > 0,
    'SELECT "file_type column already exists";',
    'ALTER TABLE tbl_buku ADD COLUMN file_type VARCHAR(10);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add department column to tbl_buku if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'projek_perpus' 
     AND TABLE_NAME = 'tbl_buku' 
     AND COLUMN_NAME = 'department') > 0,
    'SELECT "department column already exists";',
    'ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255);'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create analytics tables if they don't exist

-- User activity tracking table
CREATE TABLE IF NOT EXISTS tbl_user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL COMMENT 'login, logout, view, etc.',
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON
);

-- PDF view tracking table
CREATE TABLE IF NOT EXISTS tbl_pdf_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_buku INT NOT NULL,
    user_id INT,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (id_buku) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE
);

-- Site visitor tracking table
CREATE TABLE IF NOT EXISTS tbl_site_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    visit_count INT DEFAULT 1,
    user_agent TEXT,
    UNIQUE KEY unique_ip (ip_address)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON tbl_user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON tbl_user_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_pdf_views_book_id ON tbl_pdf_views(id_buku);
CREATE INDEX IF NOT EXISTS idx_pdf_views_date ON tbl_pdf_views(view_date);
CREATE INDEX IF NOT EXISTS idx_site_visitors_ip ON tbl_site_visitors(ip_address);

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Show the structure of tbl_buku to verify fields
DESCRIBE tbl_buku;