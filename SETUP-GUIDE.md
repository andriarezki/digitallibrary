# Quick Setup Guide for Local PC

## Step-by-Step Installation

### 1. Extract Files
Extract the zip file to your desired location (e.g., `C:\library-system\`)

### 2. Install Node.js
Download and install Node.js 18+ from: https://nodejs.org/

### 3. Open Terminal/Command Prompt
Navigate to your project folder:
```bash
cd C:\library-system
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Create PDF Folder
Create a `pdfs` folder in the root directory:
```
library-system/
├── pdfs/          ← Create this folder
├── client/
├── server/
└── ...
```

### 6. Add Your PDF Files
Place all your hashed PDF files in the `pdfs` folder:
```
pdfs/
├── 8b702ea37c0dc4d83847036b1003a4f.pdf
├── a7841e8da591e6243d837638b1e036.pdf
├── 24ea2d17fbd59cccba25b3605b7b0c.pdf
├── f7fcda37f0422a47e6d489a7ed65e.pdf
└── ... (all your PDF files)
```

**Important**: The PDF filenames must exactly match the `lampiran` field in your database!

### 7. Database Setup
Create a `.env` file in the root directory:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=projek_perpus
DB_PORT=3306

# Database URL for Drizzle migrations
DATABASE_URL=mysql://root:@localhost:3306/projek_perpus

# Server Configuration
NODE_ENV=development
HOST=0.0.0.0
PORT=5000

# Security
SESSION_SECRET=library-management-secret-2025
```

**Note:** Replace the database values with your actual MySQL credentials if different from the defaults.

### 8. Update Database Schema
```bash
npm run db:push
```

### 9. Start the Application
```bash
npm run dev
```

### 10. Access Your Library
Open browser to: `http://localhost:5000`
Login: `admin` / `admin123`

## For LAN Access (Other PCs)

### Find Your IP Address
**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Linux/Mac:**
```bash
ifconfig
```

### Access from Other PCs
Other computers can access via: `http://YOUR_IP:5000`
Example: `http://192.168.1.100:5000`

## Database Connection Examples

### MySQL Example:
```env
DATABASE_URL=mysql://root:password@localhost:3306/library_db
```

### PostgreSQL Example:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/library_db
```

### Remote Database Example:
```env
DATABASE_URL=mysql://user:pass@192.168.1.50:3306/library_db
```

## Troubleshooting

### PDF Files Not Loading:
1. Check if `pdfs` folder exists in root directory
2. Verify PDF filenames exactly match database `lampiran` field
3. Ensure no spaces or special characters in filenames

### Database Connection Failed:
1. Check database is running
2. Verify connection string format
3. Test connection with database client first

### Port Already in Use:
1. Change port in `server/index.ts`
2. Or kill existing Node processes

### Cannot Access from Other PCs:
1. Check Windows Firewall settings
2. Ensure port 5000 is open
3. Verify IP address is correct

## File Structure Reference

```
library-system/
├── client/                 # Frontend React app
├── server/                 # Backend Express app
├── shared/                 # Shared types/schemas
├── pdfs/                  # Your PDF files go here
├── .env                   # Database config (create this)
├── package.json
└── README.md
```

## Need Help?
Check the main README.md for detailed information and troubleshooting.