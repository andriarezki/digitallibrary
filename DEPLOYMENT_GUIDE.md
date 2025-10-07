# LIBRARY SYSTEM DEPLOYMENT GUIDE
# Complete step-by-step instructions for offline PC server deployment

## PREREQUISITES ON YOUR PC SERVER
1. XAMPP installed and running
2. Node.js installed (any version 16+)
3. MySQL/MariaDB running via XAMPP

## STEP-BY-STEP DEPLOYMENT

### PHASE 1: BACKUP EXISTING DATA
1. Backup your existing PDFs folder:
   ```
   Copy the entire 'pdfs' folder to a safe location
   Example: Copy D:\library\pdfs to D:\library_backup\pdfs
   ```

2. Backup your existing database:
   ```
   Open phpMyAdmin (http://localhost/phpmyadmin)
   Select 'projek_perpus' database
   Click 'Export' -> 'Go' to download backup
   ```

### PHASE 2: DEPLOY NEW CODE
1. Stop any running library application

2. Copy the new library folder to your PC server:
   ```
   - Copy ALL files EXCEPT the 'pdfs' folder
   - Keep your existing 'pdfs' folder untouched
   ```

3. Restore your PDFs folder:
   ```
   Copy your backed-up 'pdfs' folder back to the new library directory
   ```

### PHASE 3: DATABASE MIGRATION
1. Open phpMyAdmin on your PC server

2. Select the 'projek_perpus' database

3. Click 'SQL' tab

4. Copy and paste the contents of 'database_migration.sql' file

5. Click 'Go' to execute the migration

6. Verify the migration:
   ```sql
   DESCRIBE tbl_buku;
   ```
   You should see the 'department' column in the table structure

### PHASE 4: INSTALL DEPENDENCIES
1. Open Command Prompt/PowerShell in the library folder

2. Install dependencies (this requires one-time internet or copy node_modules):
   ```
   npm install
   ```
   
   OR if no internet:
   - Copy 'node_modules' folder from development machine
   - Copy 'package-lock.json' from development machine

### PHASE 5: UPDATE CONFIGURATION
1. Check database connection in server/db.ts:
   ```
   - Host: localhost
   - Database: projek_perpus  
   - User: root
   - Password: (your XAMPP MySQL password)
   ```

2. Verify file paths are correct for your server

### PHASE 6: START THE APPLICATION
1. Start XAMPP (MySQL and Apache)

2. Start the library application:
   ```
   npm run dev
   ```

3. Access the application:
   ```
   http://localhost:5000
   ```

### PHASE 7: VERIFICATION CHECKLIST
□ Can access login page
□ Can login with existing credentials
□ Can view document repository
□ PDF icons display correctly
□ Can edit documents (test the fixed edit function)
□ Can add new documents
□ Department field works in forms
□ Sticky header works when scrolling
□ All existing PDFs are accessible

## TROUBLESHOOTING

### If Node.js Dependencies Fail:
1. Copy the entire 'node_modules' folder from development machine
2. Ensure package.json and package-lock.json are copied

### If Database Connection Fails:
1. Check XAMPP MySQL is running
2. Verify database name is 'projek_perpus'
3. Check username/password in server/db.ts

### If PDFs Don't Display:
1. Ensure pdfs folder is in the root directory
2. Check file permissions
3. Verify uploads folder exists

### If Fonts Don't Load:
1. Ensure client/public/fonts folder is copied
2. Check font files are present
3. Verify font CSS files exist

## IMPORTANT NOTES
- Keep your existing 'pdfs' folder - DO NOT overwrite it
- The department column will be added automatically
- All new features will work with existing data
- Backup before deployment for safety

## SUPPORT
If you encounter issues:
1. Check console logs in browser (F12)
2. Check terminal output for server errors
3. Verify database migration completed successfully