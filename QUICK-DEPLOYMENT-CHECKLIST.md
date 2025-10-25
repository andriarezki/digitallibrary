# Digital Library - Quick Deployment Checklist

## 🚀 Pre-Deployment Checklist

### System Requirements ✅
- [ ] Node.js 18.0+ installed
- [ ] MySQL 8.0+ installed
- [ ] Git installed
- [ ] Minimum 4GB RAM
- [ ] 50GB free disk space

### Repository Setup ✅
- [ ] Clone latest repository: `git clone https://github.com/andriarezki/digitallibrary.git`
- [ ] Verify latest commit includes: "feat: Add dynamic year filter and UI improvements"
- [ ] Install dependencies: `npm install`

### Database Setup ✅
- [ ] Create database: `CREATE DATABASE projek_perpus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- [ ] Create user: `CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'secure_password';`
- [ ] Grant permissions: `GRANT ALL PRIVILEGES ON projek_perpus.* TO 'library_user'@'localhost';`
- [ ] Import schema: `mysql -u library_user -p projek_perpus < complete_migration.sql`
- [ ] Verify tables: `SHOW TABLES;` (should show tbl_login, tbl_buku, tbl_kategori, tbl_lokasi, tbl_user_activity)

### Environment Configuration ✅
- [ ] Create `.env` file with proper settings
- [ ] Set secure SESSION_SECRET
- [ ] Configure database credentials
- [ ] Set NODE_ENV=production

### File System Setup ✅
- [ ] Create directories: `mkdir -p pdfs uploads logs`
- [ ] Set proper permissions (Linux): `chmod 755 pdfs uploads logs`
- [ ] Verify write access to upload directories

### Application Build ✅
- [ ] Build client: `npm run build`
- [ ] Verify dist/ directory created
- [ ] Test build: `npm start` (should start without errors)

### Security Configuration ✅
- [ ] Change default admin password (admin/admin123)
- [ ] Update all default credentials
- [ ] Configure firewall rules (port 5000)
- [ ] Set up SSL certificates (if needed)

### Production Deployment ✅
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start with PM2: `pm2 start server/index.ts --name "digital-library" --interpreter tsx`
- [ ] Save PM2 config: `pm2 save`
- [ ] Setup startup script: `pm2 startup`

### Testing & Verification ✅
- [ ] Access application: http://localhost:5000
- [ ] Login with admin credentials
- [ ] Test document upload
- [ ] Test search functionality
- [ ] Test year filter (should load years from database)
- [ ] Verify location filter works
- [ ] Check UI improvements (no icons before titles)

### Backup & Monitoring ✅
- [ ] Set up automated database backups
- [ ] Configure log rotation
- [ ] Set up health monitoring
- [ ] Document backup/restore procedures

---

## 🔧 Quick Commands Reference

### Start/Stop Application
```bash
# Development
npm run dev

# Production with PM2
pm2 start digital-library
pm2 stop digital-library
pm2 restart digital-library
pm2 logs digital-library

# Direct production
npm start
```

### Database Operations
```bash
# Connect to database
mysql -u library_user -p projek_perpus

# Backup database
mysqldump -u library_user -p projek_perpus > backup_$(date +%Y%m%d).sql

# Import/restore database
mysql -u library_user -p projek_perpus < backup_file.sql

# Check tables
mysql -u library_user -p projek_perpus -e "SHOW TABLES;"
```

### System Health Checks
```bash
# Check port usage
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux

# Check application status
curl http://localhost:5000/api/auth/me

# Check disk space
df -h                         # Linux
dir                          # Windows

# Check processes
pm2 status
ps aux | grep node           # Linux
tasklist | findstr node      # Windows
```

---

## 🚨 Troubleshooting Quick Fixes

### Application Won't Start
```bash
# Kill processes using port 5000
taskkill /PID <PID> /F       # Windows
kill -9 <PID>                # Linux

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for errors
npm run build
node server/index.ts
```

### Database Connection Issues
```bash
# Check MySQL status
systemctl status mysql       # Linux
net start mysql              # Windows

# Test connection
mysql -u library_user -p -h localhost

# Reset user password
mysql -u root -p -e "ALTER USER 'library_user'@'localhost' IDENTIFIED BY 'new_password';"
```

### File Upload Issues
```bash
# Check directory permissions
ls -la pdfs/                 # Linux
dir pdfs\                    # Windows

# Fix permissions
chmod 755 pdfs/ uploads/     # Linux
```

---

## 📝 Important File Locations

- **Application**: `/digitallibrary/`
- **Configuration**: `.env`
- **Uploads**: `./pdfs/`
- **Logs**: `./logs/` or PM2 logs
- **Database backups**: `/backup/` (create this directory)
- **SSL certificates**: `/etc/ssl/` (Linux) or Certificate Store (Windows)

---

## 📞 Default Access Information

### Application Access
- **URL**: http://localhost:5000
- **Admin User**: admin / admin123
- **Regular User**: user / user

### Database Access
- **Host**: localhost
- **Port**: 3306
- **Database**: projek_perpus
- **User**: library_user

⚠️ **Change all default passwords before production deployment!**

---

## 🎯 Recent Features (October 2025)

✅ **Dynamic Year Filter**: Years are now loaded from database instead of hardcoded  
✅ **Clean UI**: File type icons removed from document titles  
✅ **Location Migration**: Complete shelf → location terminology migration  
✅ **Enhanced Search**: Improved filtering with multiple parameters  
✅ **API Endpoints**: New `/api/years` endpoint for dynamic filtering  

---

*Quick reference guide - Last updated: October 25, 2025*