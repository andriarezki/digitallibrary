# SERVER DEPLOYMENT TROUBLESHOOTING GUIDE

## Issues When Moving from Development PC to Server

### Problem Summary
When deploying the digital library application from development PC to server, database schema mismatches cause API failures.

### Common Schema Issues

1. **file_type field missing** ✅ FIXED
   - Error: `Unknown column 'tbl_buku.file_type' in 'field list'`
   - Solution: Removed from schema and queries

2. **department field might be missing**
   - Error: `Unknown column 'tbl_buku.department' in 'field list'`
   - Check: Run validation script to confirm

3. **Analytics tables missing**
   - Tables: `tbl_user_activity`, `tbl_pdf_views`, `tbl_site_visitors`
   - These are new features that might not exist on server

### Step-by-Step Server Deployment

#### Step 1: Database Schema Validation
Run the validation script on your server:

```bash
# Copy validate-schema.js to your server
node server/validate-schema.js
```

This will tell you exactly which tables and columns exist on your server.

#### Step 2: Schema Compatibility Fixes

Based on validation results, you may need to:

**Option A: Add missing columns to server database**
```sql
-- If department column is missing
ALTER TABLE tbl_buku ADD COLUMN department VARCHAR(255);

-- If you want analytics features
-- Run the migration scripts from server/migrations/
```

**Option B: Remove incompatible fields from code**
```bash
# Use the compatibility version we'll create
cp shared/schema-server-compatible.ts shared/schema.ts
```

#### Step 3: Database Connection Configuration
Update server database connection in `server/db.ts`:

```typescript
// Make sure these match your server settings
export const db = drizzle(mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_server_password',
  database: 'projek_perpus' // Your server database name
}));
```

#### Step 4: Test Core Functionality
```bash
# Test each API endpoint
curl http://localhost:5000/api/books
curl http://localhost:5000/api/categories  
curl http://localhost:5000/api/locations
```

### Quick Compatibility Check

If you're getting database errors, the fastest solution is:

1. **Remove analytics features temporarily:**
   - Comment out analytics routes in `server/routes.ts`
   - Skip analytics database queries

2. **Remove department filtering:**
   - Remove department field from schema
   - Remove department queries from storage

3. **Test with minimal schema:**
   - Only use fields that definitely exist on server
   - Add features back one by one

### Error Patterns to Watch For

- `Unknown column 'tbl_buku.XXX'` → Field doesn't exist on server
- `Table 'projek_perpus.tbl_XXX' doesn't exist` → Analytics table missing
- `Connection refused` → Database credentials/name mismatch

### Files That Need Server-Specific Updates

1. `shared/schema.ts` - Remove incompatible fields
2. `server/storage.ts` - Update queries to match server schema  
3. `server/db.ts` - Update connection settings
4. `server/routes.ts` - Comment out features that need missing tables

Would you like me to create the specific compatibility files for your server?