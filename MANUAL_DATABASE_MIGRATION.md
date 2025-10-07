# DATABASE MIGRATION - MANUAL STEPS
# Use this if the SQL scripts have permission issues

## METHOD 1: Using phpMyAdmin (Recommended)

1. Open phpMyAdmin in browser: http://localhost/phpmyadmin
2. Click on 'projek_perpus' database on the left
3. Click on 'tbl_buku' table
4. Click 'Structure' tab at the top
5. Scroll down and click 'Add column'
6. Fill in the form:
   - Name: department
   - Type: VARCHAR
   - Length/Values: 255
   - Default: NULL
   - Null: Check the checkbox
7. Click 'Save'

## METHOD 2: Using SQL tab in phpMyAdmin

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select 'projek_perpus' database
3. Click 'SQL' tab
4. Copy and paste this single command:

```sql
USE projek_perpus;
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255) NULL;
```

5. Click 'Go'
6. If you see error "Duplicate column name 'department'" - that's OK! It means the column already exists.

## METHOD 3: Manual verification

After adding the column, verify it worked:

1. In phpMyAdmin, go to 'projek_perpus' database
2. Click on 'tbl_buku' table
3. Click 'Structure' tab
4. Look for 'department' column in the list
5. It should show: department | varchar(255) | Yes | NULL

## TROUBLESHOOTING

### If you get permission errors:
1. Make sure you're logged in as 'root' in phpMyAdmin
2. Try restarting XAMPP MySQL service
3. Use Method 1 (GUI approach) instead of SQL

### If column already exists:
- That's perfectly fine! Your database is already ready
- You can skip the migration step

### If you can't access phpMyAdmin:
1. Make sure XAMPP Apache is running
2. Try: http://127.0.0.1/phpmyadmin
3. Check XAMPP control panel for any errors

## VERIFY MIGRATION SUCCESS

Run this query to confirm the department column exists:

```sql
DESCRIBE tbl_buku;
```

You should see 'department' listed as one of the columns.

## NEXT STEPS

After successful migration:
1. Start the library application
2. Test that everything works
3. The department field will appear in forms automatically