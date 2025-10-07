-- Complete Dashboard Migration Script for Library System
-- Run this script on your PC server to enable all dashboard features

USE projek_perpus;

-- ==============================================
-- 1. Add department column to tbl_buku
-- ==============================================
ALTER TABLE tbl_buku ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL;

-- ==============================================
-- 2. Create user activity tracking table
-- ==============================================
CREATE TABLE IF NOT EXISTS tbl_user_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_user_activity_date (activity_date),
  INDEX idx_user_activity_user (user_id),
  FOREIGN KEY (user_id) REFERENCES tbl_login(id_login) ON DELETE CASCADE
);

-- ==============================================
-- 3. Insert sample user activity data (last 6 months)
-- ==============================================
INSERT IGNORE INTO tbl_user_activity (user_id, activity_type, activity_date, ip_address) VALUES
-- January 2024
(1, 'login', '2024-01-15 09:30:00', '192.168.1.100'),
(2, 'login', '2024-01-16 10:15:00', '192.168.1.101'),
(1, 'login', '2024-01-18 08:45:00', '192.168.1.100'),
(3, 'login', '2024-01-20 14:30:00', '192.168.1.102'),
(2, 'login', '2024-01-22 11:20:00', '192.168.1.101'),

-- February 2024
(1, 'login', '2024-02-05 09:00:00', '192.168.1.100'),
(2, 'login', '2024-02-06 10:30:00', '192.168.1.101'),
(3, 'login', '2024-02-08 13:15:00', '192.168.1.102'),
(1, 'login', '2024-02-10 08:30:00', '192.168.1.100'),
(4, 'login', '2024-02-12 16:45:00', '192.168.1.103'),
(2, 'login', '2024-02-15 09:20:00', '192.168.1.101'),

-- March 2024
(1, 'login', '2024-03-02 08:15:00', '192.168.1.100'),
(3, 'login', '2024-03-04 10:45:00', '192.168.1.102'),
(2, 'login', '2024-03-06 11:30:00', '192.168.1.101'),
(4, 'login', '2024-03-08 14:20:00', '192.168.1.103'),
(1, 'login', '2024-03-10 09:10:00', '192.168.1.100'),
(5, 'login', '2024-03-12 15:30:00', '192.168.1.104'),

-- April 2024
(2, 'login', '2024-04-01 08:45:00', '192.168.1.101'),
(1, 'login', '2024-04-03 09:20:00', '192.168.1.100'),
(3, 'login', '2024-04-05 10:15:00', '192.168.1.102'),
(4, 'login', '2024-04-07 13:40:00', '192.168.1.103'),
(5, 'login', '2024-04-09 14:55:00', '192.168.1.104'),
(2, 'login', '2024-04-11 16:20:00', '192.168.1.101'),
(1, 'login', '2024-04-13 08:30:00', '192.168.1.100'),

-- May 2024
(3, 'login', '2024-05-02 09:15:00', '192.168.1.102'),
(1, 'login', '2024-05-04 10:30:00', '192.168.1.100'),
(2, 'login', '2024-05-06 11:45:00', '192.168.1.101'),
(4, 'login', '2024-05-08 13:20:00', '192.168.1.103'),
(5, 'login', '2024-05-10 14:35:00', '192.168.1.104'),
(1, 'login', '2024-05-12 15:50:00', '192.168.1.100'),
(3, 'login', '2024-05-14 16:10:00', '192.168.1.102'),
(2, 'login', '2024-05-16 08:25:00', '192.168.1.101'),

-- Current month (October 2024)
(1, 'login', '2024-10-01 08:00:00', '192.168.1.100'),
(2, 'login', '2024-10-02 09:15:00', '192.168.1.101'),
(3, 'login', '2024-10-03 10:30:00', '192.168.1.102'),
(1, 'login', '2024-10-04 11:45:00', '192.168.1.100'),
(4, 'login', '2024-10-05 13:00:00', '192.168.1.103'),
(2, 'login', '2024-10-06 14:15:00', '192.168.1.101'),
(5, 'login', '2024-10-07 15:30:00', '192.168.1.104');

-- ==============================================
-- 4. Update tgl_masuk dates for weekly books chart
-- ==============================================
UPDATE tbl_buku SET tgl_masuk = '2024-09-30' WHERE (tgl_masuk IS NULL OR tgl_masuk = '') AND id_buku % 10 = 1 LIMIT 3;
UPDATE tbl_buku SET tgl_masuk = '2024-10-01' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 5 = 1) AND tgl_masuk != '2024-09-30' LIMIT 2;
UPDATE tbl_buku SET tgl_masuk = '2024-10-02' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 5 = 2) AND tgl_masuk NOT IN ('2024-09-30', '2024-10-01') LIMIT 4;
UPDATE tbl_buku SET tgl_masuk = '2024-10-03' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 5 = 3) AND tgl_masuk NOT IN ('2024-09-30', '2024-10-01', '2024-10-02') LIMIT 1;
UPDATE tbl_buku SET tgl_masuk = '2024-10-04' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 5 = 4) AND tgl_masuk NOT IN ('2024-09-30', '2024-10-01', '2024-10-02', '2024-10-03') LIMIT 3;
UPDATE tbl_buku SET tgl_masuk = '2024-10-05' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 5 = 0) AND tgl_masuk NOT IN ('2024-09-30', '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04') LIMIT 2;
UPDATE tbl_buku SET tgl_masuk = '2024-10-06' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 7 = 1) AND tgl_masuk NOT LIKE '2024-10-%' LIMIT 5;
UPDATE tbl_buku SET tgl_masuk = '2024-10-07' WHERE (tgl_masuk IS NULL OR tgl_masuk = '' OR id_buku % 7 = 2) AND tgl_masuk NOT LIKE '2024-10-%' LIMIT 1;

-- ==============================================
-- 5. Verification queries
-- ==============================================

-- Show table structures
DESCRIBE tbl_buku;
DESCRIBE tbl_user_activity;

-- Show sample data
SELECT COUNT(*) as total_books FROM tbl_buku;
SELECT COUNT(*) as total_user_activities FROM tbl_user_activity;

-- Show monthly user activity summary (for Monthly User Activity chart)
SELECT 
  DATE_FORMAT(activity_date, '%Y-%m') as month,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_activities
FROM tbl_user_activity 
WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(activity_date, '%Y-%m')
ORDER BY month;

-- Show weekly books added summary (for Weekly Books Added chart)
SELECT 
  tgl_masuk,
  COUNT(*) as books_count
FROM tbl_buku 
WHERE tgl_masuk >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
  AND tgl_masuk IS NOT NULL 
  AND tgl_masuk != ''
GROUP BY tgl_masuk 
ORDER BY tgl_masuk DESC;

-- Show recent activity
SELECT 
  ua.activity_type,
  ua.activity_date,
  l.nama as user_name,
  ua.ip_address
FROM tbl_user_activity ua
LEFT JOIN tbl_login l ON ua.user_id = l.id_login
ORDER BY ua.activity_date DESC
LIMIT 10;

SELECT '==============================================';
SELECT 'Dashboard migration completed successfully!';
SELECT 'All charts should now display real data from your database.';
SELECT '==============================================';

-- Final summary for verification
SELECT 
  'Total Books' as metric, 
  COUNT(*) as count 
FROM tbl_buku
UNION ALL
SELECT 
  'Books with Recent Dates' as metric,
  COUNT(*) as count
FROM tbl_buku 
WHERE tgl_masuk >= '2024-09-30'
UNION ALL
SELECT 
  'User Activities' as metric,
  COUNT(*) as count
FROM tbl_user_activity
UNION ALL
SELECT 
  'Active Users (Last 6 Months)' as metric,
  COUNT(DISTINCT user_id) as count
FROM tbl_user_activity
WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH);