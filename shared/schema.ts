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

export const tblLokasi = mysqlTable("tbl_lokasi", {
  id_lokasi: int("id_lokasi").primaryKey().autoincrement(),
  nama_lokasi: varchar("nama_lokasi", { length: 255 }).notNull(),
  deskripsi: varchar("deskripsi", { length: 255 }),
  kapasitas: int("kapasitas"),
});

export const tblBuku = mysqlTable("tbl_buku", {
  id_buku: int("id_buku").primaryKey().autoincrement(),
  buku_id: varchar("buku_id", { length: 255 }),
  id_kategori: int("id_kategori"),
  id_lokasi: int("id_lokasi"),
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
  tersedia: int("tersedia"),
  department: varchar("department", { length: 255 }),
  file_type: varchar("file_type", { length: 50 }),
});

export const tblUserActivity = mysqlTable("tbl_user_activity", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  activity_type: varchar("activity_type", { length: 50 }).notNull(), // 'login', 'logout', 'view', etc.
  activity_date: timestamp("activity_date").defaultNow().notNull(),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
});

export const insertUserActivitySchema = createInsertSchema(tblUserActivity).pick({
  user_id: true,
  activity_type: true,
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

export type BukuWithDetails = Buku & {
  kategori_nama?: string | null;
  lokasi_nama?: string | null;
  department?: string | null;
  file_type?: string | null;
};