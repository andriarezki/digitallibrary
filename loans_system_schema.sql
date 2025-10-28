-- =================================================================
-- LOANS SYSTEM DATABASE SCHEMA
-- =================================================================
-- Complete loan management system with employee data and approval workflow

USE projek_perpus;

-- 1. Employee master data table (imported from Excel)
CREATE TABLE IF NOT EXISTS tbl_employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(20) UNIQUE NOT NULL COMMENT 'Employee NIK - unique identifier',
    name VARCHAR(255) NOT NULL COMMENT 'Full employee name',
    email VARCHAR(255) COMMENT 'Employee email address',
    phone VARCHAR(20) COMMENT 'Phone number',
    department VARCHAR(100) COMMENT 'Employee department',
    position VARCHAR(100) COMMENT 'Job position',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Employee status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nik (nik),
    INDEX idx_name (name),
    INDEX idx_department (department)
);

-- 2. Loan requests table (main loans functionality)
CREATE TABLE IF NOT EXISTS tbl_loan_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL COMMENT 'Unique request ID (auto-generated)',
    
    -- Book information
    id_buku INT NOT NULL COMMENT 'Book ID from tbl_buku',
    
    -- Borrower information
    employee_nik VARCHAR(20) NOT NULL COMMENT 'Employee NIK from tbl_employees',
    borrower_name VARCHAR(255) NOT NULL COMMENT 'Borrower full name',
    borrower_email VARCHAR(255) COMMENT 'Borrower email',
    borrower_phone VARCHAR(20) COMMENT 'Borrower phone',
    
    -- Request details
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When request was submitted',
    requested_return_date DATE COMMENT 'Requested return date',
    reason TEXT COMMENT 'Reason for borrowing (optional)',
    
    -- Approval workflow
    status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue') DEFAULT 'pending',
    
    -- Admin approval details
    approved_by INT COMMENT 'Admin user ID who approved/rejected',
    approval_date TIMESTAMP NULL COMMENT 'When request was approved/rejected',
    approval_notes TEXT COMMENT 'Admin notes for approval/rejection',
    
    -- Loan details (filled when approved)
    loan_date TIMESTAMP NULL COMMENT 'When book was actually loaned out',
    due_date DATE COMMENT 'Official due date for return',
    return_date TIMESTAMP NULL COMMENT 'When book was returned',
    return_notes TEXT COMMENT 'Notes about the return condition',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (id_buku) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE,
    FOREIGN KEY (employee_nik) REFERENCES tbl_employees(nik) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES tbl_login(id_login),
    
    -- Indexes for performance
    INDEX idx_request_id (request_id),
    INDEX idx_employee_nik (employee_nik),
    INDEX idx_book_id (id_buku),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date),
    INDEX idx_due_date (due_date)
);

-- 3. Loan history table (for tracking all loan activities)
CREATE TABLE IF NOT EXISTS tbl_loan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_request_id INT NOT NULL COMMENT 'Reference to tbl_loan_requests',
    action ENUM('submitted', 'approved', 'rejected', 'loaned', 'returned', 'overdue_notice') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT COMMENT 'User ID who performed the action',
    notes TEXT COMMENT 'Additional notes about the action',
    old_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue') COMMENT 'Previous status',
    new_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue') COMMENT 'New status',
    
    FOREIGN KEY (loan_request_id) REFERENCES tbl_loan_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES tbl_login(id_login),
    
    INDEX idx_loan_request (loan_request_id),
    INDEX idx_action_date (action_date),
    INDEX idx_action (action)
);

-- 4. Sample employee data (you can replace this with your Excel import)
INSERT INTO tbl_employees (nik, name, email, phone, department, position) VALUES
('EMP001', 'John Doe', 'john.doe@company.com', '081234567890', 'IT', 'Software Developer'),
('EMP002', 'Jane Smith', 'jane.smith@company.com', '081234567891', 'HR', 'HR Manager'),
('EMP003', 'Bob Johnson', 'bob.johnson@company.com', '081234567892', 'Finance', 'Accountant'),
('EMP004', 'Alice Wilson', 'alice.wilson@company.com', '081234567893', 'Marketing', 'Marketing Specialist'),
('EMP005', 'Charlie Brown', 'charlie.brown@company.com', '081234567894', 'Operations', 'Operations Manager')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 5. Create auto-increment function for request IDs
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_request_id() 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_id INT;
    DECLARE request_id VARCHAR(20);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_id, 4) AS UNSIGNED)), 0) + 1 
    INTO next_id 
    FROM tbl_loan_requests 
    WHERE request_id LIKE 'LR-%';
    
    SET request_id = CONCAT('LR-', LPAD(next_id, 6, '0'));
    RETURN request_id;
END//
DELIMITER ;

-- 6. Trigger to auto-generate request IDs
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_loan_request_insert 
BEFORE INSERT ON tbl_loan_requests
FOR EACH ROW
BEGIN
    IF NEW.request_id IS NULL OR NEW.request_id = '' THEN
        SET NEW.request_id = generate_request_id();
    END IF;
END//
DELIMITER ;

-- 7. Verify the setup
SELECT 'Loans system database setup completed successfully!' as status;

-- Show table structures
DESCRIBE tbl_employees;
DESCRIBE tbl_loan_requests;
DESCRIBE tbl_loan_history;