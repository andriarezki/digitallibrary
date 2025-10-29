-- Add missing employee data for loan system testing
USE projek_perpus;

-- Insert employee with NIK 20000748 (the one being used in the loan request)
INSERT INTO tbl_employees (nik, name, email, phone, department, position, hire_date, is_active) 
VALUES 
('20000748', 'Aan', 'andriarezki@gmail.com', '081376434343', 'IT', 'Developer', '2020-01-01', 1);

-- Add a few more sample employees for testing
INSERT INTO tbl_employees (nik, name, email, phone, department, position, hire_date, is_active) 
VALUES 
('20000001', 'John Doe', 'john.doe@company.com', '081234567890', 'HR', 'Manager', '2019-01-15', 1),
('20000002', 'Jane Smith', 'jane.smith@company.com', '081234567891', 'Finance', 'Analyst', '2020-03-20', 1),
('20000003', 'Bob Wilson', 'bob.wilson@company.com', '081234567892', 'IT', 'Developer', '2021-06-10', 1),
('20000004', 'Alice Johnson', 'alice.johnson@company.com', '081234567893', 'Marketing', 'Specialist', '2022-02-14', 1),
('20000005', 'Charlie Brown', 'charlie.brown@company.com', '081234567894', 'Operations', 'Coordinator', '2021-09-05', 1);

-- Verify the data was inserted
SELECT * FROM tbl_employees WHERE nik LIKE '200000%';