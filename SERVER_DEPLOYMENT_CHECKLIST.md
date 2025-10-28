# Server Deployment Checklist

## 📋 Pre-Deployment Steps

### 1. Database Setup
- [ ] Ensure MySQL is running on your server
- [ ] Database `projek_perpus` exists
- [ ] Run the database setup script: `mysql -u root -p projek_perpus < server_database_setup.sql`
- [ ] Test database connection: `node test-db-connection.js`

### 2. File Transfer
- [ ] Copy the entire `digitallibrary` folder to your server
- [ ] Ensure all files are copied including:
  - [ ] `dist/` folder (build output)
  - [ ] `server/` folder
  - [ ] `shared/` folder
  - [ ] `package.json`
  - [ ] `.env.local` or create new `.env` file

### 3. Environment Configuration
Create `.env` file on your server with:
```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=projek_perpus
DB_PORT=3306

# Database URL for Drizzle migrations
DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/projek_perpus

# Server Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=5000

# Security
SESSION_SECRET=your-secure-random-secret-here
```

### 4. Dependencies Installation
- [ ] Node.js is installed (v18 or higher)
- [ ] Run: `npm install`

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Navigate to project folder
cd /path/to/digitallibrary

# Run database setup
mysql -u root -p projek_perpus < server_database_setup.sql

# Test database connection
node test-db-connection.js
```

### 2. Build and Start
```bash
# Build the project (if not already built)
npm run build

# Start the production server
npm start
```

### 3. Alternative: Direct Start
```bash
# Start development server (recommended for testing)
npm run dev
```

## 🔍 Verification Steps

### 1. Check Server Status
- [ ] Server starts without errors
- [ ] Shows: "serving on 0.0.0.0:5000"
- [ ] No database connection errors

### 2. Test API Endpoints
```bash
# Test basic connectivity
curl http://localhost:5000/

# Test locations API
curl http://localhost:5000/api/locations

# Test books API
curl http://localhost:5000/api/books

# Test categories API
curl http://localhost:5000/api/categories
```

### 3. Web Interface
- [ ] Open browser to `http://your-server-ip:5000`
- [ ] Login page loads
- [ ] Can navigate to all sections
- [ ] Books display correctly with file_type data
- [ ] Location data shows properly (as "Locations" in UI)

## ⚠️ Common Issues and Solutions

### Database Connection Issues
```bash
# Check MySQL service
systemctl status mysql

# Restart MySQL if needed
systemctl restart mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'projek_perpus';"
```

### Missing Fields Error
If you see "Unknown column" errors:
1. Run `server_database_setup.sql` again
2. Check table structure: `DESCRIBE tbl_buku;`
3. Verify all required fields exist

### Port Already in Use
```bash
# Find process using port 5000
netstat -tlnp | grep :5000

# Kill process if needed
kill -9 [process_id]
```

### File Permissions
```bash
# Ensure proper permissions
chmod -R 755 /path/to/digitallibrary
chown -R www-data:www-data /path/to/digitallibrary
```

## 📝 Production Notes

### Performance Optimization
- Use process manager like PM2:
```bash
npm install -g pm2
pm2 start "npm run dev" --name library-system
pm2 save
pm2 startup
```

### Backup Strategy
- Regular database backups:
```bash
mysqldump -u root -p projek_perpus > backup_$(date +%Y%m%d).sql
```

### Security Considerations
- [ ] Change default SESSION_SECRET
- [ ] Use strong MySQL password
- [ ] Configure firewall for port 5000
- [ ] Regular security updates

## 🎯 Success Criteria
- [ ] Application starts without errors
- [ ] All API endpoints respond correctly
- [ ] Web interface loads and functions
- [ ] Database queries work (books, categories, locations)
- [ ] Analytics tracking functions (if implemented)
- [ ] Charts display data correctly

---
**Last Updated**: $(date)
**Version**: 1.0 - Complete Database Integration