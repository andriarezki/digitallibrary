-- COMPREHENSIVE LOAN SYSTEM DEPLOYMENT SCRIPT
-- Run this script on your production server to set up the complete loan system
-- 
-- Instructions:
-- 1. Backup your current database first!
-- 2. Run this script in your MySQL/phpMyAdmin
-- 3. Update your server's .env file with correct database credentials
-- 4. Test the loan system functionality

-- Select your database (adjust database name as needed)
USE projek_perpus;

-- ===== CREATE LOAN SYSTEM TABLES =====

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS tbl_employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nik (nik),
    INDEX idx_status (status),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Loan Requests Table
CREATE TABLE IF NOT EXISTS tbl_loan_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    id_buku INT NOT NULL,
    employee_nik VARCHAR(20) NOT NULL,
    borrower_name VARCHAR(255) NOT NULL,
    borrower_email VARCHAR(255),
    borrower_phone VARCHAR(20),
    
    -- Request details
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_return_date DATE,
    reason TEXT,
    
    -- Approval workflow
    status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue') DEFAULT 'pending',
    
    -- Admin approval details
    approved_by INT,
    approval_date TIMESTAMP NULL,
    approval_notes TEXT,
    
    -- Loan management
    loan_date TIMESTAMP NULL,
    due_date DATE,
    return_date TIMESTAMP NULL,
    return_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (id_buku) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE,
    FOREIGN KEY (employee_nik) REFERENCES tbl_employees(nik) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES tbl_login(id_login) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_request_id (request_id),
    INDEX idx_employee_nik (employee_nik),
    INDEX idx_status (status),
    INDEX idx_book_id (id_buku),
    INDEX idx_request_date (request_date),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Loan History Table (for audit trail)
CREATE TABLE IF NOT EXISTS tbl_loan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_request_id INT NOT NULL,
    action ENUM('submitted', 'approved', 'rejected', 'loaned', 'returned', 'overdue_notice') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT,
    notes TEXT,
    old_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue'),
    new_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue'),
    
    FOREIGN KEY (loan_request_id) REFERENCES tbl_loan_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES tbl_login(id_login) ON DELETE SET NULL,
    
    INDEX idx_loan_request (loan_request_id),
    INDEX idx_action_date (action_date),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== INSERT SAMPLE DATA =====

-- Sample employees (you can replace with your actual employee data)
INSERT INTO tbl_employees (nik, name, email, phone, department, position) VALUES
('EMP001', 'John Doe', 'john.doe@company.com', '081234567890', 'IT', 'Software Developer'),
('EMP002', 'Jane Smith', 'jane.smith@company.com', '081234567891', 'HR', 'HR Manager'),
('EMP003', 'Bob Johnson', 'bob.johnson@company.com', '081234567892', 'Finance', 'Accountant'),
('EMP004', 'Alice Wilson', 'alice.wilson@company.com', '081234567893', 'Marketing', 'Marketing Specialist'),
('EMP005', 'Charlie Brown', 'charlie.brown@company.com', '081234567894', 'Operations', 'Operations Manager')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    email = VALUES(email),
    phone = VALUES(phone),
    department = VALUES(department),
    position = VALUES(position),
    updated_at = CURRENT_TIMESTAMP;

-- ===== VERIFY INSTALLATION =====

-- Check if tables were created successfully
SELECT 
    'Tables created successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_employees') as employees_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_loan_requests') as loan_requests_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_loan_history') as loan_history_table,
    (SELECT COUNT(*) FROM tbl_employees) as sample_employees_count;

-- ===== POST-DEPLOYMENT CHECKLIST =====
/*
After running this script, please verify:

1. DATABASE SETUP:
   ✓ All three tables created (tbl_employees, tbl_loan_requests, tbl_loan_history)
   ✓ Foreign key constraints are working
   ✓ Sample employee data is inserted

2. SERVER CONFIGURATION:
   ✓ Update your .env or database config with correct credentials
   ✓ Ensure your server can connect to the database
   ✓ Restart your Node.js server after database changes

3. API ENDPOINTS TO TEST:
   ✓ GET /api/employees - Should return employee list
   ✓ GET /api/books?available=true - Should return available books
   ✓ POST /api/loan-requests - Should accept loan submissions

4. FRONTEND TESTING:
   ✓ Login with your admin/user account
   ✓ Navigate to /loans page
   ✓ Click "New Loan Request"
   ✓ Test NIK auto-fill with EMP001-EMP005
   ✓ Test book search functionality
   ✓ Submit a loan request

5. SECURITY CONSIDERATIONS:
   ✓ Ensure proper user authentication
   ✓ Validate all form inputs
   ✓ Check foreign key constraints are working
   ✓ Test with your actual employee data

6. PERFORMANCE:
   ✓ Indexes are created for optimal performance
   ✓ Database queries are optimized
   ✓ Large datasets should load efficiently

NEXT STEPS:
- Replace sample employee data with your actual employee list
- Set up the admin approval system for loan management
- Configure email notifications (optional)
- Set up automated overdue reminders (optional)
*/

SELECT 'Loan System Deployment Complete! Check the post-deployment checklist above.' as final_status;