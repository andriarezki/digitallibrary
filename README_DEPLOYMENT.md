# OFFLINE SERVER DEPLOYMENT GUIDE
## Digital Library with Enhanced Analytics

### OVERVIEW
This package contains the complete Digital Library application with new IP-based analytics and PDF view tracking features.

---

## 📁 PROJECT STRUCTURE
```
digitallibrary/
├── client/                 # React frontend
├── server/                 # Express.js backend
├── shared/                 # Shared TypeScript schemas
├── pdfs/                   # PDF storage directory
├── uploads/                # File upload directory
├── package.json            # Dependencies
├── DATABASE_CHANGES.md     # ⭐ Database migration guide
├── DEPLOYMENT_CHECKLIST.md # ⭐ Step-by-step deployment
└── server/migrations/      # ⭐ SQL migration scripts
```

---

## 🚀 QUICK DEPLOYMENT STEPS

### 1. Copy Files
- Copy entire `digitallibrary` folder to your offline server
- Ensure proper permissions (755 for folders, 644 for files)

### 2. Install Dependencies
```bash
cd digitallibrary
npm install
```

### 3. Database Migration
- Run SQL scripts in `server/migrations/` (see DATABASE_CHANGES.md)
- Update database connection in `server/db.ts`

### 4. Configuration
- Update database credentials
- Set production environment variables
- Configure file upload paths

### 5. Start Application
```bash
npm run build
npm start
```

---

## 🔗 IMPORTANT FILES FOR DEPLOYMENT

### ⭐ MUST READ:
1. **DATABASE_CHANGES.md** - Complete database migration guide
2. **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment process
3. **server/migrations/** - All SQL migration scripts

### Configuration Files:
- `server/db.ts` - Database connection settings
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database ORM configuration

---

## 🗄️ NEW DATABASE FEATURES

### Added Tables:
1. **tbl_pdf_views** - Tracks actual PDF reads/views
2. **tbl_site_visitors** - IP-based visitor analytics

### Enhanced Features:
- Real PDF view counting by category
- IP-based visitor tracking (no duplicate counting)
- Database-persistent analytics (survives server restart)
- Backward compatibility maintained

---

## 📞 SUPPORT
- Check server logs for any deployment issues
- Database migration scripts are idempotent (safe to run multiple times)
- All new features have fallback behavior for missing tables

---

## 🔄 ROLLBACK PROCEDURE
If issues occur, the system can operate with original functionality:
- Remove new tables: `DROP TABLE tbl_pdf_views, tbl_site_visitors;`
- Restart server - original in-memory counters will work

---

**Next Step:** Read `DATABASE_CHANGES.md` for detailed migration instructions.