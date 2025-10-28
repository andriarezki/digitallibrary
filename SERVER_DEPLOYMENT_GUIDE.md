# 🚀 Loan System Server Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `LOAN_SYSTEM_DEPLOYMENT.sql` on your production database
- [ ] Verify all 3 tables are created: `tbl_employees`, `tbl_loan_requests`, `tbl_loan_history`
- [ ] Test foreign key constraints are working
- [ ] Insert your actual employee data (replace sample data)

### 2. Server Configuration Files

#### ✅ Already Configured:
- `shared/schema.ts` - Complete database schema with all imports
- `server/storage.ts` - Full loan system data layer
- `server/routes.ts` - All API endpoints for loans
- `client/src/pages/loan-request.tsx` - Complete form with error handling
- `client/src/pages/loans.tsx` - Beautiful management interface

#### 🔧 Server Environment Variables
Ensure your production `.env` file has:
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=projek_perpus
PORT=5000
```

### 3. Critical API Endpoints

#### Employee Management:
- `GET /api/employees` - List all employees
- `GET /api/employees/:nik` - Get employee by NIK
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

#### Loan Requests:
- `GET /api/loan-requests` - List all loan requests
- `POST /api/loan-requests` - Submit new loan request
- `PUT /api/loan-requests/:id` - Update loan request
- `PUT /api/loan-requests/:id/approve` - Approve loan
- `PUT /api/loan-requests/:id/reject` - Reject loan

#### Books Integration:
- `GET /api/books?available=true` - Get available books for loans

### 4. Database Migration Verification

Run these queries on your production database to verify:

```sql
-- Check tables exist
SHOW TABLES LIKE 'tbl_%employees%';
SHOW TABLES LIKE 'tbl_loan%';

-- Check foreign keys
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'projek_perpus' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Test sample data
SELECT COUNT(*) as employee_count FROM tbl_employees;
SELECT * FROM tbl_employees LIMIT 5;
```

### 5. Frontend Build & Deployment

#### For Production Build:
```bash
# Build the client
npm run build

# Start production server
npm start
```

#### Nginx Configuration (if using):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Production Testing Checklist

### 1. Basic Functionality:
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Login system works
- [ ] Navigation to loans page works

### 2. Loan Request Form:
- [ ] Form loads without errors
- [ ] Book search functionality works
- [ ] NIK auto-fill works with your employee data
- [ ] Form submission works
- [ ] Data saves to database correctly

### 3. Employee Data:
- [ ] Replace sample employees with real data
- [ ] Test NIK lookup with real employee NIKs
- [ ] Verify email/phone auto-fill works

### 4. Database Performance:
- [ ] Indexes are created (check deployment script)
- [ ] Foreign key constraints work
- [ ] Large book lists load efficiently

### 5. Error Handling:
- [ ] Invalid NIK shows proper error
- [ ] Missing required fields show validation
- [ ] Network errors are handled gracefully

## 🔒 Security Considerations

### Authentication:
- [ ] User must be logged in to access loan forms
- [ ] Admin approval required for loan requests
- [ ] Proper session management

### Data Validation:
- [ ] All form inputs are validated server-side
- [ ] SQL injection protection (using Drizzle ORM)
- [ ] XSS protection for text inputs

### Database Security:
- [ ] Use environment variables for DB credentials
- [ ] Limit database user permissions
- [ ] Regular database backups

## 📝 Employee Data Import

### Replace Sample Data:
1. Export your employee data to CSV format
2. Use the import script at `server/employee-import.ts`
3. Or manually run:

```sql
-- Clear sample data
DELETE FROM tbl_employees WHERE nik LIKE 'EMP%';

-- Insert your real employee data
INSERT INTO tbl_employees (nik, name, email, phone, department, position) VALUES
('REAL001', 'Real Employee 1', 'real1@company.com', '081234567890', 'IT', 'Developer'),
('REAL002', 'Real Employee 2', 'real2@company.com', '081234567891', 'HR', 'Manager');
-- ... add all your employees
```

## 🚨 Troubleshooting

### Common Issues:

#### "Cannot read properties of null"
- **Cause**: Missing null checks in book filtering
- **Status**: ✅ Fixed in latest code
- **Solution**: Already implemented proper null handling

#### "mysqlEnum is not defined"
- **Cause**: Missing import in schema.ts
- **Status**: ✅ Fixed in latest code
- **Solution**: All required imports are included

#### Foreign Key Constraint Errors:
- **Cause**: Referenced data doesn't exist
- **Solution**: Ensure books and employees exist before creating loan requests

#### Employee NIK Not Found:
- **Cause**: Employee data not imported
- **Solution**: Run the deployment SQL script and import your employee data

### Database Connection Issues:
```bash
# Check database connection
npm run dev
# Look for: "serving on 0.0.0.0:5000"
```

### Debugging API Calls:
Check browser Network tab for:
- 200: Success
- 404: Not found (check URL/data exists)
- 500: Server error (check server logs)

## 📋 Post-Deployment Todo

After successful deployment:

1. **Replace sample employee data** with your real employee database
2. **Build admin approval system** for loan management
3. **Set up automated email notifications** (optional)
4. **Configure overdue reminders** (optional)
5. **Add reporting dashboard** for loan statistics
6. **Set up database backups** with loan data included

## ✅ Success Indicators

Your deployment is successful when:
- [ ] Loan request form loads and works
- [ ] NIK auto-fill works with your employee data
- [ ] Book search shows available books
- [ ] Form submissions save to database
- [ ] No JavaScript errors in browser console
- [ ] Server logs show successful API calls

---

**Need Help?** Check the server logs and browser console for specific error messages.