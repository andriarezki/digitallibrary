# Staff Management System - Deployment Guide

## Overview
This guide covers the deployment of the comprehensive staff management system that includes CSV bulk import functionality.

## Features Implemented

### 1. Database Schema
- **tbl_staff** table with comprehensive fields matching CSV structure:
  - `id_staff` (Primary Key)
  - `staff_name` (Required)
  - `initial_name` (Optional)
  - `nik` (Required, Unique - National ID Number)
  - `section_name` (Department section)
  - `department_name` (Full department name)
  - `dept_name` (Department code: DIAD, CROP, AGRO, etc.)
  - `no_hp` (Phone number)
  - `email` (Email address)
  - `status` (1=Active, 0=Inactive)
  - `position` (Job position)
  - `photo` (Photo filename)
  - `created_at` and `updated_at` (Timestamps)

### 2. API Endpoints
- `GET /api/staff` - List staff with pagination and search
- `GET /api/staff/:id` - Get staff by ID
- `GET /api/staff/nik/:nik` - Get staff by NIK
- `POST /api/staff` - Create new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `POST /api/staff/bulk-import` - Bulk import from CSV
- `GET /api/staff/meta/departments` - Get department list
- `GET /api/staff/meta/sections` - Get section list

### 3. Frontend Features
- Staff listing with search and pagination
- Add/Edit/Delete staff members
- **CSV Import Feature** - Upload and bulk import staff data
- Department and section filtering
- Responsive design
- Admin/Petugas role-based access

## Deployment Steps

### Step 1: Database Migration
Run the SQL migration to create the staff table:

```sql
-- Execute the staff_table_migration.sql file
-- This creates the tbl_staff table with proper indexes
```

### Step 2: Application Access
1. Navigate to the staff management page: `/staff`
2. Available in the sidebar under "Staff" (for admin/petugas users)

### Step 3: CSV Import Process
1. Click "Import CSV" button
2. Select your CSV file (must be semicolon-separated)
3. Expected CSV format:
   ```
   id_staff;staff_name;initial_name;nik;section_name;department_name;dept_name;no_hp;email;status;position;photo
   1;John Doe;JD;20000123;Research;R&D Department;RND;081234567890;john@company.com;1;Researcher;JOHN
   ```
4. Preview data before importing
5. Confirm import to add all staff records

### Step 4: CSV File Requirements
- **Format**: Semicolon-separated values (;)
- **Encoding**: UTF-8
- **Required Fields**: staff_name, nik
- **Unique Fields**: nik (must be unique across all staff)
- **Status Values**: 1 (Active) or 0 (Inactive)
- **NULL Values**: Use 'NULL' or empty string for optional fields

## Data Validation

### Import Validation
- Checks for duplicate NIK numbers
- Validates required fields (staff_name, nik)
- Converts phone numbers (0 becomes null)
- Handles NULL/empty values appropriately

### Business Rules
- NIK must be unique across all staff
- Staff name is required
- Status defaults to 1 (Active)
- Email format validation (if provided)

## User Permissions
- **Admin**: Full access (view, add, edit, delete, import)
- **Petugas**: Full access (view, add, edit, delete, import)
- **Regular Users**: No access to staff management

## Error Handling
- Duplicate NIK detection during import
- Invalid data format warnings
- Network error handling
- User-friendly error messages

## Performance Considerations
- Pagination for large staff lists (25 per page)
- Search functionality across multiple fields
- Indexed database fields for fast queries
- Bulk import with error reporting

## Security Features
- Authentication required for all operations
- Role-based access control
- Input validation and sanitization
- SQL injection prevention

## Testing the Import Feature

### Sample CSV Data
Your CSV file `tabel_list_staff (SINET).csv` contains:
- 70+ staff records
- Various departments (DIAD, CROP, AGRO, LABO, etc.)
- Complete contact information
- Position and department details

### Import Process
1. Go to Staff page (`/staff`)
2. Click "Import CSV" 
3. Select your CSV file
4. Review preview (first 5 records shown)
5. Click "Import X Records" to proceed
6. Check results and handle any errors

## Troubleshooting

### Common Issues
1. **CSV Format Errors**: Ensure semicolon separation
2. **Duplicate NIK**: Check for existing staff with same NIK
3. **Permission Denied**: Verify user has admin/petugas role
4. **Database Connection**: Ensure MySQL is running

### Error Messages
- "Staff with NIK X already exists" - Duplicate NIK found
- "Invalid staff data provided" - Missing required fields
- "Failed to import staff data" - Database or network error

## Future Enhancements
- Photo upload functionality
- Advanced filtering and sorting
- Export to CSV/Excel
- Staff activity tracking
- Integration with HR systems

## File Structure
```
/digitallibrary
├── shared/schema.ts                 # Updated with tblStaff
├── server/storage.ts               # Staff management functions
├── server/routes.ts                # Staff API endpoints
├── client/src/pages/staff.tsx      # Staff management page
├── client/src/App.tsx              # Updated with staff route
├── components/layout/Sidebar.tsx   # Updated navigation
└── staff_table_migration.sql      # Database migration
```

This implementation provides a complete staff management system with CSV import capability, matching your requirements for loading staff data from the SINET CSV file.