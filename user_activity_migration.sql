-- User Activity Tracking Migration Script
-- Run this script to add user activity tracking functionality

USE projek_perpus;

-- Create user activity table for tracking user interactions
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

-- Insert some sample activity data for demonstration (optional)
-- This creates realistic user activity for the last 6 months
INSERT INTO tbl_user_activity (user_id, activity_type, activity_date, ip_address) VALUES
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

-- Show sample data to verify everything is working
SELECT 'User activity table created successfully!' as status;

-- Show monthly user activity summary
SELECT 
  DATE_FORMAT(activity_date, '%Y-%m') as month,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_activities
FROM tbl_user_activity 
WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(activity_date, '%Y-%m')
ORDER BY month;

-- Show recent activity
SELECT 
  ua.activity_type,
  ua.activity_date,
  l.nama as user_name,
  ua.ip_address
FROM tbl_user_activity ua
JOIN tbl_login l ON ua.user_id = l.id_login
ORDER BY ua.activity_date DESC
LIMIT 10;