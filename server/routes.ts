import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoginSchema, insertBukuSchema } from "@shared/schema";
import express from "express";
import session from "express-session";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";


declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: any;
  }
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

  // Serve PDF files
  app.use('/api/pdfs', express.static(path.join(process.cwd(), 'pdfs')));
  app.use('/pdfs', express.static(path.join(process.cwd(), 'pdfs')));

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

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

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

  // Top categories for chart
  app.get("/api/dashboard/top-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getTopCategories(5);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top categories" });
    }
  });

  // Books routes
  app.get("/api/books", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const rakId = req.query.rakId ? parseInt(req.query.rakId as string) : undefined;

      const result = await storage.getBooks(page, limit, search, categoryId, rakId);
      res.json(result);
    } catch (error) {
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
      // If the request is multipart/form-data (with file)
      let bookData: any;
      if (req.is("multipart/form-data")) {
        bookData = {
          ...req.body,
          lampiran: req.file ? `/pdfs/${req.file.filename}` : null,
        };
        // Convert numeric fields if needed
        if (bookData.thn_buku) bookData.thn_buku = parseInt(bookData.thn_buku);
        if (bookData.id_kategori) bookData.id_kategori = parseInt(bookData.id_kategori);
        if (bookData.id_rak) bookData.id_rak = parseInt(bookData.id_rak);
        if (bookData.tersedia) bookData.tersedia = parseInt(bookData.tersedia);
      } else {
        // If the request is JSON (no file)
        bookData = insertBukuSchema.parse(req.body);
      }
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: "Invalid book data" });
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

  app.patch("/api/books/:id", requireAuth, async (req, res) => {
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

  // Shelves routes
  app.get("/api/shelves", requireAuth, async (req, res) => {
    try {
      const shelves = await storage.getShelves();
      res.json(shelves);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shelves" });
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

  const httpServer = createServer(app);
  return httpServer;
}
