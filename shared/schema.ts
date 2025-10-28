import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
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

export type BukuWithDetails = Buku & {
  kategori_nama?: string | null;
  lokasi_nama?: string | null;
  department?: string | null;
  file_type?: string | null;
};