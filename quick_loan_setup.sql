-- Quick setup for testing the loan request page
-- Run this in your phpMyAdmin or MySQL

USE projek_perpus;

-- Create employees table with sample data
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample employees for testing
INSERT INTO tbl_employees (nik, name, email, phone, department, position) VALUES
('EMP001', 'John Doe', 'john.doe@company.com', '081234567890', 'IT', 'Software Developer'),
('EMP002', 'Jane Smith', 'jane.smith@company.com', '081234567891', 'HR', 'HR Manager'),
('EMP003', 'Bob Johnson', 'bob.johnson@company.com', '081234567892', 'Finance', 'Accountant'),
('EMP004', 'Alice Wilson', 'alice.wilson@company.com', '081234567893', 'Marketing', 'Marketing Specialist'),
('EMP005', 'Charlie Brown', 'charlie.brown@company.com', '081234567894', 'Operations', 'Operations Manager')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create loan requests table
CREATE TABLE IF NOT EXISTS tbl_loan_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    id_buku INT NOT NULL,
    employee_nik VARCHAR(20) NOT NULL,
    borrower_name VARCHAR(255) NOT NULL,
    borrower_email VARCHAR(255),
    borrower_phone VARCHAR(20),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_return_date DATE,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue') DEFAULT 'pending',
    approved_by INT,
    approval_date TIMESTAMP NULL,
    approval_notes TEXT,
    loan_date TIMESTAMP NULL,
    due_date DATE,
    return_date TIMESTAMP NULL,
    return_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_buku) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE,
    FOREIGN KEY (employee_nik) REFERENCES tbl_employees(nik) ON DELETE CASCADE
);

-- Create loan history table
CREATE TABLE IF NOT EXISTS tbl_loan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_request_id INT NOT NULL,
    action ENUM('submitted', 'approved', 'rejected', 'loaned', 'returned', 'overdue_notice') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT,
    notes TEXT,
    old_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue'),
    new_status ENUM('pending', 'approved', 'rejected', 'on_loan', 'returned', 'overdue'),
    
    FOREIGN KEY (loan_request_id) REFERENCES tbl_loan_requests(id) ON DELETE CASCADE
);

SELECT 'Loan system setup completed! You can now test the loan request page.' as status;