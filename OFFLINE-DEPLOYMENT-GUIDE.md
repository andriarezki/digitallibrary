# Digital Library - Offline Server Deployment Guide

## 📋 Overview
This guide provides step-by-step instructions for deploying the Digital Library application on an offline server environment. The application includes recent updates with dynamic year filtering and improved UI components.

## 🗂️ Recent Updates (October 2025)
- **Dynamic Year Filter**: Loads available years from database instead of hardcoded values
- **Improved UI**: Hidden file type icons before document titles
- **Shelf to Location Migration**: Complete terminology migration from "shelf" to "location"
- **New API Endpoints**: Added `/api/years` for dynamic year filtering
- **Database Updates**: Enhanced schema with location-based structure

---

## 🛠️ Prerequisites

### System Requirements
- **Operating System**: Windows Server 2016/2019/2022 or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB free space
- **Network**: Optional (for initial setup only)

### Required Software
1. **Node.js**: Version 18.0.0 or higher
2. **MySQL**: Version 8.0 or higher
3. **Git**: For cloning the repository
4. **Text Editor**: VS Code or similar (optional)

---

## 📦 Installation Steps

### Step 1: System Preparation

#### For Windows Server:
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Install MySQL
choco install mysql

# Install Git
choco install git
```

#### For Linux (Ubuntu):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Git
sudo apt install git -y
```

### Step 2: Clone Repository
```bash
# Clone the repository
git clone https://github.com/andriarezki/digitallibrary.git
cd digitallibrary

# Verify you have the latest version with recent updates
git log --oneline -5
# Should show commit: "feat: Add dynamic year filter and UI improvements"
```

### Step 3: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list
```

### Step 4: Database Setup

#### Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE projek_perpus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON projek_perpus.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### Import Database Schema
```bash
# Navigate to project directory
cd digitallibrary

# Option 1: Use complete migration (recommended for new installations)
mysql -u library_user -p projek_perpus < complete_migration.sql

# Option 2: If you have existing database, run incremental migration
mysql -u library_user -p projek_perpus < server/migrations/rename_shelf_to_location.sql
```

### Step 5: Environment Configuration

#### Create Environment File
```bash
# Create .env file in project root
touch .env
```

#### Configure Environment Variables
```env
# .env file content
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_super_secure_session_secret_here_change_this

# Database Configuration
DB_HOST=localhost
DB_USER=library_user
DB_PASSWORD=secure_password_here
DB_NAME=projek_perpus
DB_PORT=3306

# File Upload Configuration
UPLOAD_DIR=./pdfs
MAX_FILE_SIZE=50MB

# Security Configuration
BCRYPT_ROUNDS=12
```

### Step 6: Database Verification

#### Run Database Verification Script
```bash
# Check if all tables exist and have correct structure
mysql -u library_user -p projek_perpus < database_verification.sql

# Manual verification
mysql -u library_user -p projek_perpus -e "SHOW TABLES;"
mysql -u library_user -p projek_perpus -e "DESCRIBE tbl_buku;"
mysql -u library_user -p projek_perpus -e "DESCRIBE tbl_lokasi;"
```

#### Expected Tables:
- `tbl_login` (Users and authentication)
- `tbl_buku` (Books/Documents with location references)
- `tbl_kategori` (Categories)
- `tbl_lokasi` (Locations - migrated from shelves)
- `tbl_user_activity` (User activity logs)

### Step 7: Create Required Directories
```bash
# Create upload directories
mkdir -p pdfs
mkdir -p uploads
mkdir -p logs

# Set proper permissions (Linux)
chmod 755 pdfs uploads logs
chown -R $USER:$USER pdfs uploads logs
```

### Step 8: Build Application
```bash
# Build the client-side application
npm run build

# Verify build completed successfully
ls -la dist/
```

### Step 9: Production Startup

#### Option 1: Direct Node.js
```bash
# Start the application
npm start

# Or using PM2 (recommended for production)
npm install -g pm2
pm2 start server/index.ts --name "digital-library" --interpreter tsx
pm2 save
pm2 startup
```

#### Option 2: Windows Service (Windows Server)
```powershell
# Install node-windows-service
npm install -g node-windows-service

# Create service
node-windows-service install --name "DigitalLibrary" --script "server/index.ts"
```

---

## 🔧 Configuration

### Default Admin Account
- **Username**: admin
- **Password**: admin123
- **Level**: admin

⚠️ **Important**: Change the default password immediately after first login!

### File Upload Configuration
- **Supported formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Maximum file size**: 50MB (configurable in .env)
- **Upload directory**: `./pdfs`

### Application URLs
- **Main Application**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/auth/me

---

## 📊 Database Migration Details

### Recent Schema Changes (October 2025)
1. **Shelf to Location Migration**:
   - Table `tbl_rak` renamed to `tbl_lokasi`
   - Column `id_rak` renamed to `id_lokasi`
   - Column `nama_rak` renamed to `nama_lokasi`
   - All foreign key references updated

2. **New Features**:
   - Added `getAvailableYears()` database method
   - Dynamic year filtering capability
   - Enhanced search functionality

### Migration Files
- `server/migrations/rename_shelf_to_location.sql` - Incremental migration
- `complete_migration.sql` - Full database schema with all updates

---

## 🚀 Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Update SESSION_SECRET in .env
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates (if needed)
- [ ] Enable database backup scheduling
- [ ] Configure log rotation
- [ ] Set up monitoring

### Performance Optimization
```bash
# Set Node.js production environment
export NODE_ENV=production

# Optimize MySQL settings
# Add to /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 2G
query_cache_size = 64M
max_connections = 200
```

### Backup Configuration
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backup/digital-library"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
mysqldump -u library_user -p projek_perpus > "$BACKUP_DIR/db_backup_$DATE.sql"

# Files backup
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" pdfs/ uploads/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -ti:5000 | xargs kill -9  # Linux
```

#### 2. Database Connection Failed
```bash
# Check MySQL status
systemctl status mysql  # Linux
net start mysql  # Windows

# Test connection
mysql -u library_user -p -h localhost
```

#### 3. File Upload Issues
```bash
# Check directory permissions
ls -la pdfs/
chmod 755 pdfs/  # Linux
```

#### 4. Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Log Files
- **Application logs**: Check console output or PM2 logs
- **Database logs**: `/var/log/mysql/error.log` (Linux)
- **System logs**: Windows Event Viewer or `/var/log/syslog` (Linux)

---

## 📞 Support

### Verification Commands
```bash
# Check application health
curl http://localhost:5000/api/health

# Check database connectivity
npm run check-db

# Verify all APIs
npm run test-apis
```

### Important Notes
1. **First-time setup**: Run database verification after import
2. **File permissions**: Ensure upload directories are writable
3. **Firewall**: Open port 5000 for application access
4. **Updates**: Always backup database before applying updates
5. **Monitoring**: Set up health checks for production environments

---

## 📋 Quick Start Checklist

- [ ] Install Node.js, MySQL, Git
- [ ] Clone repository with latest updates
- [ ] Install npm dependencies
- [ ] Create database and import schema
- [ ] Configure .env file
- [ ] Create upload directories
- [ ] Build application
- [ ] Start application service
- [ ] Change default admin password
- [ ] Test all functionality (login, upload, search, year filter)
- [ ] Set up backups and monitoring

---

*Last updated: October 25, 2025*
*Version: 2.0 (includes year filter and UI improvements)*