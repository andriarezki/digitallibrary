# QUICK DEPLOYMENT CHECKLIST

## BEFORE YOU START
□ XAMPP installed on PC server
□ Node.js installed on PC server  
□ Existing 'pdfs' folder backed up
□ Database 'projek_perpus' exists
□ Admin login credentials known

## DEPLOYMENT STEPS

### 1. PREPARE PC SERVER
□ Stop any existing library application
□ Start XAMPP (MySQL service)
□ Backup existing pdfs folder

### 2. COPY FILES
□ Copy entire new library folder to PC server
□ EXCLUDE the 'pdfs' folder during copy
□ Restore your original 'pdfs' folder to new location

### 3. DATABASE SETUP
□ Open phpMyAdmin (localhost/phpmyadmin)
□ Select 'projek_perpus' database
□ Run 'database_verification.sql' to check current state
□ Run 'database_migration.sql' to add department column
□ Verify department column exists

### 4. INSTALL DEPENDENCIES
Choose ONE option:
□ Option A: Run 'start_server.bat' (requires internet)
□ Option B: Copy 'node_modules' folder from development machine

### 5. VERIFY DEPLOYMENT
□ Double-click 'start_server.bat' 
□ Check terminal shows "serving on 0.0.0.0:5000"
□ Open browser: http://localhost:5000
□ Login with existing credentials
□ Test document repository page
□ Test edit function (should work now!)
□ Check PDF icons display correctly
□ Verify sticky header when scrolling

## FILES TO COPY TO PC SERVER
□ All files and folders EXCEPT:
  - node_modules (install fresh or copy separately)
  - pdfs (keep your existing one)
  - .git (not needed for production)

## NEW FILES INCLUDED
□ database_migration.sql (run this in phpMyAdmin)
□ database_verification.sql (optional check)
□ DEPLOYMENT_GUIDE.md (detailed instructions)
□ start_server.bat (easy startup script)
□ QUICK_CHECKLIST.md (this file)

## WHAT'S NEW/FIXED
✅ Edit function now works properly
✅ PDF icons instead of book covers
✅ Sticky table headers when scrolling
✅ Department field fully integrated
✅ Consistent Poppins font throughout
✅ Better error handling and validation

## IF SOMETHING GOES WRONG
1. Check XAMPP MySQL is running
2. Check 'projek_perpus' database exists
3. Run database_verification.sql
4. Check terminal for error messages
5. Verify pdfs folder is in correct location
6. Try restarting the application

## SUPPORT COMMANDS

Check Node.js installed:
```
node --version
```

Check if dependencies installed:
```
dir node_modules
```

Start application manually:
```
npm run dev
```

Check database connection:
```
Run database_verification.sql in phpMyAdmin
```