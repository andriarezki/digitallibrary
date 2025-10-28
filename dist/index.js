var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";
import compression from "compression";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertBukuSchema: () => insertBukuSchema,
  insertKategoriSchema: () => insertKategoriSchema,
  insertLoginSchema: () => insertLoginSchema,
  insertLokasiSchema: () => insertLokasiSchema,
  insertPdfViewSchema: () => insertPdfViewSchema,
  insertSiteVisitorSchema: () => insertSiteVisitorSchema,
  insertUserActivitySchema: () => insertUserActivitySchema,
  tblBuku: () => tblBuku,
  tblKategori: () => tblKategori,
  tblLogin: () => tblLogin,
  tblLokasi: () => tblLokasi,
  tblPdfViews: () => tblPdfViews,
  tblSiteVisitors: () => tblSiteVisitors,
  tblUserActivity: () => tblUserActivity,
  updateBukuSchema: () => updateBukuSchema
});
import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var tblLogin = mysqlTable("tbl_login", {
  id_login: int("id_login").primaryKey().autoincrement(),
  anggota_id: varchar("anggota_id", { length: 255 }),
  user: varchar("user", { length: 255 }).notNull(),
  pass: varchar("pass", { length: 255 }).notNull(),
  level: varchar("level", { length: 255 }),
  nama: varchar("nama", { length: 255 }),
  tempat_lahir: varchar("tempat_lahir", { length: 255 }),
  tgl_lahir: varchar("tgl_lahir", { length: 255 }),
  jenkel: varchar("jenkel", { length: 255 }),
  alamat: text("alamat"),
  telepon: varchar("telepon", { length: 25 }),
  email: varchar("email", { length: 255 }),
  tgl_bergabung: varchar("tgl_bergabung", { length: 255 }),
  foto: varchar("foto", { length: 255 })
});
var tblKategori = mysqlTable("tbl_kategori", {
  id_kategori: int("id_kategori").primaryKey().autoincrement(),
  nama_kategori: varchar("nama_kategori", { length: 255 }).notNull()
});
var tblLokasi = mysqlTable("tbl_rak", {
  id_lokasi: int("id_rak").primaryKey().autoincrement(),
  nama_lokasi: varchar("nama_rak", { length: 255 }).notNull(),
  deskripsi: varchar("lokasi", { length: 255 }),
  kapasitas: int("kapasitas")
});
var tblBuku = mysqlTable("tbl_buku", {
  id_buku: int("id_buku").primaryKey().autoincrement(),
  buku_id: varchar("buku_id", { length: 255 }).notNull(),
  id_kategori: int("id_kategori").notNull(),
  id_lokasi: int("id_rak").notNull(),
  // Maps to id_rak in database
  sampul: varchar("sampul", { length: 255 }),
  isbn: varchar("isbn", { length: 255 }),
  lampiran: varchar("lampiran", { length: 255 }),
  title: varchar("title", { length: 255 }),
  penerbit: varchar("penerbit", { length: 255 }),
  pengarang: varchar("pengarang", { length: 255 }),
  thn_buku: varchar("thn_buku", { length: 255 }),
  isi: text("isi"),
  jml: int("jml"),
  tgl_masuk: varchar("tgl_masuk", { length: 255 }),
  tersedia: int("tersedia").notNull().default(1),
  department: varchar("department", { length: 255 }),
  file_type: varchar("file_type", { length: 10 })
  // Added back for server deployment
});
var tblUserActivity = mysqlTable("tbl_user_activity", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  activity_type: varchar("activity_type", { length: 50 }).notNull(),
  // 'login', 'logout', 'view', etc.
  activity_date: timestamp("activity_date").defaultNow().notNull(),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent")
});
var tblPdfViews = mysqlTable("tbl_pdf_views", {
  id: int("id").primaryKey().autoincrement(),
  book_id: int("book_id").notNull(),
  category_id: int("category_id").notNull(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  user_agent: text("user_agent"),
  view_date: timestamp("view_date").defaultNow().notNull(),
  user_id: int("user_id")
  // Optional: if user is logged in
});
var tblSiteVisitors = mysqlTable("tbl_site_visitors", {
  id: int("id").primaryKey().autoincrement(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  first_visit: timestamp("first_visit").defaultNow().notNull(),
  last_visit: timestamp("last_visit").defaultNow().notNull(),
  visit_count: int("visit_count").default(1).notNull(),
  user_agent: text("user_agent")
});
var insertUserActivitySchema = createInsertSchema(tblUserActivity).pick({
  user_id: true,
  activity_type: true,
  ip_address: true,
  user_agent: true
});
var insertPdfViewSchema = createInsertSchema(tblPdfViews).pick({
  book_id: true,
  category_id: true,
  ip_address: true,
  user_agent: true,
  user_id: true
});
var insertSiteVisitorSchema = createInsertSchema(tblSiteVisitors).pick({
  ip_address: true,
  user_agent: true
});
var insertLoginSchema = createInsertSchema(tblLogin).pick({
  user: true,
  pass: true
});
var insertKategoriSchema = createInsertSchema(tblKategori).pick({
  nama_kategori: true
});
var insertLokasiSchema = createInsertSchema(tblLokasi).pick({
  nama_lokasi: true,
  deskripsi: true,
  kapasitas: true
});
var insertBukuSchema = createInsertSchema(tblBuku).omit({
  id_buku: true
});
var updateBukuSchema = insertBukuSchema.partial().extend({
  id_kategori: z.preprocess((val) => {
    if (val === null || val === void 0 || val === "") return void 0;
    const num = Number(val);
    return isNaN(num) ? void 0 : num;
  }, z.number().optional()),
  id_lokasi: z.preprocess((val) => {
    if (val === null || val === void 0 || val === "") return void 0;
    const num = Number(val);
    return isNaN(num) ? void 0 : num;
  }, z.number().optional()),
  tersedia: z.preprocess((val) => {
    if (val === null || val === void 0 || val === "") return void 0;
    const num = Number(val);
    return isNaN(num) ? void 0 : num;
  }, z.number().optional()),
  jml: z.preprocess((val) => {
    if (val === null || val === void 0 || val === "") return void 0;
    const num = Number(val);
    return isNaN(num) ? void 0 : num;
  }, z.number().optional())
});

// server/db.ts
var connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "projek_perpus",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
var db = drizzle(connection, { schema: schema_exports, mode: "default" });

// server/storage.ts
import { eq, like, or, desc, asc, count, sql, and, isNotNull } from "drizzle-orm";
import bcrypt from "bcrypt";
var siteVisitorIPs = /* @__PURE__ */ new Set();
var pdfViewIPs = /* @__PURE__ */ new Set();
var cache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 5 * 60 * 1e3;
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}
function setCachedData(key, data) {
  cache.set(key, { data, expiry: Date.now() + CACHE_DURATION });
}
function incrementSiteVisitor(ip) {
  siteVisitorIPs.add(ip);
}
function incrementPdfView(ip) {
  pdfViewIPs.add(ip);
}
async function recordPdfView(bookId, categoryId, ip, userAgent, userId) {
  try {
    await db.insert(tblPdfViews).values({
      book_id: bookId,
      category_id: categoryId,
      ip_address: ip,
      user_agent: userAgent,
      user_id: userId
    });
  } catch (error) {
    console.error("Error recording PDF view:", error);
  }
}
async function recordSiteVisitor(ip, userAgent) {
  try {
    const existingVisitor = await db.select().from(tblSiteVisitors).where(eq(tblSiteVisitors.ip_address, ip)).limit(1);
    if (existingVisitor.length > 0) {
      await db.update(tblSiteVisitors).set({
        last_visit: /* @__PURE__ */ new Date(),
        visit_count: sql`visit_count + 1`
      }).where(eq(tblSiteVisitors.ip_address, ip));
    } else {
      await db.insert(tblSiteVisitors).values({
        ip_address: ip,
        user_agent: userAgent
      });
    }
  } catch (error) {
    console.error("Error recording site visitor:", error);
  }
}
var DatabaseStorage = class {
  async getUserByCredentials(username, password) {
    try {
      console.log(`Attempting login with username: ${username}, password: ${password}`);
      const results = await db.select().from(tblLogin).where(eq(tblLogin.user, username)).limit(1);
      console.log(`Database query returned ${results.length} results`);
      if (results.length > 0) {
        console.log(`Found user: ${results[0].user}, stored password: ${results[0].pass}`);
      }
      const user = results[0];
      if (user) {
        const isPasswordValid = user.pass.startsWith("$2b$") ? await bcrypt.compare(password, user.pass) : user.pass === password;
        if (isPasswordValid) {
          console.log("Password match successful");
          return user;
        }
      }
      console.log("Password mismatch or user not found");
      return void 0;
    } catch (error) {
      console.error("Database error during login:", error);
      return void 0;
    }
  }
  async getUserById(id) {
    const results = await db.select().from(tblLogin).where(eq(tblLogin.id_login, id)).limit(1);
    return results[0];
  }
  async getUsers(page, limit, search) {
    let whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          like(tblLogin.user, `%${search}%`),
          like(tblLogin.nama, `%${search}%`),
          like(tblLogin.email, `%${search}%`),
          like(tblLogin.level, `%${search}%`)
        )
      );
    }
    const offset = (page - 1) * limit;
    const usersQuery = db.select().from(tblLogin).orderBy(desc(tblLogin.id_login)).limit(limit).offset(offset);
    const countQuery = db.select({ count: count() }).from(tblLogin);
    if (whereConditions.length > 0) {
      const condition = whereConditions.length === 1 ? whereConditions[0] : or(...whereConditions);
      usersQuery.where(condition);
      countQuery.where(condition);
    }
    const [users, totalResult] = await Promise.all([
      usersQuery,
      countQuery
    ]);
    return {
      users,
      total: totalResult[0].count
    };
  }
  async createUser(userData) {
    const hashedPassword = userData.pass ? await bcrypt.hash(userData.pass, 10) : "";
    const insertData = {
      user: userData.user || "",
      pass: hashedPassword,
      level: userData.level || "user",
      nama: userData.nama || "",
      tempat_lahir: userData.tempat_lahir || "",
      tgl_lahir: userData.tgl_lahir || "",
      jenkel: userData.jenkel || "",
      alamat: userData.alamat || "",
      telepon: userData.telepon || "",
      email: userData.email || "",
      tgl_bergabung: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      foto: userData.foto || ""
    };
    const result = await db.insert(tblLogin).values([insertData]);
    const users = await db.select().from(tblLogin).orderBy(desc(tblLogin.id_login)).limit(1);
    return users[0];
  }
  async updateUser(id, userData) {
    const updateData = { ...userData };
    if (userData.pass) {
      updateData.pass = await bcrypt.hash(userData.pass, 10);
    }
    await db.update(tblLogin).set(updateData).where(eq(tblLogin.id_login, id));
    return this.getUserById(id);
  }
  async deleteUser(id) {
    const result = await db.delete(tblLogin).where(eq(tblLogin.id_login, id));
    return true;
  }
  async getBooks(page, limit, search, categoryId, lokasiId, departmentFilter, yearFilter) {
    let whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          like(tblBuku.title, `%${search}%`),
          like(tblBuku.pengarang, `%${search}%`),
          like(tblBuku.penerbit, `%${search}%`),
          like(tblBuku.isbn, `%${search}%`)
        )
      );
    }
    if (categoryId) {
      whereConditions.push(eq(tblBuku.id_kategori, categoryId));
    }
    if (lokasiId) {
      whereConditions.push(eq(tblBuku.id_lokasi, lokasiId));
    }
    if (departmentFilter) {
      whereConditions.push(eq(tblBuku.department, departmentFilter));
    }
    if (yearFilter) {
      whereConditions.push(eq(tblBuku.thn_buku, yearFilter));
    }
    const offset = (page - 1) * limit;
    const booksQuery = db.select({
      id_buku: tblBuku.id_buku,
      buku_id: tblBuku.buku_id,
      id_kategori: tblBuku.id_kategori,
      id_lokasi: tblBuku.id_lokasi,
      sampul: tblBuku.sampul,
      isbn: tblBuku.isbn,
      lampiran: tblBuku.lampiran,
      title: tblBuku.title,
      penerbit: tblBuku.penerbit,
      pengarang: tblBuku.pengarang,
      thn_buku: tblBuku.thn_buku,
      isi: tblBuku.isi,
      jml: tblBuku.jml,
      tgl_masuk: tblBuku.tgl_masuk,
      tersedia: tblBuku.tersedia,
      department: tblBuku.department,
      file_type: tblBuku.file_type,
      kategori_nama: tblKategori.nama_kategori,
      lokasi_nama: tblLokasi.nama_lokasi
    }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi)).orderBy(desc(tblBuku.id_buku)).limit(limit).offset(offset);
    const countQuery = db.select({ count: count() }).from(tblBuku);
    if (whereConditions.length > 0) {
      const condition = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);
      booksQuery.where(condition);
      countQuery.where(condition);
    }
    const [books, totalResult] = await Promise.all([
      booksQuery,
      countQuery
    ]);
    return {
      books,
      total: totalResult[0].count
    };
  }
  async getBookById(id) {
    const results = await db.select({
      id_buku: tblBuku.id_buku,
      buku_id: tblBuku.buku_id,
      id_kategori: tblBuku.id_kategori,
      id_lokasi: tblBuku.id_lokasi,
      sampul: tblBuku.sampul,
      isbn: tblBuku.isbn,
      lampiran: tblBuku.lampiran,
      title: tblBuku.title,
      penerbit: tblBuku.penerbit,
      pengarang: tblBuku.pengarang,
      thn_buku: tblBuku.thn_buku,
      isi: tblBuku.isi,
      jml: tblBuku.jml,
      tgl_masuk: tblBuku.tgl_masuk,
      tersedia: tblBuku.tersedia,
      department: tblBuku.department,
      file_type: tblBuku.file_type,
      kategori_nama: tblKategori.nama_kategori,
      lokasi_nama: tblLokasi.nama_lokasi
    }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi)).where(eq(tblBuku.id_buku, id)).limit(1);
    return results[0];
  }
  async createBook(book) {
    const result = await db.insert(tblBuku).values(book);
    const insertedId = result[0].insertId;
    const newBook = await db.select().from(tblBuku).where(eq(tblBuku.id_buku, insertedId)).limit(1);
    return newBook[0];
  }
  async updateBook(id, book) {
    await db.update(tblBuku).set(book).where(eq(tblBuku.id_buku, id));
    const updated = await db.select().from(tblBuku).where(eq(tblBuku.id_buku, id)).limit(1);
    return updated[0];
  }
  async deleteBook(id) {
    const result = await db.delete(tblBuku).where(eq(tblBuku.id_buku, id));
    return result[0].affectedRows > 0;
  }
  async getAvailableYears() {
    const results = await db.selectDistinct({ thn_buku: tblBuku.thn_buku }).from(tblBuku).where(isNotNull(tblBuku.thn_buku)).orderBy(desc(tblBuku.thn_buku));
    return results.map((r) => r.thn_buku).filter((year) => year !== null && year.trim() !== "");
  }
  async getCategories() {
    return await db.select().from(tblKategori).orderBy(asc(tblKategori.nama_kategori));
  }
  async getCategoryById(id) {
    const results = await db.select().from(tblKategori).where(eq(tblKategori.id_kategori, id)).limit(1);
    return results[0];
  }
  async getTopCategories(limit) {
    const cacheKey = `top_categories_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const results = await db.select({
      id: tblKategori.id_kategori,
      name: tblKategori.nama_kategori,
      count: count(tblBuku.id_buku)
    }).from(tblKategori).leftJoin(tblBuku, eq(tblKategori.id_kategori, tblBuku.id_kategori)).groupBy(tblKategori.id_kategori, tblKategori.nama_kategori).orderBy(desc(count(tblBuku.id_buku))).limit(limit);
    setCachedData(cacheKey, results);
    return results;
  }
  async updateCategory(id, data) {
    await db.update(tblKategori).set({ nama_kategori: data.nama_kategori }).where(eq(tblKategori.id_kategori, id));
  }
  async createCategory(data) {
    const result = await db.insert(tblKategori).values({ nama_kategori: data.nama_kategori });
    const newCategory = await db.select().from(tblKategori).where(eq(tblKategori.id_kategori, result[0].insertId)).limit(1);
    return newCategory[0];
  }
  async ensurePredefinedCategories() {
    const predefinedCategories = [
      "Book",
      "Journal",
      "Proceeding",
      "Audio Visual",
      "Catalogue",
      "Flyer",
      "Training",
      "Poster",
      "Thesis",
      "Report",
      "Newspaper"
    ];
    const existingCategories = await this.getCategories();
    const existingNames = new Set(existingCategories.map((cat) => cat.nama_kategori.toLowerCase()));
    for (const categoryName of predefinedCategories) {
      if (!existingNames.has(categoryName.toLowerCase())) {
        await this.createCategory({ nama_kategori: categoryName });
        console.log(`Created predefined category: ${categoryName}`);
      }
    }
  }
  async deleteCategory(id) {
    const result = await db.delete(tblKategori).where(eq(tblKategori.id_kategori, id));
    return result[0].affectedRows > 0;
  }
  async getLocations() {
    return await db.select().from(tblLokasi).orderBy(asc(tblLokasi.nama_lokasi));
  }
  async getLocationById(id) {
    const results = await db.select().from(tblLokasi).where(eq(tblLokasi.id_lokasi, id)).limit(1);
    return results[0];
  }
  async createLocation(data) {
    const result = await db.insert(tblLokasi).values({
      nama_lokasi: data.nama_lokasi,
      deskripsi: data.deskripsi,
      kapasitas: data.kapasitas
    });
    const newLocation = await db.select().from(tblLokasi).where(eq(tblLokasi.id_lokasi, result[0].insertId)).limit(1);
    return newLocation[0];
  }
  async updateLocation(id, data) {
    await db.update(tblLokasi).set({
      nama_lokasi: data.nama_lokasi,
      deskripsi: data.deskripsi,
      kapasitas: data.kapasitas
    }).where(eq(tblLokasi.id_lokasi, id));
  }
  async deleteLocation(id) {
    const result = await db.delete(tblLokasi).where(eq(tblLokasi.id_lokasi, id));
    return result[0].affectedRows > 0;
  }
  async getDashboardStats() {
    const cacheKey = "dashboard_stats";
    const cached = getCachedData(cacheKey);
    if (cached) {
      return {
        ...cached,
        siteVisitorCount: siteVisitorIPs.size,
        pdfViewCount: pdfViewIPs.size
      };
    }
    const [booksCount, availableCount, categoriesCount] = await Promise.all([
      db.select({ count: count() }).from(tblBuku),
      db.select({ count: count() }).from(tblBuku).where(eq(tblBuku.tersedia, 1)),
      db.select({ count: count() }).from(tblKategori)
    ]);
    const totalBooks = booksCount[0].count;
    const availableBooks = availableCount[0].count;
    const onLoan = totalBooks - availableBooks;
    const categories = categoriesCount[0].count;
    const stats = {
      totalBooks,
      availableBooks,
      onLoan,
      categories,
      siteVisitorCount: siteVisitorIPs.size,
      pdfViewCount: pdfViewIPs.size
    };
    setCachedData(cacheKey, stats);
    return stats;
  }
  async getDepartments() {
    const results = await db.selectDistinct({ department: tblBuku.department }).from(tblBuku).where(sql`${tblBuku.department} IS NOT NULL AND ${tblBuku.department} != ''`).orderBy(asc(tblBuku.department));
    return results.filter((r) => r.department);
  }
  async getDocumentsByDepartment() {
    const results = await db.select({
      department: tblBuku.department,
      count: count(tblBuku.id_buku)
    }).from(tblBuku).where(sql`${tblBuku.department} IS NOT NULL AND ${tblBuku.department} != ''`).groupBy(tblBuku.department).orderBy(desc(count(tblBuku.id_buku)));
    return results.filter((r) => r.department);
  }
  async getMostReadByCategory() {
    try {
      const pdfViewResults = await db.select({
        category: tblKategori.nama_kategori,
        views: count(tblPdfViews.id)
      }).from(tblPdfViews).innerJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori)).groupBy(tblKategori.id_kategori, tblKategori.nama_kategori).orderBy(desc(count(tblPdfViews.id))).limit(5);
      if (pdfViewResults.length > 0) {
        return pdfViewResults.filter((r) => r.category);
      }
    } catch (error) {
      console.log("PDF views table not available, falling back to book count");
    }
    const results = await db.select({
      category: tblKategori.nama_kategori,
      views: count(tblBuku.id_buku)
    }).from(tblKategori).leftJoin(tblBuku, eq(tblKategori.id_kategori, tblBuku.id_kategori)).groupBy(tblKategori.id_kategori, tblKategori.nama_kategori).orderBy(desc(count(tblBuku.id_buku))).limit(5);
    return results.filter((r) => r.category);
  }
  async logUserActivity(userId, activityType, ipAddress, userAgent) {
    await db.insert(tblUserActivity).values({
      user_id: userId,
      activity_type: activityType,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }
  async getMonthlyUserActivity() {
    try {
      const tableCheck = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'tbl_user_activity'
      `);
      if (!tableCheck[0] || tableCheck[0].count === 0) {
        console.log("User activity table not found, returning sample data");
        return [
          { month: "May", activeUsers: 5 },
          { month: "Jun", activeUsers: 8 },
          { month: "Jul", activeUsers: 12 },
          { month: "Aug", activeUsers: 15 },
          { month: "Sep", activeUsers: 18 },
          { month: "Oct", activeUsers: 22 }
        ];
      }
      const sixMonthsAgo = /* @__PURE__ */ new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const results = await db.select({
        month: sql`DATE_FORMAT(activity_date, '%Y-%m')`,
        activeUsers: sql`COUNT(DISTINCT user_id)`
      }).from(tblUserActivity).where(sql`activity_date >= ${sixMonthsAgo}`).groupBy(sql`DATE_FORMAT(activity_date, '%Y-%m')`).orderBy(sql`DATE_FORMAT(activity_date, '%Y-%m')`);
      return results.map((result) => ({
        month: (/* @__PURE__ */ new Date(result.month + "-01")).toLocaleString("default", { month: "short" }),
        activeUsers: result.activeUsers
      }));
    } catch (error) {
      console.error("Error fetching monthly user activity:", error);
      return [
        { month: "May", activeUsers: 5 },
        { month: "Jun", activeUsers: 8 },
        { month: "Jul", activeUsers: 12 },
        { month: "Aug", activeUsers: 15 },
        { month: "Sep", activeUsers: 18 },
        { month: "Oct", activeUsers: 22 }
      ];
    }
  }
  async getWeeklyBooksAdded() {
    const fourWeeksAgo = /* @__PURE__ */ new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    try {
      const results = await db.select({
        categoryName: sql`COALESCE(${tblKategori.nama_kategori}, 'Uncategorized')`,
        booksAdded: sql`COUNT(*)`,
        latestDate: sql`MAX(STR_TO_DATE(${tblBuku.tgl_masuk}, '%Y-%m-%d'))`
      }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).where(sql`
          ${tblBuku.tgl_masuk} IS NOT NULL 
          AND ${tblBuku.tgl_masuk} != ''
          AND ${tblBuku.tgl_masuk} != '0000-00-00'
          AND STR_TO_DATE(${tblBuku.tgl_masuk}, '%Y-%m-%d') >= ${fourWeeksAgo}
        `).groupBy(sql`${tblKategori.id_kategori}, ${tblKategori.nama_kategori}`).orderBy(sql`COUNT(*) DESC`).limit(8);
      if (results.length === 0) {
        const fallbackResults = await db.select({
          categoryName: sql`COALESCE(${tblKategori.nama_kategori}, 'Uncategorized')`,
          booksAdded: sql`COUNT(*)`
        }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).where(sql`${tblBuku.tgl_masuk} IS NOT NULL AND ${tblBuku.tgl_masuk} != '' AND ${tblBuku.tgl_masuk} != '0000-00-00'`).groupBy(sql`${tblKategori.id_kategori}, ${tblKategori.nama_kategori}`).orderBy(sql`COUNT(*) DESC`).limit(8);
        return fallbackResults.map((result) => ({
          week: result.categoryName.length > 15 ? result.categoryName.substring(0, 15) + "..." : result.categoryName,
          booksAdded: result.booksAdded
        }));
      }
      return results.map((result) => ({
        week: result.categoryName.length > 15 ? result.categoryName.substring(0, 15) + "..." : result.categoryName,
        booksAdded: result.booksAdded
      }));
    } catch (error) {
      console.error("Error fetching weekly books data:", error);
      return [];
    }
  }
  async getDatabaseVisitorStats() {
    try {
      const [siteVisitors, pdfViews, uniquePdfViewers] = await Promise.all([
        // Count unique site visitors
        db.select({ count: count() }).from(tblSiteVisitors),
        // Count total PDF views
        db.select({ count: count() }).from(tblPdfViews),
        // Count unique PDF viewers (distinct IPs that viewed PDFs)
        db.select({ count: count(sql`DISTINCT ${tblPdfViews.ip_address}`) }).from(tblPdfViews)
      ]);
      return {
        siteVisitorCount: siteVisitors[0]?.count || 0,
        pdfViewCount: pdfViews[0]?.count || 0,
        uniquePdfViewers: uniquePdfViewers[0]?.count || 0
      };
    } catch (error) {
      console.error("Error fetching database visitor stats:", error);
      return { siteVisitorCount: 0, pdfViewCount: 0, uniquePdfViewers: 0 };
    }
  }
  async getTopCategoriesByViews() {
    try {
      const results = await db.select({
        category: tblKategori.nama_kategori,
        views: count(tblPdfViews.id)
      }).from(tblPdfViews).innerJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori)).groupBy(tblKategori.id_kategori, tblKategori.nama_kategori).orderBy(desc(count(tblPdfViews.id))).limit(10);
      return results.filter((r) => r.category);
    } catch (error) {
      console.error("Error fetching top categories by views:", error);
      return [];
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import express from "express";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection?.socket?.remoteAddress || req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.headers["x-real-ip"]?.toString() || "127.0.0.1";
}
var storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "pdfs"));
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + ".pdf");
  }
});
var upload = multer({ storage: storageConfig });
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "library-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  app2.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    next();
  }, express.static(path.join(process.cwd(), "uploads")));
  app2.use("/fonts", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(path.join(process.cwd(), "client/public/fonts")));
  const trackPdfView = async (req, res, next) => {
    try {
      const filename = req.params.filename || path.basename(req.path);
      const bookIdMatch = filename.match(/(?:book_)?(\d+)\.pdf$/i);
      if (bookIdMatch) {
        const bookId = parseInt(bookIdMatch[1]);
        const book = await storage.getBookById(bookId);
        if (book && book.id_kategori) {
          await recordPdfView(
            bookId,
            book.id_kategori,
            getClientIP(req),
            req.headers["user-agent"],
            req.session.userId
          );
        }
      }
      incrementPdfView(getClientIP(req));
    } catch (error) {
      console.error("Error tracking PDF view:", error);
    }
    next();
  };
  app2.use("/api/pdfs", trackPdfView, express.static(path.join(process.cwd(), "pdfs")));
  app2.use("/pdfs", trackPdfView, express.static(path.join(process.cwd(), "pdfs")));
  app2.get(["/pdfs/:filename", "/api/pdfs/:filename"], (req, res) => {
    const filePath = path.join(process.cwd(), "pdfs", req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${req.params.filename}"`);
    fs.createReadStream(filePath).pipe(res);
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res, next) => {
    const ip = getClientIP(req);
    incrementSiteVisitor(ip);
    try {
      await recordSiteVisitor(ip, req.headers["user-agent"]);
    } catch (error) {
      console.log("Site visitor recording disabled (tables not ready)");
    }
    next();
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt with body:", req.body);
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
        level: user.level || "user"
      };
      try {
        await storage.logUserActivity(
          user.id_login,
          "login",
          req.ip || req.connection.remoteAddress,
          req.get("User-Agent")
        );
      } catch (activityError) {
        console.error("Failed to log user activity:", activityError);
      }
      console.log("Login successful for user:", user.user);
      res.json({
        id: user.id_login,
        username: user.user,
        nama: user.nama || user.user,
        level: user.level || "user"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json(req.session.user);
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/top-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getTopCategories(5);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top categories" });
    }
  });
  app2.get("/api/dashboard/monthly-activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getMonthlyUserActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly user activity" });
    }
  });
  app2.get("/api/dashboard/weekly-books", requireAuth, async (req, res) => {
    try {
      const weeklyBooks = await storage.getWeeklyBooksAdded();
      res.json(weeklyBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly books data" });
    }
  });
  app2.get("/api/dashboard/documents-by-department", requireAuth, async (req, res) => {
    try {
      const departmentData = await storage.getDocumentsByDepartment();
      res.json(departmentData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents by department" });
    }
  });
  app2.get("/api/dashboard/most-read-by-category", requireAuth, async (req, res) => {
    try {
      const mostReadData = await storage.getMostReadByCategory();
      res.json(mostReadData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch most read by category" });
    }
  });
  app2.get("/api/dashboard/database-stats", requireAuth, async (req, res) => {
    try {
      const dbStats = await storage.getDatabaseVisitorStats();
      res.json(dbStats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
      res.status(500).json({ message: "Failed to fetch database stats" });
    }
  });
  app2.get("/api/dashboard/top-categories-by-views", requireAuth, async (req, res) => {
    try {
      const topCategories = await storage.getTopCategoriesByViews();
      res.json(topCategories);
    } catch (error) {
      console.error("Error fetching top categories by views:", error);
      res.status(500).json({ message: "Failed to fetch top categories by views" });
    }
  });
  app2.get("/api/books", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const search = req.query.search;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      const lokasiId = req.query.lokasiId ? parseInt(req.query.lokasiId) : void 0;
      const departmentFilter = req.query.departmentFilter;
      const yearFilter = req.query.yearFilter;
      console.log("Fetching books with params:", { page, limit, search, categoryId, lokasiId, departmentFilter, yearFilter });
      const result = await storage.getBooks(page, limit, search, categoryId, lokasiId, departmentFilter, yearFilter);
      console.log("Successfully fetched books:", result.books.length, "total:", result.total);
      res.json(result);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });
  app2.get("/api/books/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/books", requireAuth, upload.single("lampiran"), async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      let bookData;
      if (req.is("multipart/form-data")) {
        bookData = {
          ...req.body,
          lampiran: req.file ? req.file.filename : null
        };
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
        Object.keys(bookData).forEach((key) => {
          if (bookData[key] === "") bookData[key] = null;
        });
      } else {
        bookData = insertBukuSchema.parse(req.body);
      }
      console.log("Processed book data:", bookData);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Add book error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Invalid book data", error: errorMessage });
    }
  });
  app2.put("/api/books/:id", requireAuth, async (req, res) => {
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
  app2.patch("/api/books/:id", requireAuth, upload.single("lampiran"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PATCH request for book ID:", id);
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      let bookData = {};
      if (req.is("multipart/form-data")) {
        bookData = { ...req.body };
        if (req.file) {
          bookData.lampiran = req.file.filename;
        }
      } else {
        bookData = req.body;
      }
      console.log("Book data before validation:", bookData);
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
  app2.delete("/api/books/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", requireAuth, async (req, res) => {
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
  app2.patch("/api/categories/:id", requireAuth, async (req, res) => {
    const user = req.session.user;
    if (!user || user.level !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin can edit categories" });
    }
    try {
      const id = parseInt(req.params.id);
      const { nama_kategori } = req.body;
      if (!nama_kategori || typeof nama_kategori !== "string" || !nama_kategori.trim()) {
        return res.status(400).json({ message: "Invalid category name" });
      }
      await storage.updateCategory(id, { nama_kategori });
      const updated = await storage.getCategoryById(id);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/categories/init-predefined", requireAuth, async (req, res) => {
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
  app2.get("/api/locations", requireAuth, async (req, res) => {
    try {
      console.log("Fetching locations from database...");
      const locations = await storage.getLocations();
      console.log("Successfully fetched locations:", locations.length);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  app2.post("/api/locations", requireAuth, async (req, res) => {
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
  app2.patch("/api/locations/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/locations/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/departments", requireAuth, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });
  app2.get("/api/years", requireAuth, async (req, res) => {
    try {
      const years = await storage.getAvailableYears();
      res.json(years);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available years" });
    }
  });
  app2.get("/api/users", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const search = req.query.search;
      const result = await storage.getUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", requireAuth, async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/users/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/users/:id", requireAuth, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          charts: ["chart.js", "react-chartjs-2"],
          pdf: ["jspdf", "jspdf-autotable"],
          query: ["@tanstack/react-query"]
        }
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/uploads") || url.startsWith("/fonts") || url.startsWith("/pdfs") || url.startsWith("/api")) {
      return next();
    }
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));
app.use(express3.json({ limit: "10mb" }));
app.use(express3.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await storage.ensurePredefinedCategories();
    log("Predefined categories initialized successfully");
  } catch (error) {
    log(`Warning: Failed to initialize predefined categories: ${error}`);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000");
  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
})();
