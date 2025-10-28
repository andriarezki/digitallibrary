# DATABASE CHANGES FOR OFFLINE SERVER
## Complete Migration Guide

---

## 🗄️ DATABASE SCHEMA CHANGES

### NEW TABLES TO ADD

#### 1. PDF Views Tracking Table
```sql
CREATE TABLE IF NOT EXISTS tbl_pdf_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id INT,
    INDEX idx_category_date (category_id, view_date),
    INDEX idx_book_date (book_id, view_date),
    INDEX idx_ip_date (ip_address, view_date),
    FOREIGN KEY (book_id) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tbl_kategori(id_kategori) ON DELETE CASCADE
);
```

#### 2. Site Visitors Tracking Table
```sql
CREATE TABLE IF NOT EXISTS tbl_site_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    visit_count INT DEFAULT 1 NOT NULL,
    user_agent TEXT,
    INDEX idx_ip (ip_address),
    INDEX idx_last_visit (last_visit)
);
```

---

## 📋 MIGRATION STEPS

### Method 1: phpMyAdmin (Recommended)
1. Open phpMyAdmin on your offline server
2. Select your database (usually `digitallibrary` or `projek_perpus`)
3. Click "SQL" tab
4. Copy and paste BOTH table creation scripts above
5. Click "Go"

### Method 2: MySQL Command Line
```bash
mysql -u root -p your_database_name < server/migrations/create_analytics_tables.sql
```

### Method 3: Manual Import
- Use the SQL file: `server/migrations/create_analytics_tables.sql`
- Import through your database admin tool

---

## ✅ VERIFICATION STEPS

### 1. Check Tables Created
```sql
SHOW TABLES LIKE 'tbl_%';
```
**Expected output:** Should include `tbl_pdf_views` and `tbl_site_visitors`

### 2. Verify Table Structure
```sql
DESCRIBE tbl_pdf_views;
DESCRIBE tbl_site_visitors;
```

### 3. Test Basic Functionality
```sql
-- Insert test data to verify tables work
INSERT INTO tbl_site_visitors (ip_address, user_agent) 
VALUES ('127.0.0.1', 'Test Browser');

-- Check if data was inserted
SELECT * FROM tbl_site_visitors;
```

---

## 🔄 EXISTING TABLES (No Changes Needed)
These tables remain unchanged:
- `tbl_login` - User authentication
- `tbl_buku` - Books/documents
- `tbl_kategori` - Categories
- `tbl_lokasi` - Locations
- `tbl_user_activity` - User activity logs

---

## 🚀 NEW FEATURES ENABLED

### 1. Real PDF View Tracking
- **Before:** Chart showed total documents per category
- **After:** Chart shows actual PDF reads/views per category

### 2. IP-Based Visitor Counting
- **Before:** Simple page refresh counters
- **After:** Unique visitor tracking by IP address

### 3. Persistent Analytics
- **Before:** Counters reset on server restart
- **After:** Data persists in database

---

## 🔧 DATABASE CONNECTION UPDATE

Update your database connection in `server/db.ts`:

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: "localhost",          // Your server IP
  user: "root",               // Your MySQL user
  password: "your_password",  // Your MySQL password
  database: "your_db_name",   // Your database name
  port: 3306,                 // Your MySQL port
});

export const db = drizzle(connection);
```

---

## 📊 NEW API ENDPOINTS AVAILABLE

After migration, these new endpoints will work:

### 1. Database Analytics
```
GET /api/dashboard/database-stats
Response: {
  "siteVisitorCount": 150,    // Unique IPs
  "pdfViewCount": 450,        // Total PDF views
  "uniquePdfViewers": 120     // Unique PDF viewers
}
```

### 2. Top Categories by Views
```
GET /api/dashboard/top-categories-by-views
Response: [
  { "category": "Journal", "views": 245 },
  { "category": "Books", "views": 178 }
]
```

### 3. Enhanced Most Read (Automatic)
```
GET /api/dashboard/most-read-by-category
Now returns actual PDF view counts instead of document counts
```

---

## ⚠️ TROUBLESHOOTING

### Issue: Tables Not Created
- **Solution:** Check database permissions
- **Check:** User has CREATE TABLE privileges
- **Alternative:** Use root account for migration

### Issue: Foreign Key Errors
- **Solution:** Ensure `tbl_buku` and `tbl_kategori` tables exist first
- **Check:** Primary keys exist in referenced tables

### Issue: Chart Still Shows Document Counts
- **Solution:** Tables exist but no PDF view data yet
- **Expected:** Chart will be empty until users view PDFs
- **Test:** Access PDFs via `/pdfs/book_123.pdf` to generate data

---

## 🔒 SECURITY CONSIDERATIONS

### IP Address Storage
- IP addresses are stored for analytics only
- Consider data retention policies for privacy compliance
- IPs are not linked to personal information

### Database Security
- Use strong passwords for database users
- Limit database user permissions to necessary tables only
- Regular backups of analytics data recommended

---

## 📈 MONITORING & MAINTENANCE

### Regular Checks
```sql
-- Monitor table growth
SELECT COUNT(*) as pdf_views FROM tbl_pdf_views;
SELECT COUNT(*) as unique_visitors FROM tbl_site_visitors;

-- Check recent activity
SELECT * FROM tbl_pdf_views ORDER BY view_date DESC LIMIT 10;
```

### Performance Optimization
- Tables include optimized indexes for common queries
- Consider archiving old data if tables become very large
- Monitor query performance in production

---

## 📝 DEPLOYMENT CHECKLIST

- [ ] Database connection configured
- [ ] Migration scripts executed
- [ ] Tables created successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Server starts without errors (`npm start`)
- [ ] PDF tracking works (test by viewing a PDF)
- [ ] Dashboard charts load correctly
- [ ] Analytics data accumulates over time

---

**Status:** Ready for production deployment
**Backward Compatibility:** ✅ Maintained
**Data Loss Risk:** ❌ None (additive changes only)