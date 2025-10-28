-- DEPLOYMENT VALIDATION SCRIPT
-- Run this after deploying to verify everything works correctly

USE projek_perpus;

-- ===== STEP 1: Verify Tables Exist =====
SELECT 
    'Table Check' as test_category,
    'tbl_employees' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_employees') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'Table Check' as test_category,
    'tbl_loan_requests' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_loan_requests') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'Table Check' as test_category,
    'tbl_loan_history' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_loan_history') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- ===== STEP 2: Check Data Integrity =====
SELECT 
    'Data Check' as test_category,
    'Employee Count' as test_name,
    CONCAT(COUNT(*), ' employees found') as result
FROM tbl_employees;

SELECT 
    'Data Check' as test_category,
    'Book Table Exists' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_buku') 
        THEN '✅ tbl_buku exists for foreign keys' 
        ELSE '❌ tbl_buku missing - loan requests will fail' 
    END as result;

-- ===== STEP 3: Test Foreign Key Constraints =====
SELECT 
    'Foreign Key Check' as test_category,
    CONSTRAINT_NAME as constraint_name,
    CONCAT(TABLE_NAME, '.', COLUMN_NAME, ' -> ', REFERENCED_TABLE_NAME, '.', REFERENCED_COLUMN_NAME) as relationship
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND REFERENCED_TABLE_NAME IS NOT NULL 
AND (TABLE_NAME LIKE '%loan%' OR TABLE_NAME LIKE '%employee%')
ORDER BY TABLE_NAME;

-- ===== STEP 4: Sample Employee Data Test =====
SELECT 
    'Sample Data' as test_category,
    nik,
    name,
    department,
    status,
    CASE 
        WHEN nik LIKE 'EMP%' THEN '🔄 Sample data - replace with real employees'
        ELSE '✅ Real employee data'
    END as data_type
FROM tbl_employees 
LIMIT 5;

-- ===== STEP 5: Index Performance Check =====
SELECT 
    'Performance Check' as test_category,
    'Index Count' as test_name,
    CONCAT('Found ', COUNT(*), ' indexes on loan tables') as result
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name IN ('tbl_employees', 'tbl_loan_requests', 'tbl_loan_history');

-- ===== STEP 6: Required Columns Check =====
SELECT 
    'Column Check' as test_category,
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN '✅ Required field'
        ELSE 'Optional field'
    END as field_type
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name IN ('tbl_employees', 'tbl_loan_requests', 'tbl_loan_history')
AND column_name IN ('nik', 'name', 'id_buku', 'employee_nik', 'status')
ORDER BY table_name, column_name;

-- ===== FINAL STATUS =====
SELECT 
    '🎯 DEPLOYMENT STATUS' as final_check,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('tbl_employees', 'tbl_loan_requests', 'tbl_loan_history')) = 3
        THEN '✅ ALL TABLES READY'
        ELSE '❌ MISSING TABLES'
    END as table_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM tbl_employees) > 0
        THEN '✅ EMPLOYEE DATA EXISTS'
        ELSE '❌ NO EMPLOYEE DATA'
    END as data_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tbl_buku')
        THEN '✅ BOOK INTEGRATION READY'
        ELSE '❌ BOOK TABLE MISSING'
    END as integration_status;

-- ===== NEXT STEPS MESSAGE =====
SELECT 
    '📋 NEXT STEPS' as category,
    'If all checks show ✅, your loan system is ready!' as message
UNION ALL
SELECT 
    '🔧 TODO',
    '1. Replace sample employee data with real data'
UNION ALL
SELECT 
    '🔧 TODO',
    '2. Test the loan request form in your application'
UNION ALL
SELECT 
    '🔧 TODO',
    '3. Verify NIK auto-fill works with your employee NIKs'
UNION ALL
SELECT 
    '🔧 TODO',
    '4. Build admin approval system for loan management';