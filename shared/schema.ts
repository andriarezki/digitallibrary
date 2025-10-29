import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, date } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tblLogin = mysqlTable("tbl_login", {
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
  foto: varchar("foto", { length: 255 }),
});

export const tblKategori = mysqlTable("tbl_kategori", {
  id_kategori: int("id_kategori").primaryKey().autoincrement(),
  nama_kategori: varchar("nama_kategori", { length: 255 }).notNull(),
});

// Map tbl_rak (database) to Lokasi interface (UI shows "Locations")
export const tblLokasi = mysqlTable("tbl_rak", {
  id_lokasi: int("id_rak").primaryKey().autoincrement(),
  nama_lokasi: varchar("nama_rak", { length: 255 }).notNull(),
  deskripsi: varchar("lokasi", { length: 255 }),
  kapasitas: int("kapasitas"),
});

// Map tbl_buku fields to interface (id_rak maps to id_lokasi in code)
export const tblBuku = mysqlTable("tbl_buku", {
  id_buku: int("id_buku").primaryKey().autoincrement(),
  buku_id: varchar("buku_id", { length: 255 }).notNull(),
  id_kategori: int("id_kategori").notNull(),
  id_lokasi: int("id_rak").notNull(), // Maps to id_rak in database
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
  file_type: varchar("file_type", { length: 10 }), // Added back for server deployment
});

export const tblUserActivity = mysqlTable("tbl_user_activity", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  activity_type: varchar("activity_type", { length: 50 }).notNull(), // 'login', 'logout', 'view', etc.
  activity_date: timestamp("activity_date").defaultNow().notNull(),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
});

export const tblPdfViews = mysqlTable("tbl_pdf_views", {
  id: int("id").primaryKey().autoincrement(),
  book_id: int("book_id").notNull(),
  category_id: int("category_id").notNull(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  user_agent: text("user_agent"),
  view_date: timestamp("view_date").defaultNow().notNull(),
  user_id: int("user_id"), // Optional: if user is logged in
});

export const tblSiteVisitors = mysqlTable("tbl_site_visitors", {
  id: int("id").primaryKey().autoincrement(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  first_visit: timestamp("first_visit").defaultNow().notNull(),
  last_visit: timestamp("last_visit").defaultNow().notNull(),
  visit_count: int("visit_count").default(1).notNull(),
  user_agent: text("user_agent"),
});

export const insertUserActivitySchema = createInsertSchema(tblUserActivity).pick({
  user_id: true,
  activity_type: true,
  ip_address: true,
  user_agent: true,
});

export const insertPdfViewSchema = createInsertSchema(tblPdfViews).pick({
  book_id: true,
  category_id: true,
  ip_address: true,
  user_agent: true,
  user_id: true,
});

export const insertSiteVisitorSchema = createInsertSchema(tblSiteVisitors).pick({
  ip_address: true,
  user_agent: true,
});

export const insertLoginSchema = createInsertSchema(tblLogin).pick({
  user: true,
  pass: true,
});

export const insertKategoriSchema = createInsertSchema(tblKategori).pick({
  nama_kategori: true,
});

export const insertLokasiSchema = createInsertSchema(tblLokasi).pick({
  nama_lokasi: true,
  deskripsi: true,
  kapasitas: true,
});

export const insertBukuSchema = createInsertSchema(tblBuku).omit({
  id_buku: true,
});

// Schema for handling FormData updates (coerces strings to numbers)
export const updateBukuSchema = insertBukuSchema.partial().extend({
  id_kategori: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  id_lokasi: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  tersedia: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  jml: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
});

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof tblUserActivity.$inferSelect;
export type InsertLogin = z.infer<typeof insertLoginSchema>;
export type Login = typeof tblLogin.$inferSelect;
export type InsertKategori = z.infer<typeof insertKategoriSchema>;
export type Kategori = typeof tblKategori.$inferSelect;
export type InsertLokasi = z.infer<typeof insertLokasiSchema>;
export type Lokasi = typeof tblLokasi.$inferSelect;
export type InsertBuku = z.infer<typeof insertBukuSchema>;
export type Buku = typeof tblBuku.$inferSelect;
export type InsertPdfView = z.infer<typeof insertPdfViewSchema>;
export type PdfView = typeof tblPdfViews.$inferSelect;
export type InsertSiteVisitor = z.infer<typeof insertSiteVisitorSchema>;
export type SiteVisitor = typeof tblSiteVisitors.$inferSelect;

// ===== LOANS SYSTEM TABLES =====

// Employee master data table
export const tblEmployees = mysqlTable("tbl_employees", {
  id: int("id").primaryKey().autoincrement(),
  nik: varchar("nik", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Staff master data table (comprehensive table from CSV data)
export const tblStaff = mysqlTable("tbl_staff", {
  id_staff: int("id_staff").primaryKey().autoincrement(),
  staff_name: varchar("staff_name", { length: 255 }).notNull(),
  initial_name: varchar("initial_name", { length: 100 }),
  nik: varchar("nik", { length: 20 }).notNull().unique(),
  section_name: varchar("section_name", { length: 255 }),
  department_name: varchar("department_name", { length: 255 }),
  dept_name: varchar("dept_name", { length: 50 }), // Short department code
  no_hp: varchar("no_hp", { length: 20 }),
  email: varchar("email", { length: 255 }),
  status: int("status").default(1), // 1 = active, 0 = inactive
  position: varchar("position", { length: 255 }),
  photo: varchar("photo", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Loan requests table
export const tblLoanRequests = mysqlTable("tbl_loan_requests", {
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
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Loan history table
export const tblLoanHistory = mysqlTable("tbl_loan_history", {
  id: int("id").primaryKey().autoincrement(),
  loan_request_id: int("loan_request_id").notNull(),
  action: mysqlEnum("action", ["submitted", "approved", "rejected", "loaned", "returned", "overdue_notice"]).notNull(),
  action_date: timestamp("action_date").defaultNow().notNull(),
  performed_by: int("performed_by"),
  notes: text("notes"),
  old_status: mysqlEnum("old_status", ["pending", "approved", "rejected", "on_loan", "returned", "overdue"]),
  new_status: mysqlEnum("new_status", ["pending", "approved", "rejected", "on_loan", "returned", "overdue"]),
});

// ===== LOANS SYSTEM TYPES =====

export type Employee = typeof tblEmployees.$inferSelect;
export type InsertEmployee = typeof tblEmployees.$inferInsert;

export type Staff = typeof tblStaff.$inferSelect;
export type InsertStaff = typeof tblStaff.$inferInsert;

export type LoanRequest = typeof tblLoanRequests.$inferSelect;
export type InsertLoanRequest = typeof tblLoanRequests.$inferInsert;

export type LoanHistory = typeof tblLoanHistory.$inferSelect;
export type InsertLoanHistory = typeof tblLoanHistory.$inferInsert;

// Enhanced loan request with related data
export type LoanRequestWithDetails = LoanRequest & {
  book_title?: string | null;
  book_isbn?: string | null;
  employee_name?: string | null;
  employee_department?: string | null;
  approver_name?: string | null;
};

export type BukuWithDetails = Buku & {
  kategori_nama?: string | null;
  lokasi_nama?: string | null;
  department?: string | null;
  file_type?: string | null;
};

export const insertStaffSchema = createInsertSchema(tblStaff).pick({
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
  photo: true,
});

export type InsertStaffData = z.infer<typeof insertStaffSchema>;