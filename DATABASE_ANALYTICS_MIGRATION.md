# DATABASE ANALYTICS MIGRATION GUIDE

## OVERVIEW

This migration adds comprehensive analytics tracking to the Digital Library system:

### New Features:
- **IP-based visitor tracking** (instead of simple counters)
- **Accurate PDF view counting by category** (database-backed)
- **Real-time analytics for "Most Read by Category" chart**
- **Unique visitor metrics**

## DATABASE CHANGES

### New Tables Created:

#### 1. tbl_pdf_views
Tracks every PDF view with book and category information:
```sql
CREATE TABLE tbl_pdf_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    FOREIGN KEY (book_id) REFERENCES tbl_buku(id_buku),
    FOREIGN KEY (category_id) REFERENCES tbl_kategori(id_kategori)
);
```

#### 2. tbl_site_visitors
Tracks unique visitors with IP-based identification:
```sql
CREATE TABLE tbl_site_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    visit_count INT DEFAULT 1,
    user_agent TEXT
);
```

## MIGRATION INSTRUCTIONS

### Method 1: phpMyAdmin (Recommended)

1. Open http://localhost/phpmyadmin
2. Select your database (likely 'projek_perpus' or 'digitallibrary')
3. Click 'SQL' tab
4. Copy and paste the entire contents of `server/migrations/create_analytics_tables.sql`
5. Click 'Go'

### Method 2: MySQL Command Line (if available)

If you have MySQL CLI in your PATH:
```bash
mysql -u root -p your_database_name < server/migrations/create_analytics_tables.sql
```

### Method 3: Manual Table Creation

Use phpMyAdmin's GUI to create tables manually using the schema above.

## API CHANGES

### New Endpoints:

#### 1. Database-based Visitor Stats
```
GET /api/dashboard/database-stats
```
Returns:
```json
{
  "siteVisitorCount": 150,      // Unique IP addresses
  "pdfViewCount": 450,          // Total PDF views
  "uniquePdfViewers": 120       // Unique IPs that viewed PDFs
}
```

#### 2. Top Categories by Actual Views
```
GET /api/dashboard/top-categories-by-views  
```
Returns:
```json
[
  { "category": "Journal", "views": 245 },
  { "category": "Books", "views": 178 },
  ...
]
```

### Enhanced Endpoints:

#### Most Read by Category (Enhanced)
```
GET /api/dashboard/most-read-by-category
```
Now uses actual PDF view data when available, falls back to book count for compatibility.

## BACKWARD COMPATIBILITY

### Legacy Support:
- Original in-memory counters still work
- Existing dashboard charts continue to function
- Gradual migration approach - old data preserved

### Dual Tracking:
- Both database and memory counters run simultaneously
- New installations get pure database tracking
- Existing installations gradually build database history

## PDF VIEW TRACKING

### Automatic Detection:
- PDF views automatically detected when files are accessed
- Book ID extracted from filename (supports formats like `book_123.pdf` or `123.pdf`)
- Category information linked through book database
- IP address and user agent captured for analytics

### Requirements:
- PDF files should follow naming convention: `book_{id}.pdf` or `{id}.pdf`
- Books must exist in database with valid category assignments

## TESTING THE MIGRATION

### 1. Verify Tables Created:
```sql
SHOW TABLES LIKE 'tbl_%_views';
SHOW TABLES LIKE 'tbl_site_visitors';
```

### 2. Test PDF Tracking:
1. Access any PDF through `/pdfs/book_123.pdf`
2. Check `tbl_pdf_views` table for new records
3. Verify category information is correctly captured

### 3. Test Visitor Tracking:
1. Visit dashboard multiple times
2. Check `tbl_site_visitors` table for IP entries
3. Verify visit count increments correctly

### 4. Test API Endpoints:
```bash
# Test database stats (requires authentication)
curl -X GET http://localhost:5000/api/dashboard/database-stats

# Test enhanced most-read data
curl -X GET http://localhost:5000/api/dashboard/most-read-by-category

# Test top categories by views
curl -X GET http://localhost:5000/api/dashboard/top-categories-by-views
```

## FRONTEND INTEGRATION

### Dashboard Charts:
- "Most Read by Category" now uses real view data
- Visitor counters show accurate unique visitor counts
- Charts automatically update with new tracking data

### Development Mode:
- Both old and new systems run in parallel
- Easy rollback if issues occur
- Progressive enhancement approach

## PERFORMANCE CONSIDERATIONS

### Database Indexes:
- Indexes added on commonly queried fields (category_id, view_date, ip_address)
- Optimized for dashboard query performance

### Data Growth:
- PDF views table will grow over time
- Consider implementing data retention policies for long-term deployments
- Archive old data if needed for performance

## TROUBLESHOOTING

### Common Issues:

#### 1. Tables Not Created:
- Check database permissions
- Verify database name matches configuration
- Use phpMyAdmin SQL tab for direct execution

#### 2. PDF Tracking Not Working:
- Verify PDF filename format matches expected pattern
- Check book exists in database with valid category
- Review server logs for tracking errors

#### 3. Zero View Counts:
- Normal for new installation
- Views accumulate as users access PDFs
- May take time to build historical data

### Log Messages:
Monitor server logs for:
- "Error recording PDF view" - indicates tracking issues
- "PDF views table not available" - migration needed
- "Error tracking PDF view" - database connection issues

## FUTURE ENHANCEMENTS

### Planned Features:
1. **User-specific Analytics**: Track individual user reading patterns
2. **Time-based Reports**: Daily/weekly/monthly analytics
3. **Popular Content Recommendations**: AI-driven suggestions
4. **Download Tracking**: Separate downloads from views
5. **Advanced Filtering**: Department, date range, user type filters

### Database Schema Extensions:
- Additional metadata fields (reading duration, partial views)
- Integration with user activity tracking
- Export capabilities for external analytics tools

## ROLLBACK PROCEDURE

If issues occur:

1. **Remove new tables** (data loss - backup first):
```sql
DROP TABLE tbl_pdf_views;
DROP TABLE tbl_site_visitors;
```

2. **Revert code changes**:
- Remove database import statements
- Restore original PDF serving middleware
- Comment out new API endpoints

3. **Restart server**:
- System returns to original in-memory counter behavior
- No data loss for existing functionality

## SUPPORT

### Resources:
- Server logs: Check for tracking and database errors
- Database admin: Use phpMyAdmin for table inspection
- API testing: Use browser dev tools or Postman
- Code review: Check `server/storage.ts` and `server/routes.ts`

For issues or questions, review the implementation in:
- `server/migrations/create_analytics_tables.sql`
- `shared/schema.ts` (new table definitions)
- `server/storage.ts` (tracking functions)
- `server/routes.ts` (API endpoints)