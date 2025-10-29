import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoginSchema, insertBukuSchema, updateBukuSchema } from "@shared/schema";
import express from "express";
import { incrementSiteVisitor, incrementPdfView, recordPdfView, recordSiteVisitor } from "./storage";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";


declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: any;
  }
}

// Helper function to get client IP address
function getClientIP(req: express.Request): string {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection as any)?.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.toString().split(',')[0] || 
         req.headers['x-real-ip']?.toString() || 
         '127.0.0.1';
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "pdfs"));
  },
  filename: (req, file, cb) => {
    // Always save with .pdf extension
    cb(null, uuidv4() + ".pdf");
  }
});
const upload = multer({ storage: storageConfig });

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'library-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));


  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Serve static files (fonts and uploads) with cache headers
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));
  
  // Serve font files with cache headers
  app.use('/fonts', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(path.join(process.cwd(), 'client/public/fonts')));

  // Database-based PDF view tracking middleware
  const trackPdfView = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const filename = req.params.filename || path.basename(req.path);
      console.log(`PDF View Tracking - Filename: ${filename}`);
      
      // Extract book ID from filename (assuming format like "book_123.pdf" or just "123.pdf")
      const bookIdMatch = filename.match(/(?:book_)?(\d+)\.pdf$/i);
      console.log(`PDF View Tracking - Book ID Match: ${bookIdMatch ? bookIdMatch[1] : 'No match'}`);
      
      if (bookIdMatch) {
        const bookId = parseInt(bookIdMatch[1]);
        
        // Get book details to find category
        const book = await storage.getBookById(bookId);
        console.log(`PDF View Tracking - Book found: ${book ? `ID: ${book.id_buku}, Category ID: ${book.id_kategori}, Category: ${book.kategori_nama}` : 'Not found'}`);
        
        if (book && book.id_kategori) {
          // Record the view in database
          await recordPdfView(
            bookId,
            book.id_kategori,
            getClientIP(req),
            req.headers['user-agent'],
            req.session.userId
          );
          console.log(`PDF View Tracking - Recorded view for Book ID: ${bookId}, Category ID: ${book.id_kategori}, Category: ${book.kategori_nama}`);
        }
      } else {
        // If pattern doesn't match, try to find book by PDF filename
        console.log(`PDF View Tracking - Trying to find book by filename: ${filename}`);
        try {
          const bookByFilename = await storage.getBookByPdfFilename(filename);
          if (bookByFilename && bookByFilename.id_kategori) {
            await recordPdfView(
              bookByFilename.id_buku,
              bookByFilename.id_kategori,
              getClientIP(req),
              req.headers['user-agent'],
              req.session.userId
            );
            console.log(`PDF View Tracking - Recorded view by filename for Book ID: ${bookByFilename.id_buku}, Category ID: ${bookByFilename.id_kategori}, Category: ${bookByFilename.kategori_nama}`);
          }
        } catch (error) {
          console.log('PDF View Tracking - Book not found by filename');
        }
      }
      
      // Also increment the legacy counter for backward compatibility
      incrementPdfView(getClientIP(req));
    } catch (error) {
      console.error('Error tracking PDF view:', error);
    }
    next();
  };

  // Count PDF views (with database tracking)
  app.use('/api/pdfs', trackPdfView, express.static(path.join(process.cwd(), 'pdfs')));
  app.use('/pdfs', trackPdfView, express.static(path.join(process.cwd(), 'pdfs')));

  // Custom handler to serve PDFs inline
  app.get(['/pdfs/:filename', '/api/pdfs/:filename'], (req, res) => {
    const filePath = path.join(process.cwd(), 'pdfs', req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
    fs.createReadStream(filePath).pipe(res);
  });

  // Count site visitors (database + legacy tracking)
  app.get("/api/dashboard/stats", requireAuth, async (req, res, next) => { 
    const ip = getClientIP(req);
    incrementSiteVisitor(ip); // Legacy counter
    try {
      await recordSiteVisitor(ip, req.headers['user-agent']); // Database tracking
    } catch (error) {
      console.log('Site visitor recording disabled (tables not ready)');
    }
    next(); 
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log('Login attempt with body:', req.body);
      const { user: username, pass: password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByCredentials(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id_login;
      req.session.user = {
        id: user.id_login,
        username: user.user,
        nama: user.nama || user.user,
        level: user.level || 'user'
      };

      // Log user activity
      try {
        await storage.logUserActivity(
          user.id_login, 
          'login', 
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent')
        );
      } catch (activityError) {
        console.error('Failed to log user activity:', activityError);
        // Don't fail login if activity logging fails
      }

      console.log('Login successful for user:', user.user);
      res.json({
        id: user.id_login,
        username: user.user,
        nama: user.nama || user.user,
        level: user.level || 'user'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json(req.session.user);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Temporary endpoint to clear dashboard cache (for testing)
  app.post("/api/dashboard/clear-cache", requireAuth, async (req, res) => {
    try {
      // Import cache from storage module
      const { cache } = await import('./storage');
      cache.delete('dashboard_stats');
      res.json({ message: "Dashboard cache cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  // Top categories for chart
  app.get("/api/dashboard/top-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getTopCategories(5);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top categories" });
    }
  });

  // Monthly user activity for chart
  app.get("/api/dashboard/monthly-activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getMonthlyUserActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly user activity" });
    }
  });

  // Weekly books added for chart
  app.get("/api/dashboard/weekly-books", requireAuth, async (req, res) => {
    try {
      const weeklyBooks = await storage.getWeeklyBooksAdded();
      res.json(weeklyBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly books data" });
    }
  });

  // Documents by department for chart
  app.get("/api/dashboard/documents-by-department", requireAuth, async (req, res) => {
    try {
      const departmentData = await storage.getDocumentsByDepartment();
      res.json(departmentData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents by department" });
    }
  });

  // Most read by category for chart
  app.get("/api/dashboard/most-read-by-category", requireAuth, async (req, res) => {
    try {
      const mostReadData = await storage.getMostReadByCategory();
      res.json(mostReadData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch most read by category" });
    }
  });

  // Debug endpoint for PDF tracking
  app.get("/api/debug/pdf-tracking", requireAuth, async (req, res) => {
    try {
      const debugData = await storage.getPdfTrackingDebugData();
      res.json(debugData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PDF tracking debug data" });
    }
  });

  // New endpoint for database-based visitor stats
  app.get("/api/dashboard/database-stats", requireAuth, async (req, res) => {
    try {
      const dbStats = await storage.getDatabaseVisitorStats();
      res.json(dbStats);
    } catch (error) {
      console.error('Error fetching database stats:', error);
      res.status(500).json({ message: "Failed to fetch database stats" });
    }
  });

  // New endpoint for top categories by actual views
  app.get("/api/dashboard/top-categories-by-views", requireAuth, async (req, res) => {
    try {
      const topCategories = await storage.getTopCategoriesByViews();
      res.json(topCategories);
    } catch (error) {
      console.error('Error fetching top categories by views:', error);
      res.status(500).json({ message: "Failed to fetch top categories by views" });
    }
  });

  // Books routes
  app.get("/api/books", requireAuth, async (req, res) => {
    try {
      const availableOnly = req.query.available === 'true';
      const search = req.query.search as string | undefined;
      const limitParam = parseInt(req.query.limit as string);
      const limitForAvailable = !Number.isNaN(limitParam)
        ? Math.max(1, Math.min(limitParam, 50))
        : 20;

      if (availableOnly) {
        const { books, total } = await storage.getAvailableBooks(search, limitForAvailable);
        return res.json({ books, total });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const lokasiId = req.query.lokasiId ? parseInt(req.query.lokasiId as string) : undefined;
      const departmentFilter = req.query.departmentFilter as string;
      const yearFilter = req.query.yearFilter as string;

      console.log('Fetching books with params:', { page, limit, search, categoryId, lokasiId, departmentFilter, yearFilter });
      const result = await storage.getBooks(page, limit, search, categoryId, lokasiId, departmentFilter, yearFilter);
      console.log('Successfully fetched books:', result.books.length, 'total:', result.total);
      res.json(result);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", requireAuth, upload.single("lampiran"), async (req, res) => {
    try {
      console.log('Request body:', req.body);
      console.log('Request file:', (req as any).file);
      
      // If the request is multipart/form-data (with file)
      let bookData: any;
      if (req.is("multipart/form-data")) {
        bookData = {
          ...req.body,
          lampiran: (req as any).file ? (req as any).file.filename : null,
        };
        // Convert numeric fields
        if (bookData.thn_buku && bookData.thn_buku !== "") bookData.thn_buku = parseInt(bookData.thn_buku);
        if (bookData.id_kategori && bookData.id_kategori !== "" && bookData.id_kategori !== "0") {
          bookData.id_kategori = parseInt(bookData.id_kategori);
        } else {
          bookData.id_kategori = null;
        }
        if (bookData.id_lokasi && bookData.id_lokasi !== "" && bookData.id_lokasi !== "0") {
          bookData.id_lokasi = parseInt(bookData.id_lokasi);
        } else {
          bookData.id_lokasi = null;
        }
        if (bookData.tersedia) bookData.tersedia = parseInt(bookData.tersedia);
        
        // Clean up empty strings
        Object.keys(bookData).forEach(key => {
          if (bookData[key] === "") bookData[key] = null;
        });
      } else {
        // If the request is JSON (no file)
        bookData = insertBukuSchema.parse(req.body);
      }
      
      console.log('Processed book data:', bookData);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error('Add book error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message: "Invalid book data", error: errorMessage });
    }
  });

  app.put("/api/books/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBukuSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.patch("/api/books/:id", requireAuth, upload.single("lampiran"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PATCH request for book ID:", id);
      console.log("Request body:", req.body);
      console.log("Request file:", (req as any).file);
      
      let bookData: any = {};
      if (req.is("multipart/form-data")) {
        // Handle file upload and form fields
        bookData = { ...req.body };
        if ((req as any).file) {
          bookData.lampiran = (req as any).file.filename;
        }
      } else {
        bookData = req.body;
      }
      
      console.log("Book data before validation:", bookData);
      
      // Use updateBukuSchema which handles string-to-number coercion
      bookData = updateBukuSchema.parse(bookData);
      
      console.log("Book data after validation:", bookData);
      
      const book = await storage.updateBook(id, bookData);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      console.log("Book updated successfully:", book);
      res.json(book);
    } catch (error) {
      console.error("Error in PATCH /api/books/:id:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid book data";
      res.status(400).json({ message: "Invalid book data", error: errorMessage });
    }
  });

  app.delete("/api/books/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);
      
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Categories routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Add new category (admin only)
  app.post("/api/categories", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can add categories" });
    }
    try {
      const { nama_kategori } = req.body;
      if (!nama_kategori || typeof nama_kategori !== "string" || !nama_kategori.trim()) {
        return res.status(400).json({ message: "Invalid category name" });
      }
      const newCategory = await storage.createCategory({ nama_kategori: nama_kategori.trim() });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Edit category (admin only)
  app.patch("/api/categories/:id", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can edit categories" });
    }
    try {
      const id = parseInt(req.params.id);
      // Only allow updating nama_kategori
      const { nama_kategori } = req.body;
      if (!nama_kategori || typeof nama_kategori !== "string" || !nama_kategori.trim()) {
        return res.status(400).json({ message: "Invalid category name" });
      }
      // Update in DB
      await storage.updateCategory(id, { nama_kategori });
      const updated = await storage.getCategoryById(id);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  // Delete category (admin only)
  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can delete categories" });
    }
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Initialize predefined categories (admin only)
  app.post("/api/categories/init-predefined", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can initialize predefined categories" });
    }
    try {
      await storage.ensurePredefinedCategories();
      res.json({ message: "Predefined categories initialized successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize predefined categories" });
    }
  });

  // Clean up categories - keep only predefined ones (admin only)
  app.post("/api/categories/cleanup", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can cleanup categories" });
    }
    try {
      await storage.cleanupCategories();
      res.json({ message: "Categories cleaned up successfully - only predefined categories remain" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cleanup categories" });
    }
  });

  // Locations routes
  app.get("/api/locations", requireAuth, async (req, res) => {
    try {
      console.log('Fetching locations from database...');
      const locations = await storage.getLocations();
      console.log('Successfully fetched locations:', locations.length);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Add new location (admin only)
  app.post("/api/locations", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can add locations" });
    }
    try {
      const { nama_lokasi, deskripsi, kapasitas } = req.body;
      if (!nama_lokasi || typeof nama_lokasi !== "string" || !nama_lokasi.trim()) {
        return res.status(400).json({ message: "Invalid location name" });
      }
      const newLocation = await storage.createLocation({ 
        nama_lokasi: nama_lokasi.trim(),
        deskripsi: deskripsi || null,
        kapasitas: kapasitas ? parseInt(kapasitas) : null
      });
      res.status(201).json(newLocation);
    } catch (error) {
      res.status(400).json({ message: "Failed to create location" });
    }
  });

  // Edit location (admin only)
  app.patch("/api/locations/:id", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can edit locations" });
    }
    try {
      const id = parseInt(req.params.id);
      const { nama_lokasi, deskripsi, kapasitas } = req.body;
      if (!nama_lokasi || typeof nama_lokasi !== "string" || !nama_lokasi.trim()) {
        return res.status(400).json({ message: "Invalid location name" });
      }
      await storage.updateLocation(id, { 
        nama_lokasi: nama_lokasi.trim(),
        deskripsi: deskripsi || null,
        kapasitas: kapasitas ? parseInt(kapasitas) : null
      });
      const updated = await storage.getLocationById(id);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update location" });
    }
  });

  // Delete location (admin only)
  app.delete("/api/locations/:id", requireAuth, async (req, res) => {
    // Only allow admin
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can delete locations" });
    }
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Departments routes
  app.get("/api/departments", requireAuth, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Years routes
  app.get("/api/years", requireAuth, async (req, res) => {
    try {
      const years = await storage.getAvailableYears();
      res.json(years);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available years" });
    }
  });

  // Users routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const search = req.query.search as string;

      const result = await storage.getUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ===== LOANS SYSTEM ROUTES =====
  
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // ===== STAFF MANAGEMENT ROUTES =====
  
  // Staff routes
  app.get("/api/staff", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const search = req.query.search as string;

      const result = await storage.getStaff(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staff = await storage.getStaffById(id);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/nik/:nik", requireAuth, async (req, res) => {
    try {
      const { nik } = req.params;
      const staff = await storage.getStaffByNik(nik);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff by NIK:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", requireAuth, async (req, res) => {
    try {
      const staff = await storage.createStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  app.put("/api/staff/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staff = await storage.updateStaff(id, req.body);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Error updating staff:", error);
      res.status(500).json({ message: "Failed to update staff" });
    }
  });

  app.delete("/api/staff/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStaff(id);
      
      if (!success) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json({ message: "Staff deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff:", error);
      res.status(500).json({ message: "Failed to delete staff" });
    }
  });

  // Bulk import staff from CSV data
  app.post("/api/staff/bulk-import", requireAuth, async (req, res) => {
    try {
      const { staffList } = req.body;
      
      if (!Array.isArray(staffList) || staffList.length === 0) {
        return res.status(400).json({ message: "Invalid staff data provided" });
      }

      const result = await storage.bulkCreateStaff(staffList);
      res.json({
        message: `Import completed: ${result.success} successful, ${result.errors.length} failed`,
        success: result.success,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error bulk importing staff:", error);
      res.status(500).json({ message: "Failed to import staff data" });
    }
  });

  // Get staff departments
  app.get("/api/staff/meta/departments", requireAuth, async (req, res) => {
    try {
      const departments = await storage.getStaffDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching staff departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Get staff sections
  app.get("/api/staff/meta/sections", requireAuth, async (req, res) => {
    try {
      const sections = await storage.getStaffSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching staff sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  // Test endpoint to get sample NIKs (temporary for testing)
  app.get("/api/test/sample-niks", async (req, res) => {
    try {
      const staff = await storage.getStaff(1, 5);
      const sampleNiks = staff.staff.map((s: any) => ({ nik: s.nik, name: s.staff_name }));
      res.json(sampleNiks);
    } catch (error) {
      console.error("Error fetching sample NIKs:", error);
      res.status(500).json({ message: "Failed to fetch sample NIKs" });
    }
  });

  // Debug endpoint to check loan requests in database
  app.get("/api/debug/loan-requests", async (req, res) => {
    try {
      // Get raw loan requests without filters
      const result = await storage.getLoanRequests();
      console.log("Debug: Found loan requests:", result);
      res.json({
        message: "Debug loan requests data",
        count: result.total,
        requests: result.requests
      });
    } catch (error) {
      console.error("Error in debug loan requests:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Debug failed", error: message });
    }
  });

  // Test loan requests endpoint without auth (temporary)
  app.get("/api/test/loan-requests", async (req, res) => {
    try {
      const { status, employeeNik, page = "1", limit = "25" } = req.query;
      
      const filters = {
        status: status as string,
        employeeNik: employeeNik as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };
      
      const result = await storage.getLoanRequests(filters);
      console.log("Test endpoint result:", result);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching loan requests:", error);
      res.status(500).json({ message: "Failed to fetch loan requests", error: error.message });
    }
  });

  // Utility endpoint to sync all staff data to employees table
  app.post("/api/admin/sync-staff-to-employees", requireAuth, async (req, res) => {
    try {
      const allStaff = await storage.getStaff(1, 1000);
      let synced = 0;
      let errors = 0;
      
      for (const staff of allStaff.staff) {
        try {
          // Check if employee already exists
          const existingEmployee = await storage.getEmployeeByNik(staff.nik);
          
          if (!existingEmployee) {
            // Create employee record from staff data
            const employeeData = {
              nik: staff.nik,
              name: staff.staff_name,
              email: staff.email || '',
              phone: staff.no_hp || '',
              department: staff.department_name || staff.dept_name || '',
              position: staff.position || '',
              status: (staff.status === 1 ? 'active' : 'inactive') as 'active' | 'inactive'
            };
            
            await storage.createEmployee(employeeData);
            synced++;
          }
        } catch (error) {
          console.error(`Error syncing staff ${staff.nik}:`, error);
          errors++;
        }
      }
      
      res.json({ 
        message: "Staff sync completed", 
        synced, 
        errors, 
        total: allStaff.staff.length 
      });
    } catch (error) {
      console.error("Error syncing staff to employees:", error);
      res.status(500).json({ message: "Failed to sync staff data" });
    }
  });

  // Temporary endpoint to add missing employee data
  app.post("/api/employees", async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.get("/api/employees/:nik", async (req, res) => {
    try {
      const { nik } = req.params;
      let employee = await storage.getEmployeeByNik(nik);
      
      // If not found in employees table, try staff table
      if (!employee) {
        const staff = await storage.getStaffByNik(nik);
        if (staff) {
          // Convert staff data to employee format
          employee = {
            id: staff.id_staff,
            nik: staff.nik,
            name: staff.staff_name,
            email: staff.email || '',
            phone: staff.no_hp || '',
            department: staff.department_name || staff.dept_name || '',
            position: staff.position || '',
            status: staff.status === 1 ? 'active' : 'inactive',
            created_at: staff.created_at,
            updated_at: staff.updated_at
          };
        }
      }
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  // Loan request routes
  app.post("/api/loan-requests", async (req, res) => {
    try {
      const { employee_nik } = req.body;
      
      // Check if employee exists in employees table
      let employee = await storage.getEmployeeByNik(employee_nik);
      
      // If not found in employees table, try to get from staff table and sync
      if (!employee) {
        const staff = await storage.getStaffByNik(employee_nik);
        if (staff) {
          // Create employee record from staff data
          const employeeData = {
            nik: staff.nik,
            name: staff.staff_name,
            email: staff.email || '',
            phone: staff.no_hp || '',
            department: staff.department_name || staff.dept_name || '',
            position: staff.position || '',
            status: (staff.status === 1 ? 'active' : 'inactive') as 'active' | 'inactive'
          };
          
          try {
            employee = await storage.createEmployee(employeeData);
            console.log(`Created employee record for NIK: ${employee_nik}`);
          } catch (createError) {
            console.error('Error creating employee record:', createError);
            return res.status(400).json({ 
              message: `Employee with NIK ${employee_nik} not found and could not be created` 
            });
          }
        } else {
          return res.status(400).json({ 
            message: `Employee with NIK ${employee_nik} not found in staff or employee records` 
          });
        }
      }
      
      // Now create the loan request
      const loanRequest = await storage.createLoanRequest(req.body);
      res.status(201).json(loanRequest);
    } catch (error) {
      console.error("Error creating loan request:", error);
      res.status(500).json({ message: "Failed to create loan request" });
    }
  });

  app.get("/api/loan-requests", async (req, res) => {
    try {
      const { status, employeeNik, page = "1", limit = "25" } = req.query;
      
      const filters = {
        status: status as string,
        employeeNik: employeeNik as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };
      
      const result = await storage.getLoanRequests(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching loan requests:", error);
      res.status(500).json({ message: "Failed to fetch loan requests" });
    }
  });

  // Get loan request statistics (must be BEFORE the :id route)
  app.get("/api/loan-requests/stats", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const isAdminOrPetugas = user?.level === 'admin' || user?.level === 'petugas';
      
      if (isAdminOrPetugas) {
        // Return global statistics for admins
        const stats = await storage.getLoanRequestStats();
        res.json(stats);
      } else {
        // Return user-specific statistics for regular users
        const stats = await storage.getUserLoanRequestStats(user?.id || 0);
        res.json(stats);
      }
    } catch (error) {
      console.error("Error fetching loan request stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/loan-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id);
      
      if (isNaN(requestId) || !Number.isFinite(requestId)) {
        return res.status(400).json({ message: "Invalid loan request ID" });
      }
      
      const loanRequest = await storage.getLoanRequestById(requestId);
      
      if (!loanRequest) {
        return res.status(404).json({ message: "Loan request not found" });
      }
      
      res.json(loanRequest);
    } catch (error) {
      console.error("Error fetching loan request:", error);
      res.status(500).json({ message: "Failed to fetch loan request" });
    }
  });

  // Admin approval routes (require authentication)
  app.post("/api/loan-requests/:id/approve", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.user?.id;
      
      const success = await storage.approveLoanRequest(parseInt(id), adminId, notes);
      
      if (!success) {
        return res.status(404).json({ message: "Loan request not found or already processed" });
      }
      
      res.json({ message: "Loan request approved successfully" });
    } catch (error) {
      console.error("Error approving loan request:", error);
      res.status(500).json({ message: "Failed to approve loan request" });
    }
  });

  app.post("/api/loan-requests/:id/reject", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.user?.id;
      
      const success = await storage.rejectLoanRequest(parseInt(id), adminId, notes);
      
      if (!success) {
        return res.status(404).json({ message: "Loan request not found or already processed" });
      }
      
      res.json({ message: "Loan request rejected successfully" });
    } catch (error) {
      console.error("Error rejecting loan request:", error);
      res.status(500).json({ message: "Failed to reject loan request" });
    }
  });

  // Mark loan as returned
  app.patch("/api/loan-requests/:id/return", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.session.user?.id;
      
      const requestId = parseInt(id);
      if (isNaN(requestId) || !Number.isFinite(requestId)) {
        return res.status(400).json({ message: "Invalid loan request ID" });
      }
      
      const success = await storage.returnLoanRequest(requestId, adminId);
      
      if (!success) {
        return res.status(404).json({ message: "Loan request not found or not approved" });
      }
      
      res.json({ message: "Book marked as returned successfully" });
    } catch (error) {
      console.error("Error marking book as returned:", error);
      res.status(500).json({ message: "Failed to mark book as returned" });
    }
  });

  // Update approve endpoint to use PATCH
  app.patch("/api/loan-requests/:id/approve", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.user?.id;
      
      const requestId = parseInt(id);
      if (isNaN(requestId) || !Number.isFinite(requestId)) {
        return res.status(400).json({ message: "Invalid loan request ID" });
      }
      
      const success = await storage.approveLoanRequest(requestId, adminId, notes);
      
      if (!success) {
        return res.status(404).json({ message: "Loan request not found or already processed" });
      }
      
      res.json({ message: "Loan request approved successfully" });
    } catch (error) {
      console.error("Error approving loan request:", error);
      res.status(500).json({ message: "Failed to approve loan request" });
    }
  });

  // Update reject endpoint to use PATCH
  app.patch("/api/loan-requests/:id/reject", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.session.user?.id;
      
      const requestId = parseInt(id);
      if (isNaN(requestId) || !Number.isFinite(requestId)) {
        return res.status(400).json({ message: "Invalid loan request ID" });
      }
      
      const success = await storage.rejectLoanRequest(requestId, adminId, notes);
      
      if (!success) {
        return res.status(404).json({ message: "Loan request not found or already processed" });
      }
      
      res.json({ message: "Loan request rejected successfully" });
    } catch (error) {
      console.error("Error rejecting loan request:", error);
      res.status(500).json({ message: "Failed to reject loan request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
