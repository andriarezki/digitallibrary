# DEPLOYMENT CHECKLIST
## Step-by-Step Offline Server Setup

---

## 🎯 PRE-DEPLOYMENT REQUIREMENTS

### Server Requirements
- [ ] Node.js 16+ installed
- [ ] MySQL/MariaDB running
- [ ] Apache/Nginx configured (optional)
- [ ] Port 5000 available (or configure different port)

### File Permissions
- [ ] Web server has read access to project files
- [ ] Write permissions for `pdfs/` and `uploads/` directories
- [ ] Execute permissions for Node.js

---

## 📁 STEP 1: FILE TRANSFER

### Copy Project Files
```bash
# Copy entire digitallibrary folder to your server
scp -r digitallibrary/ user@your-server:/path/to/web/
# OR use FTP/file manager to upload the entire folder
```

### Set Permissions (Linux/Unix)
```bash
cd /path/to/digitallibrary
chmod -R 755 .
chmod -R 777 pdfs/
chmod -R 777 uploads/
```

### Windows Server
- Ensure IIS_IUSRS has read access to project
- Give write permissions to `pdfs\` and `uploads\` folders

---

## 🗄️ STEP 2: DATABASE SETUP

### 2.1 Create Database (if new installation)
```sql
CREATE DATABASE digitallibrary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON digitallibrary.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2.2 Import Existing Data (if migrating)
```bash
# If you have existing database dump
mysql -u root -p digitallibrary < your_existing_dump.sql
```

### 2.3 Add New Analytics Tables
**📋 CRITICAL STEP - Run these SQL commands:**

**Option A: phpMyAdmin**
1. Open phpMyAdmin → Select your database → SQL tab
2. Paste and execute:

```sql
-- PDF Views Tracking
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

-- Site Visitors Tracking
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

**Option B: MySQL Command Line**
```bash
cd digitallibrary
mysql -u root -p your_database_name < server/migrations/create_analytics_tables.sql
```

---

## ⚙️ STEP 3: CONFIGURATION

### 3.1 Database Connection
Edit `server/db.ts`:
```typescript
const connection = mysql.createPool({
  host: "localhost",              // Change if remote DB
  user: "library_user",           // Your DB user
  password: "your_password",      // Your DB password
  database: "digitallibrary",     // Your DB name
  port: 3306,                     // Your MySQL port
});
```

### 3.2 Environment Variables (Optional)
Create `.env` file:
```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=library_user
DB_PASSWORD=your_password
DB_NAME=digitallibrary
PORT=5000
```

### 3.3 Production Settings
Edit `package.json` scripts if needed:
```json
{
  "scripts": {
    "start": "node dist/server/index.js",
    "build": "tsc && vite build",
    "prod": "npm run build && npm start"
  }
}
```

---

## 📦 STEP 4: DEPENDENCIES & BUILD

### 4.1 Install Dependencies
```bash
cd digitallibrary
npm install --production
```

### 4.2 Build Application
```bash
npm run build
```

### 4.3 Verify Build
Check that `dist/` folder is created with compiled files.

---

## 🚀 STEP 5: START APPLICATION

### Development Mode (Testing)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Service/Daemon Setup (Linux)
Create systemd service `/etc/systemd/system/digitallibrary.service`:
```ini
[Unit]
Description=Digital Library Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/digitallibrary
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl enable digitallibrary
sudo systemctl start digitallibrary
```

---

## 🧪 STEP 6: TESTING & VERIFICATION

### 6.1 Basic Functionality
- [ ] Application starts without errors
- [ ] Can access login page: `http://your-server:5000`
- [ ] Login works with existing credentials
- [ ] Dashboard loads successfully

### 6.2 Database Connection
- [ ] Book listings appear
- [ ] Categories load correctly
- [ ] User management works

### 6.3 New Analytics Features
- [ ] PDF viewing increments counters
- [ ] Visit /pdfs/book_123.pdf (replace 123 with actual book ID)
- [ ] Check database: `SELECT * FROM tbl_pdf_views;`
- [ ] Dashboard shows visitor stats

### 6.4 File Operations
- [ ] PDF uploads work
- [ ] File downloads work
- [ ] Image uploads function

---

## 🔧 STEP 7: WEB SERVER INTEGRATION (Optional)

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
</VirtualHost>
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 STEP 8: MONITORING & LOGS

### Application Logs
```bash
# View real-time logs
tail -f /path/to/digitallibrary/logs/app.log

# Or if using systemd:
sudo journalctl -u digitallibrary -f
```

### Database Monitoring
```sql
-- Check analytics data growth
SELECT COUNT(*) as total_pdf_views FROM tbl_pdf_views;
SELECT COUNT(*) as unique_visitors FROM tbl_site_visitors;

-- Recent activity
SELECT * FROM tbl_pdf_views ORDER BY view_date DESC LIMIT 10;
```

---

## 🚨 TROUBLESHOOTING

### Common Issues & Solutions

#### Application Won't Start
```bash
# Check port availability
netstat -tlnp | grep :5000

# Check Node.js version
node --version  # Should be 16+

# Check dependencies
npm list --depth=0
```

#### Database Connection Errors
```bash
# Test database connection
mysql -u library_user -p digitallibrary -e "SHOW TABLES;"

# Check MySQL service
sudo systemctl status mysql
```

#### Analytics Not Working
```sql
-- Verify tables exist
SHOW TABLES LIKE 'tbl_%';

-- Check table structure
DESCRIBE tbl_pdf_views;

-- Test manual insert
INSERT INTO tbl_site_visitors (ip_address) VALUES ('127.0.0.1');
```

#### Permission Errors
```bash
# Fix file permissions
chown -R www-data:www-data /path/to/digitallibrary
chmod -R 755 /path/to/digitallibrary
chmod -R 777 /path/to/digitallibrary/pdfs
chmod -R 777 /path/to/digitallibrary/uploads
```

---

## 📋 FINAL VERIFICATION CHECKLIST

### Core Application
- [ ] Login page accessible
- [ ] User authentication works
- [ ] Dashboard displays correctly
- [ ] Book management functions
- [ ] Category management works
- [ ] Location management works
- [ ] PDF uploads/downloads work

### New Analytics Features
- [ ] PDF view tracking active
- [ ] Visitor counting by IP
- [ ] "Most Read by Category" shows real data
- [ ] Database tables created successfully
- [ ] Analytics persist after server restart

### Production Readiness
- [ ] Application runs as service
- [ ] Logs are accessible
- [ ] Backups configured
- [ ] Security settings applied
- [ ] Performance acceptable

---

## 📞 POST-DEPLOYMENT SUPPORT

### Monitoring Commands
```bash
# Check application status
sudo systemctl status digitallibrary

# View recent logs
sudo journalctl -u digitallibrary --since "1 hour ago"

# Database health check
mysql -u root -p -e "SELECT COUNT(*) FROM digitallibrary.tbl_pdf_views;"
```

### Regular Maintenance
- Monitor disk space (PDF/upload directories)
- Check database growth and performance
- Review application logs for errors
- Update dependencies periodically

---

**Deployment Status:** ✅ Ready for Production
**Estimated Setup Time:** 30-60 minutes
**Rollback Available:** ✅ Yes (remove new tables if needed)