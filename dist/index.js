var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertBukuSchema: () => insertBukuSchema,
  insertKategoriSchema: () => insertKategoriSchema,
  insertLoginSchema: () => insertLoginSchema,
  insertLokasiSchema: () => insertLokasiSchema,
  insertPdfViewSchema: () => insertPdfViewSchema,
  insertSiteVisitorSchema: () => insertSiteVisitorSchema,
  insertStaffSchema: () => insertStaffSchema,
  insertUserActivitySchema: () => insertUserActivitySchema,
  tblBuku: () => tblBuku,
  tblEmployees: () => tblEmployees,
  tblKategori: () => tblKategori,
  tblLoanHistory: () => tblLoanHistory,
  tblLoanRequests: () => tblLoanRequests,
  tblLogin: () => tblLogin,
  tblLokasi: () => tblLokasi,
  tblPdfViews: () => tblPdfViews,
  tblSiteVisitors: () => tblSiteVisitors,
  tblStaff: () => tblStaff,
  tblUserActivity: () => tblUserActivity,
  updateBukuSchema: () => updateBukuSchema
});
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, date } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var tblLogin, tblKategori, tblLokasi, tblBuku, tblUserActivity, tblPdfViews, tblSiteVisitors, insertUserActivitySchema, insertPdfViewSchema, insertSiteVisitorSchema, insertLoginSchema, insertKategoriSchema, insertLokasiSchema, insertBukuSchema, updateBukuSchema, tblEmployees, tblStaff, tblLoanRequests, tblLoanHistory, insertStaffSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    tblLogin = mysqlTable("tbl_login", {
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
    tblKategori = mysqlTable("tbl_kategori", {
      id_kategori: int("id_kategori").primaryKey().autoincrement(),
      nama_kategori: varchar("nama_kategori", { length: 255 }).notNull()
    });
    tblLokasi = mysqlTable("tbl_rak", {
      id_lokasi: int("id_rak").primaryKey().autoincrement(),
      nama_lokasi: varchar("nama_rak", { length: 255 }).notNull(),
      deskripsi: varchar("lokasi", { length: 255 }),
      kapasitas: int("kapasitas")
    });
    tblBuku = mysqlTable("tbl_buku", {
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
    tblUserActivity = mysqlTable("tbl_user_activity", {
      id: int("id").primaryKey().autoincrement(),
      user_id: int("user_id").notNull(),
      activity_type: varchar("activity_type", { length: 50 }).notNull(),
      // 'login', 'logout', 'view', etc.
      activity_date: timestamp("activity_date").defaultNow().notNull(),
      ip_address: varchar("ip_address", { length: 45 }),
      user_agent: text("user_agent")
    });
    tblPdfViews = mysqlTable("tbl_pdf_views", {
      id: int("id").primaryKey().autoincrement(),
      book_id: int("book_id").notNull(),
      category_id: int("category_id").notNull(),
      ip_address: varchar("ip_address", { length: 45 }).notNull(),
      user_agent: text("user_agent"),
      view_date: timestamp("view_date").defaultNow().notNull(),
      user_id: int("user_id")
      // Optional: if user is logged in
    });
    tblSiteVisitors = mysqlTable("tbl_site_visitors", {
      id: int("id").primaryKey().autoincrement(),
      ip_address: varchar("ip_address", { length: 45 }).notNull(),
      first_visit: timestamp("first_visit").defaultNow().notNull(),
      last_visit: timestamp("last_visit").defaultNow().notNull(),
      visit_count: int("visit_count").default(1).notNull(),
      user_agent: text("user_agent")
    });
    insertUserActivitySchema = createInsertSchema(tblUserActivity).pick({
      user_id: true,
      activity_type: true,
      ip_address: true,
      user_agent: true
    });
    insertPdfViewSchema = createInsertSchema(tblPdfViews).pick({
      book_id: true,
      category_id: true,
      ip_address: true,
      user_agent: true,
      user_id: true
    });
    insertSiteVisitorSchema = createInsertSchema(tblSiteVisitors).pick({
      ip_address: true,
      user_agent: true
    });
    insertLoginSchema = createInsertSchema(tblLogin).pick({
      user: true,
      pass: true
    });
    insertKategoriSchema = createInsertSchema(tblKategori).pick({
      nama_kategori: true
    });
    insertLokasiSchema = createInsertSchema(tblLokasi).pick({
      nama_lokasi: true,
      deskripsi: true,
      kapasitas: true
    });
    insertBukuSchema = createInsertSchema(tblBuku).omit({
      id_buku: true
    });
    updateBukuSchema = insertBukuSchema.partial().extend({
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
    tblEmployees = mysqlTable("tbl_employees", {
      id: int("id").primaryKey().autoincrement(),
      nik: varchar("nik", { length: 20 }).notNull().unique(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 20 }),
      department: varchar("department", { length: 100 }),
      position: varchar("position", { length: 100 }),
      status: mysqlEnum("status", ["active", "inactive"]).default("active"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    tblStaff = mysqlTable("tbl_staff", {
      id_staff: int("id_staff").primaryKey().autoincrement(),
      staff_name: varchar("staff_name", { length: 255 }).notNull(),
      initial_name: varchar("initial_name", { length: 100 }),
      nik: varchar("nik", { length: 20 }).notNull().unique(),
      section_name: varchar("section_name", { length: 255 }),
      department_name: varchar("department_name", { length: 255 }),
      dept_name: varchar("dept_name", { length: 50 }),
      // Short department code
      no_hp: varchar("no_hp", { length: 20 }),
      email: varchar("email", { length: 255 }),
      status: int("status").default(1),
      // 1 = active, 0 = inactive
      position: varchar("position", { length: 255 }),
      photo: varchar("photo", { length: 255 }),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    tblLoanRequests = mysqlTable("tbl_loan_requests", {
      id: int("id").primaryKey().autoincrement(),
      request_id: varchar("request_id", { length: 20 }).notNull().unique(),
      // Book information
      id_buku: int("id_buku").notNull(),
      // Borrower information
      employee_nik: varchar("employee_nik", { length: 20 }).notNull(),
      borrower_name: varchar("borrower_name", { length: 255 }).notNull(),
      borrower_email: varchar("borrower_email", { length: 255 }),
      borrower_phone: varchar("borrower_phone", { length: 20 }),
      // Request details
      request_date: timestamp("request_date").defaultNow().notNull(),
      requested_return_date: date("requested_return_date"),
      reason: text("reason"),
      // Approval workflow
      status: mysqlEnum("status", ["pending", "approved", "rejected", "on_loan", "returned", "overdue"]).default("pending"),
      // Admin approval details
      approved_by: int("approved_by"),
      approval_date: timestamp("approval_date"),
      approval_notes: text("approval_notes"),
      // Loan details
      loan_date: timestamp("loan_date"),
      due_date: date("due_date"),
      return_date: timestamp("return_date"),
      return_notes: text("return_notes"),
      // Metadata
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    tblLoanHistory = mysqlTable("tbl_loan_history", {
      id: int("id").primaryKey().autoincrement(),
      loan_request_id: int("loan_request_id").notNull(),
      action: mysqlEnum("action", ["submitted", "approved", "rejected", "loaned", "returned", "overdue_notice"]).notNull(),
      action_date: timestamp("action_date").defaultNow().notNull(),
      performed_by: int("performed_by"),
      notes: text("notes"),
      old_status: mysqlEnum("old_status", ["pending", "approved", "rejected", "on_loan", "returned", "overdue"]),
      new_status: mysqlEnum("new_status", ["pending", "approved", "rejected", "on_loan", "returned", "overdue"])
    });
    insertStaffSchema = createInsertSchema(tblStaff).pick({
      staff_name: true,
      initial_name: true,
      nik: true,
      section_name: true,
      department_name: true,
      dept_name: true,
      no_hp: true,
      email: true,
      status: true,
      position: true,
      photo: true
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
var connection, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    connection = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "projek_perpus",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    db = drizzle(connection, { schema: schema_exports, mode: "default" });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  cache: () => cache,
  getVisitorStats: () => getVisitorStats,
  incrementPdfView: () => incrementPdfView,
  incrementSiteVisitor: () => incrementSiteVisitor,
  recordPdfView: () => recordPdfView,
  recordSiteVisitor: () => recordSiteVisitor,
  storage: () => storage
});
import { eq, like, or, desc, asc, count, sql, and, isNotNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { addDays } from "date-fns";
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
function getVisitorStats() {
  return {
    siteVisitorCount: siteVisitorIPs.size,
    pdfViewCount: pdfViewIPs.size
  };
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
    const now = /* @__PURE__ */ new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const existingVisitor = await db.select().from(tblSiteVisitors).where(
      and(
        eq(tblSiteVisitors.ip_address, ip),
        sql`DATE_FORMAT(${tblSiteVisitors.first_visit}, '%Y-%m') = ${currentYearMonth}`
      )
    ).limit(1);
    if (existingVisitor.length > 0) {
      await db.update(tblSiteVisitors).set({
        last_visit: now,
        visit_count: sql`visit_count + 1`
      }).where(eq(tblSiteVisitors.id, existingVisitor[0].id));
    } else {
      await db.insert(tblSiteVisitors).values({
        ip_address: ip,
        user_agent: userAgent,
        first_visit: now,
        last_visit: now
      });
    }
  } catch (error) {
    console.error("Error recording site visitor:", error);
  }
}
var siteVisitorIPs, pdfViewIPs, cache, CACHE_DURATION, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    siteVisitorIPs = /* @__PURE__ */ new Set();
    pdfViewIPs = /* @__PURE__ */ new Set();
    cache = /* @__PURE__ */ new Map();
    CACHE_DURATION = 5 * 60 * 1e3;
    DatabaseStorage = class {
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
        const availabilityExpression = sql`CASE 
      WHEN ${tblBuku.tersedia} = 1 AND NOT EXISTS (
        SELECT 1 FROM ${tblLoanRequests}
        WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
          AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
      ) THEN 1 ELSE 0 END`;
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
          tersedia: availabilityExpression,
          department: tblBuku.department,
          file_type: tblBuku.file_type,
          // Restored - column exists on server
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
      async getAvailableBooks(search, limit = 20) {
        const availabilityCondition = sql`(${tblBuku.tersedia} = 1 AND NOT EXISTS (
      SELECT 1 FROM ${tblLoanRequests}
      WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
        AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
    ))`;
        const bookCategoryCondition = eq(tblKategori.nama_kategori, "Book");
        const likeQuery = search ? `%${search}%` : void 0;
        const searchCondition = likeQuery ? sql`(${tblBuku.title} LIKE ${likeQuery} OR ${tblBuku.pengarang} LIKE ${likeQuery} OR ${tblBuku.penerbit} LIKE ${likeQuery} OR ${tblBuku.isbn} LIKE ${likeQuery})` : void 0;
        const conditions = [availabilityCondition, bookCategoryCondition];
        if (searchCondition) {
          conditions.push(searchCondition);
        }
        const combinedCondition = and(...conditions);
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
        }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi)).where(combinedCondition).orderBy(asc(tblBuku.title)).limit(limit);
        const countQuery = db.select({ count: count() }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).where(combinedCondition);
        const [books, totalResult] = await Promise.all([booksQuery, countQuery]);
        const total = totalResult[0]?.count ?? 0;
        return {
          books,
          total: Number(total)
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
      async getBookByPdfFilename(filename) {
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
        }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi)).where(eq(tblBuku.lampiran, filename)).limit(1);
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
      async cleanupCategories() {
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
        try {
          const uncategorizedCategory = await this.createCategory({ nama_kategori: "Uncategorized" });
          const categoriesToDelete = await db.select().from(tblKategori).where(sql`nama_kategori NOT IN (${predefinedCategories.map((cat) => `'${cat}'`).join(",")})`);
          for (const category of categoriesToDelete) {
            if (category.nama_kategori !== "Uncategorized") {
              await db.update(tblBuku).set({ id_kategori: uncategorizedCategory.id_kategori }).where(eq(tblBuku.id_kategori, category.id_kategori));
              console.log(`Moved books from category "${category.nama_kategori}" to "Uncategorized"`);
            }
          }
          await db.delete(tblKategori).where(sql`nama_kategori NOT IN (${[...predefinedCategories, "Uncategorized"].map((cat) => `'${cat}'`).join(",")})`);
          await this.ensurePredefinedCategories();
          console.log("Categories cleanup completed - only predefined categories remain");
        } catch (error) {
          console.error("Error during category cleanup:", error);
          throw error;
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
        const [booksCount, availableCount, categoriesCount, activeLoanCount] = await Promise.all([
          db.select({ count: count() }).from(tblBuku),
          db.select({ count: count() }).from(tblBuku).where(eq(tblBuku.tersedia, 1)),
          db.select({ count: count() }).from(tblKategori),
          db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, "approved"))
        ]);
        const totalBooks = booksCount[0].count;
        const availableBooks = availableCount[0].count;
        const onLoan = activeLoanCount[0].count;
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
      async getPdfTrackingDebugData() {
        try {
          const recentViews = await db.select({
            id: tblPdfViews.id,
            book_id: tblPdfViews.book_id,
            category_id: tblPdfViews.category_id,
            category_name: tblKategori.nama_kategori,
            book_title: tblBuku.title,
            viewed_at: tblPdfViews.view_date,
            ip_address: tblPdfViews.ip_address
          }).from(tblPdfViews).leftJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori)).leftJoin(tblBuku, eq(tblPdfViews.book_id, tblBuku.id_buku)).orderBy(desc(tblPdfViews.view_date)).limit(20);
          const categoryDistribution = await db.select({
            category: tblKategori.nama_kategori,
            view_count: count(tblPdfViews.id)
          }).from(tblPdfViews).leftJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori)).groupBy(tblPdfViews.category_id, tblKategori.nama_kategori).orderBy(desc(count(tblPdfViews.id)));
          const bookCategoryDistribution = await db.select({
            category: tblKategori.nama_kategori,
            book_count: count(tblBuku.id_buku)
          }).from(tblBuku).leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori)).groupBy(tblBuku.id_kategori, tblKategori.nama_kategori).orderBy(desc(count(tblBuku.id_buku)));
          return {
            recentViews,
            categoryDistribution,
            bookCategoryDistribution,
            totalPdfViews: recentViews.length > 0 ? await db.select({ count: count() }).from(tblPdfViews).then((r) => r[0].count) : 0
          };
        } catch (error) {
          console.error("Error getting PDF tracking debug data:", error);
          return { error: error instanceof Error ? error.message : "Unknown error" };
        }
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
        AND table_name = 'tbl_site_visitors'
      `);
          if (!tableCheck[0] || tableCheck[0].count === 0) {
            console.log("Site visitors table not found, returning sample data");
            return [
              { month: "May", activeUsers: 15 },
              { month: "Jun", activeUsers: 28 },
              { month: "Jul", activeUsers: 42 },
              { month: "Aug", activeUsers: 35 },
              { month: "Sep", activeUsers: 58 },
              { month: "Oct", activeUsers: 67 }
            ];
          }
          const currentDate = /* @__PURE__ */ new Date();
          const sixMonthWindowStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
          const results = await db.select({
            month: sql`DATE_FORMAT(first_visit, '%Y-%m')`,
            activeUsers: sql`COUNT(DISTINCT ip_address)`
            // Count unique IP addresses instead of user_id
          }).from(tblSiteVisitors).where(sql`first_visit >= ${sixMonthWindowStart.toISOString().split("T")[0]}`).groupBy(sql`DATE_FORMAT(first_visit, '%Y-%m')`).orderBy(sql`DATE_FORMAT(first_visit, '%Y-%m')`);
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlyData = [];
          for (let i = 5; i >= 0; i--) {
            const date2 = new Date(currentDate);
            date2.setMonth(date2.getMonth() - i);
            const yearMonth = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, "0")}`;
            const monthName = monthNames[date2.getMonth()];
            const result = results.find((r) => r.month === yearMonth);
            monthlyData.push({
              month: monthName,
              activeUsers: result ? result.activeUsers : 0
            });
          }
          return monthlyData;
        } catch (error) {
          console.error("Error fetching monthly visitor activity:", error);
          return [
            { month: "May", activeUsers: 15 },
            { month: "Jun", activeUsers: 28 },
            { month: "Jul", activeUsers: 42 },
            { month: "Aug", activeUsers: 35 },
            { month: "Sep", activeUsers: 58 },
            { month: "Oct", activeUsers: 67 }
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
            // Count unique site visitors (distinct IPs across all time)
            db.select({ count: count(sql`DISTINCT ${tblSiteVisitors.ip_address}`) }).from(tblSiteVisitors),
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
      // ===== LOANS SYSTEM IMPLEMENTATIONS =====
      // Employee methods
      async getEmployees() {
        return await db.select().from(tblEmployees).where(eq(tblEmployees.status, "active")).orderBy(tblEmployees.name);
      }
      async getEmployeeByNik(nik) {
        const results = await db.select().from(tblEmployees).where(eq(tblEmployees.nik, nik)).limit(1);
        return results[0];
      }
      async createEmployee(employee) {
        const results = await db.insert(tblEmployees).values(employee);
        const insertedId = results[0].insertId;
        const newEmployee = await db.select().from(tblEmployees).where(eq(tblEmployees.id, insertedId)).limit(1);
        return newEmployee[0];
      }
      async updateEmployee(id, employee) {
        await db.update(tblEmployees).set(employee).where(eq(tblEmployees.id, id));
        const updated = await db.select().from(tblEmployees).where(eq(tblEmployees.id, id)).limit(1);
        return updated[0];
      }
      async deleteEmployee(id) {
        try {
          await db.update(tblEmployees).set({ status: "inactive" }).where(eq(tblEmployees.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting employee:", error);
          return false;
        }
      }
      async importEmployees(employees) {
        let success = 0;
        const errors = [];
        for (const employee of employees) {
          try {
            await db.insert(tblEmployees).values(employee).onDuplicateKeyUpdate({
              set: {
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                department: employee.department,
                position: employee.position,
                updated_at: /* @__PURE__ */ new Date()
              }
            });
            success++;
          } catch (error) {
            errors.push(`Failed to import employee ${employee.nik}: ${error}`);
          }
        }
        return { success, errors };
      }
      // Loan request methods
      async createLoanRequest(request) {
        try {
          if (!request.request_id) {
            const requestCount = await db.select({ count: count() }).from(tblLoanRequests);
            request.request_id = `LR-${String(requestCount[0].count + 1).padStart(6, "0")}`;
          }
          const results = await db.insert(tblLoanRequests).values(request);
          const insertedId = results[0].insertId;
          await this.logLoanAction(insertedId, "submitted", void 0, "Loan request submitted", void 0, "pending");
          const newRequest = await db.select().from(tblLoanRequests).where(eq(tblLoanRequests.id, insertedId)).limit(1);
          return newRequest[0];
        } catch (error) {
          console.error("Error creating loan request:", error);
          throw new Error("Failed to create loan request");
        }
      }
      async getLoanRequests(filters = {}) {
        const { status, employeeNik, page = 1, limit = 25 } = filters;
        try {
          let query = db.select({
            id: tblLoanRequests.id,
            request_id: tblLoanRequests.request_id,
            id_buku: tblLoanRequests.id_buku,
            employee_nik: tblLoanRequests.employee_nik,
            borrower_name: tblLoanRequests.borrower_name,
            borrower_email: tblLoanRequests.borrower_email,
            borrower_phone: tblLoanRequests.borrower_phone,
            request_date: tblLoanRequests.request_date,
            requested_return_date: tblLoanRequests.requested_return_date,
            reason: tblLoanRequests.reason,
            status: tblLoanRequests.status,
            approved_by: tblLoanRequests.approved_by,
            approval_date: tblLoanRequests.approval_date,
            approval_notes: tblLoanRequests.approval_notes,
            loan_date: tblLoanRequests.loan_date,
            due_date: tblLoanRequests.due_date,
            return_date: tblLoanRequests.return_date,
            return_notes: tblLoanRequests.return_notes,
            created_at: tblLoanRequests.created_at,
            updated_at: tblLoanRequests.updated_at,
            // Related data
            book_title: tblBuku.title,
            book_isbn: tblBuku.isbn,
            employee_name: tblEmployees.name,
            employee_department: tblEmployees.department,
            approver_name: tblLogin.nama
          }).from(tblLoanRequests).leftJoin(tblBuku, eq(tblLoanRequests.id_buku, tblBuku.id_buku)).leftJoin(tblEmployees, eq(tblLoanRequests.employee_nik, tblEmployees.nik)).leftJoin(tblLogin, eq(tblLoanRequests.approved_by, tblLogin.id_login));
          const conditions = [];
          if (status) {
            conditions.push(eq(tblLoanRequests.status, status));
          }
          if (employeeNik) {
            conditions.push(eq(tblLoanRequests.employee_nik, employeeNik));
          }
          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
          const totalQuery = db.select({ count: count() }).from(tblLoanRequests);
          if (conditions.length > 0) {
            totalQuery.where(and(...conditions));
          }
          const totalResult = await totalQuery;
          const total = totalResult[0].count;
          const offset = (page - 1) * limit;
          const requests = await query.orderBy(desc(tblLoanRequests.request_date)).limit(limit).offset(offset);
          return { requests, total };
        } catch (error) {
          console.error("Error fetching loan requests:", error);
          throw new Error("Failed to fetch loan requests");
        }
      }
      async getLoanRequestById(id) {
        try {
          console.log("getLoanRequestById called with id:", id, typeof id);
          if (isNaN(id) || !Number.isFinite(id)) {
            console.error("Invalid ID passed to getLoanRequestById:", id);
            throw new Error(`Invalid ID: ${id}`);
          }
          const results = await db.select({
            id: tblLoanRequests.id,
            request_id: tblLoanRequests.request_id,
            id_buku: tblLoanRequests.id_buku,
            employee_nik: tblLoanRequests.employee_nik,
            borrower_name: tblLoanRequests.borrower_name,
            borrower_email: tblLoanRequests.borrower_email,
            borrower_phone: tblLoanRequests.borrower_phone,
            request_date: tblLoanRequests.request_date,
            requested_return_date: tblLoanRequests.requested_return_date,
            reason: tblLoanRequests.reason,
            status: tblLoanRequests.status,
            approved_by: tblLoanRequests.approved_by,
            approval_date: tblLoanRequests.approval_date,
            approval_notes: tblLoanRequests.approval_notes,
            loan_date: tblLoanRequests.loan_date,
            due_date: tblLoanRequests.due_date,
            return_date: tblLoanRequests.return_date,
            return_notes: tblLoanRequests.return_notes,
            created_at: tblLoanRequests.created_at,
            updated_at: tblLoanRequests.updated_at,
            // Related data
            book_title: tblBuku.title,
            book_isbn: tblBuku.isbn,
            employee_name: tblEmployees.name,
            employee_department: tblEmployees.department,
            approver_name: tblLogin.nama
          }).from(tblLoanRequests).leftJoin(tblBuku, eq(tblLoanRequests.id_buku, tblBuku.id_buku)).leftJoin(tblEmployees, eq(tblLoanRequests.employee_nik, tblEmployees.nik)).leftJoin(tblLogin, eq(tblLoanRequests.approved_by, tblLogin.id_login)).where(eq(tblLoanRequests.id, id)).limit(1);
          return results[0];
        } catch (error) {
          console.error("Error fetching loan request by ID:", error);
          throw new Error("Failed to fetch loan request");
        }
      }
      async approveLoanRequest(id, adminId, notes) {
        try {
          const currentRequest = await this.getLoanRequestById(id);
          if (!currentRequest) {
            throw new Error("Loan request not found");
          }
          const approvalDate = /* @__PURE__ */ new Date();
          const autoDueDate = addDays(approvalDate, 14);
          await db.update(tblLoanRequests).set({
            status: "approved",
            approved_by: adminId,
            approval_date: approvalDate,
            approval_notes: notes,
            due_date: autoDueDate
          }).where(eq(tblLoanRequests.id, id));
          const logNotes = notes ? `${notes} (Due date auto-set to ${autoDueDate.toISOString().split("T")[0]})` : `Due date auto-set to ${autoDueDate.toISOString().split("T")[0]}`;
          await this.logLoanAction(id, "approved", adminId, logNotes, "pending", "approved");
          try {
            if (currentRequest.id_buku) {
              await db.update(tblBuku).set({
                tersedia: 0
                // mark as not available in repository
              }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
            }
          } catch (buchErr) {
            console.error("Error updating book availability on approve:", buchErr);
          }
          cache.delete("dashboard_stats");
          return true;
        } catch (error) {
          console.error("Error approving loan request:", error);
          return false;
        }
      }
      async rejectLoanRequest(id, adminId, notes) {
        try {
          const currentRequest = await this.getLoanRequestById(id);
          if (!currentRequest) {
            throw new Error("Loan request not found");
          }
          await db.update(tblLoanRequests).set({
            status: "rejected",
            approved_by: adminId,
            approval_date: /* @__PURE__ */ new Date(),
            approval_notes: notes
          }).where(eq(tblLoanRequests.id, id));
          await this.logLoanAction(id, "rejected", adminId, notes, "pending", "rejected");
          cache.delete("dashboard_stats");
          return true;
        } catch (error) {
          console.error("Error rejecting loan request:", error);
          return false;
        }
      }
      async markBookAsLoaned(requestId, dueDate) {
        try {
          const currentRequest = await this.getLoanRequestById(requestId);
          if (!currentRequest || currentRequest.status !== "approved") {
            throw new Error("Invalid loan request for loaning");
          }
          await db.update(tblLoanRequests).set({
            status: "on_loan",
            loan_date: /* @__PURE__ */ new Date(),
            due_date: dueDate
          }).where(eq(tblLoanRequests.id, requestId));
          await db.update(tblBuku).set({
            tersedia: 0
            // Mark as not available
          }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
          await this.logLoanAction(requestId, "loaned", currentRequest.approved_by || void 0, "Book handed out to borrower", "approved", "on_loan");
          return true;
        } catch (error) {
          console.error("Error marking book as loaned:", error);
          return false;
        }
      }
      async returnBook(requestId, returnNotes) {
        try {
          const currentRequest = await this.getLoanRequestById(requestId);
          if (!currentRequest || currentRequest.status !== "on_loan") {
            throw new Error("Invalid loan request for return");
          }
          await db.update(tblLoanRequests).set({
            status: "returned",
            return_date: /* @__PURE__ */ new Date(),
            return_notes: returnNotes
          }).where(eq(tblLoanRequests.id, requestId));
          await db.update(tblBuku).set({
            tersedia: 1
            // Mark as available again
          }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
          await this.logLoanAction(requestId, "returned", void 0, returnNotes, "on_loan", "returned");
          return true;
        } catch (error) {
          console.error("Error returning book:", error);
          return false;
        }
      }
      // Loan history methods
      async getLoanHistory(requestId) {
        try {
          return await db.select().from(tblLoanHistory).where(eq(tblLoanHistory.loan_request_id, requestId)).orderBy(desc(tblLoanHistory.action_date));
        } catch (error) {
          console.error("Error fetching loan history:", error);
          return [];
        }
      }
      async logLoanAction(requestId, action, performedBy, notes, oldStatus, newStatus) {
        try {
          await db.insert(tblLoanHistory).values({
            loan_request_id: requestId,
            action,
            performed_by: performedBy,
            notes,
            old_status: oldStatus,
            new_status: newStatus
          });
        } catch (error) {
          console.error("Error logging loan action:", error);
        }
      }
      async returnLoanRequest(id, adminId) {
        try {
          const currentRequest = await this.getLoanRequestById(id);
          if (!currentRequest) {
            throw new Error("Loan request not found");
          }
          await db.update(tblLoanRequests).set({
            status: "returned",
            return_date: /* @__PURE__ */ new Date(),
            approved_by: adminId
          }).where(eq(tblLoanRequests.id, id));
          try {
            if (currentRequest.id_buku) {
              await db.update(tblBuku).set({
                tersedia: 1
                // mark as available
              }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
            }
          } catch (buchErr) {
            console.error("Error updating book availability on return:", buchErr);
          }
          await this.logLoanAction(id, "returned", adminId, "Marked as returned by admin", "approved", "returned");
          cache.delete("dashboard_stats");
          return true;
        } catch (error) {
          console.error("Error marking loan as returned:", error);
          return false;
        }
      }
      async getLoanRequestStats() {
        try {
          const [pendingResult, activeResult, completedResult, overdueResult] = await Promise.all([
            db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, "pending")),
            db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, "approved")),
            db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, "returned")),
            db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, "overdue"))
          ]);
          return {
            pending: pendingResult[0]?.count || 0,
            active: activeResult[0]?.count || 0,
            completed: completedResult[0]?.count || 0,
            overdue: overdueResult[0]?.count || 0
          };
        } catch (error) {
          console.error("Error fetching loan request stats:", error);
          return { pending: 0, active: 0, completed: 0, overdue: 0 };
        }
      }
      async getUserLoanRequestStats(userId) {
        try {
          const user = await db.select().from(tblLogin).where(eq(tblLogin.id_login, userId)).limit(1);
          if (!user[0] || !user[0].anggota_id) {
            return { pending: 0, approved: 0, returned: 0 };
          }
          return this.getUserLoanRequestStatsByNik(user[0].anggota_id);
        } catch (error) {
          console.error("Error fetching user loan request stats:", error);
          return { pending: 0, approved: 0, returned: 0 };
        }
      }
      async getUserLoanRequestStatsByNik(employeeNik) {
        try {
          const [pendingResult, approvedResult, returnedResult] = await Promise.all([
            db.select({ count: count() }).from(tblLoanRequests).where(and(
              eq(tblLoanRequests.employee_nik, employeeNik),
              eq(tblLoanRequests.status, "pending")
            )),
            db.select({ count: count() }).from(tblLoanRequests).where(and(
              eq(tblLoanRequests.employee_nik, employeeNik),
              eq(tblLoanRequests.status, "approved")
            )),
            db.select({ count: count() }).from(tblLoanRequests).where(and(
              eq(tblLoanRequests.employee_nik, employeeNik),
              eq(tblLoanRequests.status, "returned")
            ))
          ]);
          return {
            pending: pendingResult[0]?.count || 0,
            approved: approvedResult[0]?.count || 0,
            returned: returnedResult[0]?.count || 0
          };
        } catch (error) {
          console.error("Error fetching user loan request stats by NIK:", error);
          return { pending: 0, approved: 0, returned: 0 };
        }
      }
      async getMonthlyLoanBorrowed() {
        try {
          const borrowDateExpression = sql`COALESCE(${tblLoanRequests.loan_date}, ${tblLoanRequests.approval_date})`;
          const startDate = /* @__PURE__ */ new Date();
          startDate.setHours(0, 0, 0, 0);
          startDate.setDate(1);
          startDate.setMonth(startDate.getMonth() - 11);
          const rawResults = await db.select({
            monthKey: sql`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`,
            borrowed: sql`COUNT(*)`
          }).from(tblLoanRequests).where(and(
            sql`${borrowDateExpression} IS NOT NULL`,
            sql`${borrowDateExpression} >= ${startDate.toISOString().split("T")[0]}`,
            sql`${tblLoanRequests.status} NOT IN ('pending', 'rejected')`
          )).groupBy(sql`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`).orderBy(sql`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`);
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return rawResults.map((result) => {
            const [year, month] = result.monthKey.split("-");
            const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1));
            return {
              month: `${monthNames[monthIndex]} ${year}`,
              borrowed: result.borrowed
            };
          });
        } catch (error) {
          console.error("Error fetching monthly loan borrowed stats:", error);
          return [];
        }
      }
      // ===== STAFF MANAGEMENT METHODS =====
      async getStaff(page = 1, limit = 25, search) {
        try {
          const offset = (page - 1) * limit;
          if (search) {
            const searchCondition = or(
              like(tblStaff.staff_name, `%${search}%`),
              like(tblStaff.nik, `%${search}%`),
              like(tblStaff.email, `%${search}%`),
              like(tblStaff.department_name, `%${search}%`),
              like(tblStaff.dept_name, `%${search}%`)
            );
            const [staff, totalResult] = await Promise.all([
              db.select().from(tblStaff).where(searchCondition).orderBy(asc(tblStaff.staff_name)).offset(offset).limit(limit),
              db.select({ count: count() }).from(tblStaff).where(searchCondition)
            ]);
            return {
              staff,
              total: totalResult[0]?.count || 0
            };
          } else {
            const [staff, totalResult] = await Promise.all([
              db.select().from(tblStaff).orderBy(asc(tblStaff.staff_name)).offset(offset).limit(limit),
              db.select({ count: count() }).from(tblStaff)
            ]);
            return {
              staff,
              total: totalResult[0]?.count || 0
            };
          }
        } catch (error) {
          console.error("Error fetching staff:", error);
          return { staff: [], total: 0 };
        }
      }
      async getStaffById(id) {
        try {
          const result = await db.select().from(tblStaff).where(eq(tblStaff.id_staff, id)).limit(1);
          return result[0] || null;
        } catch (error) {
          console.error("Error fetching staff by ID:", error);
          return null;
        }
      }
      async getStaffByNik(nik) {
        try {
          const result = await db.select().from(tblStaff).where(eq(tblStaff.nik, nik)).limit(1);
          return result[0] || null;
        } catch (error) {
          console.error("Error fetching staff by NIK:", error);
          return null;
        }
      }
      async createStaff(staffData) {
        try {
          const result = await db.insert(tblStaff).values(staffData);
          const insertedId = result[0].insertId;
          const newStaff = await this.getStaffById(Number(insertedId));
          if (!newStaff) {
            throw new Error("Failed to retrieve created staff");
          }
          return newStaff;
        } catch (error) {
          console.error("Error creating staff:", error);
          throw error;
        }
      }
      async updateStaff(id, updates) {
        try {
          await db.update(tblStaff).set({
            ...updates,
            updated_at: /* @__PURE__ */ new Date()
          }).where(eq(tblStaff.id_staff, id));
          return await this.getStaffById(id);
        } catch (error) {
          console.error("Error updating staff:", error);
          return null;
        }
      }
      async deleteStaff(id) {
        try {
          const result = await db.delete(tblStaff).where(eq(tblStaff.id_staff, id));
          return (result[0]?.affectedRows || 0) > 0;
        } catch (error) {
          console.error("Error deleting staff:", error);
          return false;
        }
      }
      async bulkCreateStaff(staffList) {
        const errors = [];
        let success = 0;
        for (const staffData of staffList) {
          try {
            const existing = await this.getStaffByNik(staffData.nik);
            if (existing) {
              errors.push(`Staff with NIK ${staffData.nik} already exists`);
              continue;
            }
            await this.createStaff(staffData);
            success++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            errors.push(`Failed to create staff ${staffData.staff_name}: ${errorMessage}`);
          }
        }
        return { success, errors };
      }
      async getStaffDepartments() {
        try {
          const result = await db.selectDistinct({ dept_name: tblStaff.dept_name }).from(tblStaff).where(isNotNull(tblStaff.dept_name)).orderBy(asc(tblStaff.dept_name));
          return result.map((r) => r.dept_name).filter(Boolean);
        } catch (error) {
          console.error("Error fetching staff departments:", error);
          return [];
        }
      }
      async getStaffSections() {
        try {
          const result = await db.selectDistinct({ section_name: tblStaff.section_name }).from(tblStaff).where(isNotNull(tblStaff.section_name)).orderBy(asc(tblStaff.section_name));
          return result.map((r) => r.section_name).filter(Boolean);
        } catch (error) {
          console.error("Error fetching staff sections:", error);
          return [];
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express3 from "express";
import compression from "compression";

// server/routes.ts
init_storage();
init_schema();
init_storage();
import { createServer } from "http";
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
      console.log(`PDF View Tracking - Filename: ${filename}`);
      const bookIdMatch = filename.match(/(?:book_)?(\d+)\.pdf$/i);
      console.log(`PDF View Tracking - Book ID Match: ${bookIdMatch ? bookIdMatch[1] : "No match"}`);
      if (bookIdMatch) {
        const bookId = parseInt(bookIdMatch[1]);
        const book = await storage.getBookById(bookId);
        console.log(`PDF View Tracking - Book found: ${book ? `ID: ${book.id_buku}, Category ID: ${book.id_kategori}, Category: ${book.kategori_nama}` : "Not found"}`);
        if (book && book.id_kategori) {
          await recordPdfView(
            bookId,
            book.id_kategori,
            getClientIP(req),
            req.headers["user-agent"],
            req.session.userId
          );
          console.log(`PDF View Tracking - Recorded view for Book ID: ${bookId}, Category ID: ${book.id_kategori}, Category: ${book.kategori_nama}`);
        }
      } else {
        console.log(`PDF View Tracking - Trying to find book by filename: ${filename}`);
        try {
          const bookByFilename = await storage.getBookByPdfFilename(filename);
          if (bookByFilename && bookByFilename.id_kategori) {
            await recordPdfView(
              bookByFilename.id_buku,
              bookByFilename.id_kategori,
              getClientIP(req),
              req.headers["user-agent"],
              req.session.userId
            );
            console.log(`PDF View Tracking - Recorded view by filename for Book ID: ${bookByFilename.id_buku}, Category ID: ${bookByFilename.id_kategori}, Category: ${bookByFilename.kategori_nama}`);
          }
        } catch (error) {
          console.log("PDF View Tracking - Book not found by filename");
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
  app2.post("/api/dashboard/clear-cache", requireAuth, async (req, res) => {
    try {
      const { cache: cache2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      cache2.delete("dashboard_stats");
      res.json({ message: "Dashboard cache cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cache" });
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
  app2.get("/api/dashboard/monthly-loans", requireAuth, async (req, res) => {
    try {
      const monthlyLoans = await storage.getMonthlyLoanBorrowed();
      res.json(monthlyLoans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly loan data" });
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
  app2.get("/api/debug/pdf-tracking", requireAuth, async (req, res) => {
    try {
      const debugData = await storage.getPdfTrackingDebugData();
      res.json(debugData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PDF tracking debug data" });
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
      const availableOnly = req.query.available === "true";
      const search = req.query.search;
      const limitParam = parseInt(req.query.limit);
      const limitForAvailable = !Number.isNaN(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 20;
      if (availableOnly) {
        const { books, total } = await storage.getAvailableBooks(search, limitForAvailable);
        return res.json({ books, total });
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
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
  app2.post("/api/categories/cleanup", requireAuth, async (req, res) => {
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
  app2.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  app2.get("/api/staff", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const search = req.query.search;
      const result = await storage.getStaff(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });
  app2.get("/api/staff/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/staff/nik/:nik", requireAuth, async (req, res) => {
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
  app2.post("/api/staff", requireAuth, async (req, res) => {
    try {
      const staff = await storage.createStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });
  app2.put("/api/staff/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/staff/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/staff/bulk-import", requireAuth, async (req, res) => {
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
  app2.get("/api/staff/meta/departments", requireAuth, async (req, res) => {
    try {
      const departments = await storage.getStaffDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching staff departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });
  app2.get("/api/staff/meta/sections", requireAuth, async (req, res) => {
    try {
      const sections = await storage.getStaffSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching staff sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });
  app2.get("/api/test/sample-niks", async (req, res) => {
    try {
      const staff = await storage.getStaff(1, 5);
      const sampleNiks = staff.staff.map((s) => ({ nik: s.nik, name: s.staff_name }));
      res.json(sampleNiks);
    } catch (error) {
      console.error("Error fetching sample NIKs:", error);
      res.status(500).json({ message: "Failed to fetch sample NIKs" });
    }
  });
  app2.get("/api/debug/loan-requests", async (req, res) => {
    try {
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
  app2.get("/api/test/loan-requests", async (req, res) => {
    try {
      const { status, employeeNik, page = "1", limit = "25" } = req.query;
      const filters = {
        status,
        employeeNik,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getLoanRequests(filters);
      console.log("Test endpoint result:", result);
      res.json(result);
    } catch (error) {
      console.error("Error fetching loan requests:", error);
      res.status(500).json({ message: "Failed to fetch loan requests", error: error.message });
    }
  });
  app2.post("/api/admin/sync-staff-to-employees", requireAuth, async (req, res) => {
    try {
      const allStaff = await storage.getStaff(1, 1e3);
      let synced = 0;
      let errors = 0;
      for (const staff of allStaff.staff) {
        try {
          const existingEmployee = await storage.getEmployeeByNik(staff.nik);
          if (!existingEmployee) {
            const employeeData = {
              nik: staff.nik,
              name: staff.staff_name,
              email: staff.email || "",
              phone: staff.no_hp || "",
              department: staff.department_name || staff.dept_name || "",
              position: staff.position || "",
              status: staff.status === 1 ? "active" : "inactive"
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
  app2.post("/api/employees", async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });
  app2.get("/api/employees/:nik", async (req, res) => {
    try {
      const { nik } = req.params;
      let employee = await storage.getEmployeeByNik(nik);
      if (!employee) {
        const staff = await storage.getStaffByNik(nik);
        if (staff) {
          employee = {
            id: staff.id_staff,
            nik: staff.nik,
            name: staff.staff_name,
            email: staff.email || "",
            phone: staff.no_hp || "",
            department: staff.department_name || staff.dept_name || "",
            position: staff.position || "",
            status: staff.status === 1 ? "active" : "inactive",
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
  app2.post("/api/loan-requests", async (req, res) => {
    try {
      const { employee_nik } = req.body;
      let employee = await storage.getEmployeeByNik(employee_nik);
      if (!employee) {
        const staff = await storage.getStaffByNik(employee_nik);
        if (staff) {
          const employeeData = {
            nik: staff.nik,
            name: staff.staff_name,
            email: staff.email || "",
            phone: staff.no_hp || "",
            department: staff.department_name || staff.dept_name || "",
            position: staff.position || "",
            status: staff.status === 1 ? "active" : "inactive"
          };
          try {
            employee = await storage.createEmployee(employeeData);
            console.log(`Created employee record for NIK: ${employee_nik}`);
          } catch (createError) {
            console.error("Error creating employee record:", createError);
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
      const loanRequest = await storage.createLoanRequest(req.body);
      res.status(201).json(loanRequest);
    } catch (error) {
      console.error("Error creating loan request:", error);
      res.status(500).json({ message: "Failed to create loan request" });
    }
  });
  app2.get("/api/loan-requests", async (req, res) => {
    try {
      const { status, employeeNik, page = "1", limit = "25" } = req.query;
      const filters = {
        status,
        employeeNik,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getLoanRequests(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching loan requests:", error);
      res.status(500).json({ message: "Failed to fetch loan requests" });
    }
  });
  app2.get("/api/loan-requests/stats", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const isAdminOrPetugas = user?.level === "admin" || user?.level === "petugas";
      if (isAdminOrPetugas) {
        const stats = await storage.getLoanRequestStats();
        res.json(stats);
      } else {
        const stats = await storage.getUserLoanRequestStats(user?.id || 0);
        res.json(stats);
      }
    } catch (error) {
      console.error("Error fetching loan request stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/loan-requests/:id", async (req, res) => {
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
  app2.post("/api/loan-requests/:id/approve", requireAuth, async (req, res) => {
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
      const updatedRequest = await storage.getLoanRequestById(requestId);
      res.json({
        message: "Loan request approved successfully",
        dueDate: updatedRequest?.due_date,
        approvalDate: updatedRequest?.approval_date,
        request: updatedRequest
      });
    } catch (error) {
      console.error("Error approving loan request:", error);
      res.status(500).json({ message: "Failed to approve loan request" });
    }
  });
  app2.post("/api/loan-requests/:id/reject", requireAuth, async (req, res) => {
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
  app2.patch("/api/loan-requests/:id/return", requireAuth, async (req, res) => {
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
  app2.patch("/api/loan-requests/:id/approve", requireAuth, async (req, res) => {
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
      const updatedRequest = await storage.getLoanRequestById(requestId);
      res.json({
        message: "Loan request approved successfully",
        dueDate: updatedRequest?.due_date,
        approvalDate: updatedRequest?.approval_date,
        request: updatedRequest
      });
    } catch (error) {
      console.error("Error approving loan request:", error);
      res.status(500).json({ message: "Failed to approve loan request" });
    }
  });
  app2.patch("/api/loan-requests/:id/reject", requireAuth, async (req, res) => {
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
init_storage();
process.env.NODE_ENV = process.env.NODE_ENV || "production";
var app = express3();
app.set("env", process.env.NODE_ENV);
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
