# Digital Library Management System

A comprehensive library management system with admin dashboard, MySQL integration, PDF viewing, and analytics for managing 17,000+ books on LAN network.

## Features

- **Dashboard**: Beautiful charts with soft colors showing collection status, top categories, and monthly activity
- **Book Management**: Complete CRUD operations with search, filtering, and pagination
- **PDF Viewer**: Integrated PDF viewer for digital books
- **Authentication**: Session-based authentication system
- **Search & Filters**: Real-time search with debounced input and category/shelf filtering
- **Analytics**: Visual charts and statistics for library insights

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MySQL/PostgreSQL database
- Your PDF files with hashed names

### Installation Steps

1. **Extract the zip file** to your desired location
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - Create your database (MySQL or PostgreSQL)
   - Update the `DATABASE_URL` in your environment variables

4. **Environment Configuration**:
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

5. **Database Migration**:
   ```bash
   npm run db:push
   ```

6. **PDF Files Setup**:
   - Create a `pdfs` folder in the root directory
   - Place all your PDF files with hashed names in this folder
   - Example structure:
   ```
   pdfs/
   ├── 8b702ea37c0dc4d83847036b1003a4f.pdf
   ├── a7841e8da591e6243d837638b1e036.pdf
   ├── 24ea2d17fbd59cccba25b3605b7b0c.pdf
   └── ...
   ```

7. **Start the Application**:
   ```bash
   npm run dev
   ```

8. **Access the System**:
   - Open browser to `http://localhost:5000`
   - Login with: `admin` / `admin123`

## Project Structure

```
library-system/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Application pages
│   │   └── lib/        # Utilities
├── server/             # Express.js backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database operations
├── shared/             # Shared types and schemas
├── pdfs/              # PDF files storage (create this)
└── package.json
```

## Database Schema

The system uses these tables:
- `tbl_login` - User authentication
- `tbl_kategori` - Book categories
- `tbl_rak` - Library shelves/racks
- `tbl_buku` - Book records with PDF references

## PDF File Management

### Important Notes:
1. **PDF Storage**: Place all PDF files in the `/pdfs` folder
2. **File Names**: Use the exact hashed filenames as stored in your database
3. **Database Reference**: The `lampiran` field in `tbl_buku` should contain the PDF filename
4. **Access**: PDFs are served at `/api/pdfs/filename.pdf`

### Example:
If your database has:
```sql
INSERT INTO tbl_buku (lampiran, title, ...) 
VALUES ('8b702ea37c0dc4d83847036b1003a4f.pdf', 'Book Title', ...);
```

Then place the file at:
```
pdfs/8b702ea37c0dc4d83847036b1003a4f.pdf
```

## LAN Network Access

To make the system accessible from other PCs on your LAN:

1. **Find your local IP**:
   ```bash
   ipconfig  # Windows
   ifconfig  # Linux/Mac
   ```

2. **Update server binding** in `server/index.ts`:
   ```typescript
   const port = 5000;
   const host = '0.0.0.0'; // Listen on all interfaces
   
   server.listen(port, host, () => {
     console.log(`Server running on http://0.0.0.0:${port}`);
   });
   ```

3. **Access from other PCs**:
   - Use your computer's IP address: `http://192.168.1.100:5000`
   - Replace `192.168.1.100` with your actual IP

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open database studio (if using Drizzle Studio)

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check your DATABASE_URL format
   - Ensure database is running
   - Verify credentials

2. **PDF Files Not Loading**:
   - Ensure `/pdfs` folder exists
   - Check file names match database exactly
   - Verify file permissions

3. **Port Already in Use**:
   - Change port in `server/index.ts`
   - Kill existing Node processes

### Default Login:
- Username: `admin`
- Password: `admin123`

## Support

For any issues with setup or configuration, check the database connection and ensure all PDF files are properly named and placed in the pdfs folder.