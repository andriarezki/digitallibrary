import { db } from "./db";
import { 
  tblLogin, 
  tblBuku, 
  tblKategori, 
  tblLokasi, 
  tblUserActivity, 
  tblPdfViews, 
  tblSiteVisitors,
  tblEmployees,
  tblStaff,
  tblLoanRequests,
  tblLoanHistory,
  type Login, 
  type Buku, 
  type BukuWithDetails, 
  type Kategori, 
  type Lokasi, 
  type InsertBuku, 
  type UserActivity, 
  type PdfView, 
  type SiteVisitor, 
  type InsertPdfView, 
  type InsertSiteVisitor,
  type Employee,
  type InsertEmployee,
  type Staff,
  type InsertStaff,
  type LoanRequest,
  type InsertLoanRequest,
  type LoanRequestWithDetails,
  type LoanHistory,
  type InsertLoanHistory
} from "@shared/schema";
import { eq, like, or, desc, asc, count, sql, and, isNotNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { addDays } from "date-fns";

// IP-based visitor tracking (in-memory, resets on server restart)
const siteVisitorIPs = new Set<string>();
const pdfViewIPs = new Set<string>();

// Simple in-memory cache for dashboard data (5-minute expiry)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_DURATION });
}

export function incrementSiteVisitor(ip: string) {
  siteVisitorIPs.add(ip);
}
export function incrementPdfView(ip: string) {
  pdfViewIPs.add(ip);
}
export function getVisitorStats() {
  return { 
    siteVisitorCount: siteVisitorIPs.size, 
    pdfViewCount: pdfViewIPs.size 
  };
}

// Database-based PDF view tracking
export async function recordPdfView(bookId: number, categoryId: number, ip: string, userAgent?: string, userId?: number) {
  try {
    await db.insert(tblPdfViews).values({
      book_id: bookId,
      category_id: categoryId,
      ip_address: ip,
      user_agent: userAgent,
      user_id: userId
    });
  } catch (error) {
    console.error('Error recording PDF view:', error);
  }
}

// Database-based site visitor tracking
export async function recordSiteVisitor(ip: string, userAgent?: string) {
  try {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Look for an existing record for this IP within the current month
    const existingVisitor = await db
      .select()
      .from(tblSiteVisitors)
      .where(
        and(
          eq(tblSiteVisitors.ip_address, ip),
          sql`DATE_FORMAT(${tblSiteVisitors.first_visit}, '%Y-%m') = ${currentYearMonth}`
        )
      )
      .limit(1);

    if (existingVisitor.length > 0) {
      // Update existing visitor record for this month
      await db
        .update(tblSiteVisitors)
        .set({
          last_visit: now,
          visit_count: sql`visit_count + 1`
        })
        .where(eq(tblSiteVisitors.id, existingVisitor[0].id));
    } else {
      // Insert a fresh visitor record for the new month
      await db.insert(tblSiteVisitors).values({
        ip_address: ip,
        user_agent: userAgent,
        first_visit: now,
        last_visit: now
      });
    }
  } catch (error) {
    console.error('Error recording site visitor:', error);
  }
}

export interface IStorage {
  // Auth methods
  getUserByCredentials(username: string, password: string): Promise<Login | undefined>;
  getUserById(id: number): Promise<Login | undefined>;

  // Users methods
  getUsers(page: number, limit: number, search?: string): Promise<{ users: Login[], total: number }>;
  createUser(user: Partial<Login>): Promise<Login>;
  updateUser(id: number, user: Partial<Login>): Promise<Login | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Books methods
  getBooks(page: number, limit: number, search?: string, categoryId?: number, lokasiId?: number, departmentFilter?: string, yearFilter?: string): Promise<{ books: BukuWithDetails[], total: number }>;
  getAvailableBooks(search?: string, limit?: number): Promise<{ books: BukuWithDetails[]; total: number }>;
  getBookById(id: number): Promise<BukuWithDetails | undefined>;
  getBookByPdfFilename(filename: string): Promise<BukuWithDetails | undefined>;
  createBook(book: InsertBuku): Promise<Buku>;
  updateBook(id: number, book: Partial<InsertBuku>): Promise<Buku | undefined>;
  deleteBook(id: number): Promise<boolean>;
  getAvailableYears(): Promise<string[]>;

  // Categories methods
  getCategories(): Promise<Kategori[]>;
  getCategoryById(id: number): Promise<Kategori | undefined>;
  createCategory(data: { nama_kategori: string }): Promise<Kategori>;
  ensurePredefinedCategories(): Promise<void>;
  cleanupCategories(): Promise<void>;
  updateCategory(id: number, data: { nama_kategori: string }): Promise<void>;
  deleteCategory(id: number): Promise<boolean>;
  getTopCategories(limit: number): Promise<Array<{ id: number; name: string; count: number }>>;

  // Locations methods
  getLocations(): Promise<Lokasi[]>;
  getLocationById(id: number): Promise<Lokasi | undefined>;
  createLocation(data: { nama_lokasi: string; deskripsi: string | null; kapasitas: number | null }): Promise<Lokasi>;
  updateLocation(id: number, data: { nama_lokasi: string; deskripsi: string | null; kapasitas: number | null }): Promise<void>;
  deleteLocation(id: number): Promise<boolean>;

  // Departments methods
  getDepartments(): Promise<Array<{ department: string }>>;
  getDocumentsByDepartment(): Promise<Array<{ department: string; count: number }>>;
  getMostReadByCategory(): Promise<Array<{ category: string; views: number }>>;
  getPdfTrackingDebugData(): Promise<any>;
  logUserActivity(userId: number, activityType: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getMonthlyUserActivity(): Promise<Array<{ month: string; activeUsers: number }>>;
  getWeeklyBooksAdded(): Promise<Array<{ week: string; booksAdded: number }>>;

  // Analytics methods (database-based)
  getDatabaseVisitorStats(): Promise<{ siteVisitorCount: number; pdfViewCount: number; uniquePdfViewers: number }>;
  getTopCategoriesByViews(): Promise<Array<{ category: string; views: number }>>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    onLoan: number;
    categories: number;
    siteVisitorCount: number;
    pdfViewCount: number;
  }>;

  // ===== LOANS SYSTEM METHODS =====
  
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployeeByNik(nik: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  importEmployees(employees: InsertEmployee[]): Promise<{ success: number; errors: string[] }>;

  // Loan request methods
  createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest>;
  getLoanRequests(filters?: {
    status?: string;
    employeeNik?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: LoanRequestWithDetails[]; total: number }>;
  getLoanRequestById(id: number): Promise<LoanRequestWithDetails | undefined>;
  approveLoanRequest(id: number, adminId: number, notes?: string): Promise<boolean>;
  rejectLoanRequest(id: number, adminId: number, notes?: string): Promise<boolean>;
  markBookAsLoaned(requestId: number, dueDate: Date): Promise<boolean>;
  returnBook(requestId: number, returnNotes?: string): Promise<boolean>;
  returnLoanRequest(id: number, adminId: number): Promise<boolean>;
  getLoanRequestStats(): Promise<{ pending: number; active: number; completed: number; overdue: number }>;
  getUserLoanRequestStats(userId: number): Promise<{ pending: number; approved: number; returned: number }>;
  getUserLoanRequestStatsByNik(employeeNik: string): Promise<{ pending: number; approved: number; returned: number }>;
  getMonthlyLoanBorrowed(): Promise<Array<{ month: string; borrowed: number }>>;

  // Loan history methods
  getLoanHistory(requestId: number): Promise<LoanHistory[]>;
  logLoanAction(
    requestId: number,
    action: string,
    performedBy?: number,
    notes?: string,
    oldStatus?: string,
    newStatus?: string
  ): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserByCredentials(username: string, password: string): Promise<Login | undefined> {
    try {
      console.log(`Attempting login with username: ${username}, password: ${password}`);
      
      const results = await db
        .select()
        .from(tblLogin)
        .where(eq(tblLogin.user, username))
        .limit(1);
      
      console.log(`Database query returned ${results.length} results`);
      if (results.length > 0) {
        console.log(`Found user: ${results[0].user}, stored password: ${results[0].pass}`);
      }
      
      const user = results[0];
      if (user) {
        // Check if password is hashed (starts with $2b$) or plain text
        const isPasswordValid = user.pass.startsWith('$2b$') 
          ? await bcrypt.compare(password, user.pass)
          : user.pass === password;
          
        if (isPasswordValid) {
          console.log('Password match successful');
          return user;
        }
      }
      console.log('Password mismatch or user not found');
      return undefined;
    } catch (error) {
      console.error('Database error during login:', error);
      return undefined;
    }
  }

  async getUserById(id: number): Promise<Login | undefined> {
    const results = await db
      .select()
      .from(tblLogin)
      .where(eq(tblLogin.id_login, id))
      .limit(1);
    
    return results[0];
  }

  async getUsers(page: number, limit: number, search?: string): Promise<{ users: Login[], total: number }> {
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

    const usersQuery = db
      .select()
      .from(tblLogin)
      .orderBy(desc(tblLogin.id_login))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: count() })
      .from(tblLogin);

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

  async createUser(userData: Partial<Login>): Promise<Login> {
    const hashedPassword = userData.pass ? await bcrypt.hash(userData.pass, 10) : '';
    
    const insertData = {
      user: userData.user || '',
      pass: hashedPassword,
      level: userData.level || 'user',
      nama: userData.nama || '',
      tempat_lahir: userData.tempat_lahir || '',
      tgl_lahir: userData.tgl_lahir || '',
      jenkel: userData.jenkel || '',
      alamat: userData.alamat || '',
      telepon: userData.telepon || '',
      email: userData.email || '',
      tgl_bergabung: new Date().toISOString().split('T')[0],
      foto: userData.foto || ''
    };

    const result = await db.insert(tblLogin).values([insertData]);
    const users = await db.select().from(tblLogin).orderBy(desc(tblLogin.id_login)).limit(1);
    return users[0];
  }

  async updateUser(id: number, userData: Partial<Login>): Promise<Login | undefined> {
    const updateData = { ...userData };
    
    if (userData.pass) {
      updateData.pass = await bcrypt.hash(userData.pass, 10);
    }

    await db.update(tblLogin)
      .set(updateData)
      .where(eq(tblLogin.id_login, id));
    
    return this.getUserById(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(tblLogin)
      .where(eq(tblLogin.id_login, id));
    
    return true; // Assume success if no error thrown
  }

  async getBooks(page: number, limit: number, search?: string, categoryId?: number, lokasiId?: number, departmentFilter?: string, yearFilter?: string): Promise<{ books: BukuWithDetails[], total: number }> {
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

    const availabilityExpression = sql<number>`CASE 
      WHEN ${tblBuku.tersedia} = 1 AND NOT EXISTS (
        SELECT 1 FROM ${tblLoanRequests}
        WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
          AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
      ) THEN 1 ELSE 0 END`;

    const booksQuery = db
      .select({
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
        file_type: tblBuku.file_type, // Restored - column exists on server
        kategori_nama: tblKategori.nama_kategori,
        lokasi_nama: tblLokasi.nama_lokasi,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
      .orderBy(desc(tblBuku.id_buku))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: count() })
      .from(tblBuku);

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

  async getAvailableBooks(search?: string, limit: number = 20): Promise<{ books: BukuWithDetails[]; total: number }> {
    const availabilityCondition = sql`(${tblBuku.tersedia} = 1 AND NOT EXISTS (
      SELECT 1 FROM ${tblLoanRequests}
      WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
        AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
    ))`;
    const bookCategoryCondition = eq(tblKategori.nama_kategori, 'Book');
    const likeQuery = search ? `%${search}%` : undefined;
    const searchCondition = likeQuery
      ? sql`(${tblBuku.title} LIKE ${likeQuery} OR ${tblBuku.pengarang} LIKE ${likeQuery} OR ${tblBuku.penerbit} LIKE ${likeQuery} OR ${tblBuku.isbn} LIKE ${likeQuery})`
      : undefined;

    const conditions: Array<any> = [availabilityCondition, bookCategoryCondition];
    if (searchCondition) {
      conditions.push(searchCondition);
    }

    const combinedCondition = and(...conditions);

    const booksQuery = db
      .select({
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
        lokasi_nama: tblLokasi.nama_lokasi,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
      .where(combinedCondition)
      .orderBy(asc(tblBuku.title))
      .limit(limit);

    const countQuery = db
      .select({ count: count() })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .where(combinedCondition);

    const [books, totalResult] = await Promise.all([booksQuery, countQuery]);
    const total = totalResult[0]?.count ?? 0;

    return {
      books,
      total: Number(total)
    };
  }

  async getBookById(id: number): Promise<BukuWithDetails | undefined> {
    const results = await db
      .select({
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
        lokasi_nama: tblLokasi.nama_lokasi,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
      .where(eq(tblBuku.id_buku, id))
      .limit(1);

    return results[0];
  }

  async getBookByPdfFilename(filename: string): Promise<BukuWithDetails | undefined> {
    const results = await db
      .select({
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
        lokasi_nama: tblLokasi.nama_lokasi,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
      .where(eq(tblBuku.lampiran, filename))
      .limit(1);

    return results[0];
  }

  async createBook(book: InsertBuku): Promise<Buku> {
    const result = await db.insert(tblBuku).values(book);
    const insertedId = result[0].insertId;
    const newBook = await db
      .select()
      .from(tblBuku)
      .where(eq(tblBuku.id_buku, insertedId as number))
      .limit(1);
    
    return newBook[0];
  }

  async updateBook(id: number, book: Partial<InsertBuku>): Promise<Buku | undefined> {
    await db.update(tblBuku).set(book).where(eq(tblBuku.id_buku, id));
    
    const updated = await db
      .select()
      .from(tblBuku)
      .where(eq(tblBuku.id_buku, id))
      .limit(1);
    
    return updated[0];
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(tblBuku).where(eq(tblBuku.id_buku, id));
    return result[0].affectedRows > 0;
  }

  async getAvailableYears(): Promise<string[]> {
    const results = await db
      .selectDistinct({ thn_buku: tblBuku.thn_buku })
      .from(tblBuku)
      .where(isNotNull(tblBuku.thn_buku))
      .orderBy(desc(tblBuku.thn_buku));
    
    return results.map(r => r.thn_buku).filter((year): year is string => year !== null && year.trim() !== '');
  }

  async getCategories(): Promise<Kategori[]> {
    return await db.select().from(tblKategori).orderBy(asc(tblKategori.nama_kategori));
  }

  async getCategoryById(id: number): Promise<Kategori | undefined> {
    const results = await db
      .select()
      .from(tblKategori)
      .where(eq(tblKategori.id_kategori, id))
      .limit(1);
    
    return results[0];
  }

  async getTopCategories(limit: number): Promise<Array<{ id: number; name: string; count: number }>> {
    const cacheKey = `top_categories_${limit}`;
    const cached = getCachedData<Array<{ id: number; name: string; count: number }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await db
      .select({
        id: tblKategori.id_kategori,
        name: tblKategori.nama_kategori,
        count: count(tblBuku.id_buku)
      })
      .from(tblKategori)
      .leftJoin(tblBuku, eq(tblKategori.id_kategori, tblBuku.id_kategori))
      .groupBy(tblKategori.id_kategori, tblKategori.nama_kategori)
      .orderBy(desc(count(tblBuku.id_buku)))
      .limit(limit);

    setCachedData(cacheKey, results);
    return results;
  }

  async updateCategory(id: number, data: { nama_kategori: string }): Promise<void> {
    await db.update(tblKategori)
      .set({ nama_kategori: data.nama_kategori })
      .where(eq(tblKategori.id_kategori, id));
  }

  async createCategory(data: { nama_kategori: string }): Promise<Kategori> {
    const result = await db.insert(tblKategori)
      .values({ nama_kategori: data.nama_kategori });
    
    const newCategory = await db
      .select()
      .from(tblKategori)
      .where(eq(tblKategori.id_kategori, result[0].insertId))
      .limit(1);
    
    return newCategory[0];
  }

  async ensurePredefinedCategories(): Promise<void> {
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

    // Get existing categories
    const existingCategories = await this.getCategories();
    const existingNames = new Set(existingCategories.map(cat => cat.nama_kategori.toLowerCase()));

    // Create missing predefined categories
    for (const categoryName of predefinedCategories) {
      if (!existingNames.has(categoryName.toLowerCase())) {
        await this.createCategory({ nama_kategori: categoryName });
        console.log(`Created predefined category: ${categoryName}`);
      }
    }
  }

  async cleanupCategories(): Promise<void> {
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
      // Create an "Uncategorized" category for books that lose their category
      const uncategorizedCategory = await this.createCategory({ nama_kategori: "Uncategorized" });
      
      // Get categories that will be deleted
      const categoriesToDelete = await db.select()
        .from(tblKategori)
        .where(sql`nama_kategori NOT IN (${predefinedCategories.map(cat => `'${cat}'`).join(',')})`);

      // Update books using categories that will be deleted
      for (const category of categoriesToDelete) {
        if (category.nama_kategori !== "Uncategorized") {
          await db.update(tblBuku)
            .set({ id_kategori: uncategorizedCategory.id_kategori })
            .where(eq(tblBuku.id_kategori, category.id_kategori));
          
          console.log(`Moved books from category "${category.nama_kategori}" to "Uncategorized"`);
        }
      }

      // Delete all non-predefined categories (except Uncategorized)
      await db.delete(tblKategori)
        .where(sql`nama_kategori NOT IN (${[...predefinedCategories, "Uncategorized"].map(cat => `'${cat}'`).join(',')})`);

      // Ensure all predefined categories exist
      await this.ensurePredefinedCategories();
      
      console.log('Categories cleanup completed - only predefined categories remain');
    } catch (error) {
      console.error('Error during category cleanup:', error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(tblKategori)
      .where(eq(tblKategori.id_kategori, id));
    return result[0].affectedRows > 0;
  }

  async getLocations(): Promise<Lokasi[]> {
    return await db.select().from(tblLokasi).orderBy(asc(tblLokasi.nama_lokasi));
  }

  async getLocationById(id: number): Promise<Lokasi | undefined> {
    const results = await db
      .select()
      .from(tblLokasi)
      .where(eq(tblLokasi.id_lokasi, id))
      .limit(1);
    
    return results[0];
  }

  async createLocation(data: { nama_lokasi: string; deskripsi: string | null; kapasitas: number | null }): Promise<Lokasi> {
    const result = await db.insert(tblLokasi)
      .values({ 
        nama_lokasi: data.nama_lokasi,
        deskripsi: data.deskripsi,
        kapasitas: data.kapasitas
      });
    
    const newLocation = await db
      .select()
      .from(tblLokasi)
      .where(eq(tblLokasi.id_lokasi, result[0].insertId))
      .limit(1);
    
    return newLocation[0];
  }

  async updateLocation(id: number, data: { nama_lokasi: string; deskripsi: string | null; kapasitas: number | null }): Promise<void> {
    await db.update(tblLokasi)
      .set({ 
        nama_lokasi: data.nama_lokasi,
        deskripsi: data.deskripsi,
        kapasitas: data.kapasitas
      })
      .where(eq(tblLokasi.id_lokasi, id));
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(tblLokasi)
      .where(eq(tblLokasi.id_lokasi, id));
    return result[0].affectedRows > 0;
  }

  async getDashboardStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    onLoan: number;
    categories: number;
    siteVisitorCount: number;
    pdfViewCount: number;
  }> {
    const cacheKey = 'dashboard_stats';
    const cached = getCachedData<{
      totalBooks: number;
      availableBooks: number;
      onLoan: number;
      categories: number;
      siteVisitorCount: number;
      pdfViewCount: number;
    }>(cacheKey);
    if (cached) {
      // Update visitor counts in real-time
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
      db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, 'approved'))
    ]);

    const totalBooks = booksCount[0].count;
    const availableBooks = availableCount[0].count;
    const onLoan = activeLoanCount[0].count; // Use actual approved loans count
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

  async getDepartments(): Promise<Array<{ department: string }>> {
    const results = await db
      .selectDistinct({ department: tblBuku.department })
      .from(tblBuku)
      .where(sql`${tblBuku.department} IS NOT NULL AND ${tblBuku.department} != ''`)
      .orderBy(asc(tblBuku.department));
    
    return results.filter(r => r.department) as Array<{ department: string }>;
  }

  async getDocumentsByDepartment(): Promise<Array<{ department: string; count: number }>> {
    const results = await db
      .select({
        department: tblBuku.department,
        count: count(tblBuku.id_buku),
      })
      .from(tblBuku)
      .where(sql`${tblBuku.department} IS NOT NULL AND ${tblBuku.department} != ''`)
      .groupBy(tblBuku.department)
      .orderBy(desc(count(tblBuku.id_buku)));
    
    return results.filter(r => r.department) as Array<{ department: string; count: number }>;
  }

  async getMostReadByCategory(): Promise<Array<{ category: string; views: number }>> {
    // Use actual PDF view data from database if available, otherwise fall back to book count
    try {
      const pdfViewResults = await db
        .select({
          category: tblKategori.nama_kategori,
          views: count(tblPdfViews.id),
        })
        .from(tblPdfViews)
        .innerJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori))
        .groupBy(tblKategori.id_kategori, tblKategori.nama_kategori)
        .orderBy(desc(count(tblPdfViews.id)))
        .limit(5);
      
      // If we have PDF view data, use it
      if (pdfViewResults.length > 0) {
        return pdfViewResults.filter(r => r.category) as Array<{ category: string; views: number }>;
      }
    } catch (error) {
      console.log('PDF views table not available, falling back to book count');
    }

    // Fallback to book count per category as proxy for "most read"
    const results = await db
      .select({
        category: tblKategori.nama_kategori,
        views: count(tblBuku.id_buku),
      })
      .from(tblKategori)
      .leftJoin(tblBuku, eq(tblKategori.id_kategori, tblBuku.id_kategori))
      .groupBy(tblKategori.id_kategori, tblKategori.nama_kategori)
      .orderBy(desc(count(tblBuku.id_buku)))
      .limit(5);
    
    return results.filter(r => r.category) as Array<{ category: string; views: number }>;
  }

  async getPdfTrackingDebugData(): Promise<any> {
    try {
      // Get recent PDF views with category info
      const recentViews = await db
        .select({
          id: tblPdfViews.id,
          book_id: tblPdfViews.book_id,
          category_id: tblPdfViews.category_id,
          category_name: tblKategori.nama_kategori,
          book_title: tblBuku.title,
          viewed_at: tblPdfViews.view_date,
          ip_address: tblPdfViews.ip_address
        })
        .from(tblPdfViews)
        .leftJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori))
        .leftJoin(tblBuku, eq(tblPdfViews.book_id, tblBuku.id_buku))
        .orderBy(desc(tblPdfViews.view_date))
        .limit(20);

      // Get category distribution in PDF views
      const categoryDistribution = await db
        .select({
          category: tblKategori.nama_kategori,
          view_count: count(tblPdfViews.id)
        })
        .from(tblPdfViews)
        .leftJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori))
        .groupBy(tblPdfViews.category_id, tblKategori.nama_kategori)
        .orderBy(desc(count(tblPdfViews.id)));

      // Get book category distribution
      const bookCategoryDistribution = await db
        .select({
          category: tblKategori.nama_kategori,
          book_count: count(tblBuku.id_buku)
        })
        .from(tblBuku)
        .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
        .groupBy(tblBuku.id_kategori, tblKategori.nama_kategori)
        .orderBy(desc(count(tblBuku.id_buku)));

      return {
        recentViews,
        categoryDistribution,
        bookCategoryDistribution,
        totalPdfViews: recentViews.length > 0 ? await db.select({ count: count() }).from(tblPdfViews).then(r => r[0].count) : 0
      };
    } catch (error) {
      console.error('Error getting PDF tracking debug data:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async logUserActivity(userId: number, activityType: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await db.insert(tblUserActivity).values({
      user_id: userId,
      activity_type: activityType,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async getMonthlyUserActivity(): Promise<Array<{ month: string; activeUsers: number }>> {
    try {
      // Check if site visitors table exists (IP-based tracking)
      const tableCheck = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'tbl_site_visitors'
      `);

      // If table doesn't exist, return sample data
      if (!tableCheck[0] || (tableCheck[0] as any).count === 0) {
        console.log('Site visitors table not found, returning sample data');
        return [
          { month: 'May', activeUsers: 15 },
          { month: 'Jun', activeUsers: 28 },
          { month: 'Jul', activeUsers: 42 },
          { month: 'Aug', activeUsers: 35 },
          { month: 'Sep', activeUsers: 58 },
          { month: 'Oct', activeUsers: 67 }
        ];
      }

      // Get unique IP visitors for the current month plus the previous five months
      const currentDate = new Date();
      const sixMonthWindowStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

      const results = await db
        .select({
          month: sql<string>`DATE_FORMAT(first_visit, '%Y-%m')`,
          activeUsers: sql<number>`COUNT(DISTINCT ip_address)` // Count unique IP addresses instead of user_id
        })
        .from(tblSiteVisitors)
        .where(sql`first_visit >= ${sixMonthWindowStart.toISOString().split('T')[0]}`)
        .groupBy(sql`DATE_FORMAT(first_visit, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(first_visit, '%Y-%m')`);

      // Convert to month names and ensure we have data for the last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData: Array<{ month: string; activeUsers: number }> = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = monthNames[date.getMonth()];
        
        const result = results.find(r => r.month === yearMonth);
        monthlyData.push({
          month: monthName,
          activeUsers: result ? result.activeUsers : 0
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly visitor activity:', error);
      // Return sample data if there's an error
      return [
        { month: 'May', activeUsers: 15 },
        { month: 'Jun', activeUsers: 28 },
        { month: 'Jul', activeUsers: 42 },
        { month: 'Aug', activeUsers: 35 },
        { month: 'Sep', activeUsers: 58 },
        { month: 'Oct', activeUsers: 67 }
      ];
    }
  }

  async getWeeklyBooksAdded(): Promise<Array<{ week: string; booksAdded: number }>> {
    // Get books added by category for the last 4 weeks from actual database dates
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28); // 4 weeks = 28 days

    try {
      const results = await db
        .select({
          categoryName: sql<string>`COALESCE(${tblKategori.nama_kategori}, 'Uncategorized')`,
          booksAdded: sql<number>`COUNT(*)`,
          latestDate: sql<string>`MAX(STR_TO_DATE(${tblBuku.tgl_masuk}, '%Y-%m-%d'))`
        })
        .from(tblBuku)
        .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
        .where(sql`
          ${tblBuku.tgl_masuk} IS NOT NULL 
          AND ${tblBuku.tgl_masuk} != ''
          AND ${tblBuku.tgl_masuk} != '0000-00-00'
          AND STR_TO_DATE(${tblBuku.tgl_masuk}, '%Y-%m-%d') >= ${fourWeeksAgo}
        `)
        .groupBy(sql`${tblKategori.id_kategori}, ${tblKategori.nama_kategori}`)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(8); // Top 8 categories by book count

      // If no recent data, get top categories from all time
      if (results.length === 0) {
        const fallbackResults = await db
          .select({
            categoryName: sql<string>`COALESCE(${tblKategori.nama_kategori}, 'Uncategorized')`,
            booksAdded: sql<number>`COUNT(*)`
          })
          .from(tblBuku)
          .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
          .where(sql`${tblBuku.tgl_masuk} IS NOT NULL AND ${tblBuku.tgl_masuk} != '' AND ${tblBuku.tgl_masuk} != '0000-00-00'`)
          .groupBy(sql`${tblKategori.id_kategori}, ${tblKategori.nama_kategori}`)
          .orderBy(sql`COUNT(*) DESC`)
          .limit(8);

        return fallbackResults.map(result => ({
          week: result.categoryName.length > 15 ? result.categoryName.substring(0, 15) + '...' : result.categoryName,
          booksAdded: result.booksAdded
        }));
      }

      return results.map(result => ({
        week: result.categoryName.length > 15 ? result.categoryName.substring(0, 15) + '...' : result.categoryName,
        booksAdded: result.booksAdded
      }));
    } catch (error) {
      console.error('Error fetching weekly books data:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  async getDatabaseVisitorStats(): Promise<{ siteVisitorCount: number; pdfViewCount: number; uniquePdfViewers: number }> {
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
      console.error('Error fetching database visitor stats:', error);
      return { siteVisitorCount: 0, pdfViewCount: 0, uniquePdfViewers: 0 };
    }
  }

  async getTopCategoriesByViews(): Promise<Array<{ category: string; views: number }>> {
    try {
      const results = await db
        .select({
          category: tblKategori.nama_kategori,
          views: count(tblPdfViews.id),
        })
        .from(tblPdfViews)
        .innerJoin(tblKategori, eq(tblPdfViews.category_id, tblKategori.id_kategori))
        .groupBy(tblKategori.id_kategori, tblKategori.nama_kategori)
        .orderBy(desc(count(tblPdfViews.id)))
        .limit(10);
      
      return results.filter(r => r.category) as Array<{ category: string; views: number }>;
    } catch (error) {
      console.error('Error fetching top categories by views:', error);
      return [];
    }
  }

  // ===== LOANS SYSTEM IMPLEMENTATIONS =====

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(tblEmployees).where(eq(tblEmployees.status, 'active')).orderBy(tblEmployees.name);
  }

  async getEmployeeByNik(nik: string): Promise<Employee | undefined> {
    const results = await db.select().from(tblEmployees).where(eq(tblEmployees.nik, nik)).limit(1);
    return results[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const results = await db.insert(tblEmployees).values(employee);
    const insertedId = results[0].insertId;
    const newEmployee = await db.select().from(tblEmployees).where(eq(tblEmployees.id, insertedId)).limit(1);
    return newEmployee[0];
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    await db.update(tblEmployees).set(employee).where(eq(tblEmployees.id, id));
    const updated = await db.select().from(tblEmployees).where(eq(tblEmployees.id, id)).limit(1);
    return updated[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      await db.update(tblEmployees).set({ status: 'inactive' }).where(eq(tblEmployees.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }

  async importEmployees(employees: InsertEmployee[]): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    for (const employee of employees) {
      try {
        await db.insert(tblEmployees).values(employee).onDuplicateKeyUpdate({
          set: {
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            position: employee.position,
            updated_at: new Date()
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
  async createLoanRequest(request: InsertLoanRequest): Promise<LoanRequest> {
    try {
      // Generate request ID if not provided
      if (!request.request_id) {
        const requestCount = await db.select({ count: count() }).from(tblLoanRequests);
        request.request_id = `LR-${String(requestCount[0].count + 1).padStart(6, '0')}`;
      }

      const results = await db.insert(tblLoanRequests).values(request);
      const insertedId = results[0].insertId;
      
      // Log the request submission
      await this.logLoanAction(insertedId, 'submitted', undefined, 'Loan request submitted', undefined, 'pending');
      
      const newRequest = await db.select().from(tblLoanRequests).where(eq(tblLoanRequests.id, insertedId)).limit(1);
      return newRequest[0];
    } catch (error) {
      console.error('Error creating loan request:', error);
      throw new Error('Failed to create loan request');
    }
  }

  async getLoanRequests(filters: {
    status?: string;
    employeeNik?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ requests: LoanRequestWithDetails[]; total: number }> {
    const { status, employeeNik, page = 1, limit = 25 } = filters;
    
    try {
      let query = db
        .select({
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
          approver_name: tblLogin.nama,
        })
        .from(tblLoanRequests)
        .leftJoin(tblBuku, eq(tblLoanRequests.id_buku, tblBuku.id_buku))
        .leftJoin(tblEmployees, eq(tblLoanRequests.employee_nik, tblEmployees.nik))
        .leftJoin(tblLogin, eq(tblLoanRequests.approved_by, tblLogin.id_login));

      // Apply filters
      const conditions = [];
      if (status) {
        conditions.push(eq(tblLoanRequests.status, status as any));
      }
      if (employeeNik) {
        conditions.push(eq(tblLoanRequests.employee_nik, employeeNik));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Get total count
      const totalQuery = db.select({ count: count() }).from(tblLoanRequests);
      if (conditions.length > 0) {
        totalQuery.where(and(...conditions));
      }
      const totalResult = await totalQuery;
      const total = totalResult[0].count;

      // Get paginated results
      const offset = (page - 1) * limit;
      const requests = await query
        .orderBy(desc(tblLoanRequests.request_date))
        .limit(limit)
        .offset(offset);

      return { requests, total };
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      throw new Error('Failed to fetch loan requests');
    }
  }

  async getLoanRequestById(id: number): Promise<LoanRequestWithDetails | undefined> {
    try {
      console.log('getLoanRequestById called with id:', id, typeof id);
      
      if (isNaN(id) || !Number.isFinite(id)) {
        console.error('Invalid ID passed to getLoanRequestById:', id);
        throw new Error(`Invalid ID: ${id}`);
      }
      
      const results = await db
        .select({
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
          approver_name: tblLogin.nama,
        })
        .from(tblLoanRequests)
        .leftJoin(tblBuku, eq(tblLoanRequests.id_buku, tblBuku.id_buku))
        .leftJoin(tblEmployees, eq(tblLoanRequests.employee_nik, tblEmployees.nik))
        .leftJoin(tblLogin, eq(tblLoanRequests.approved_by, tblLogin.id_login))
        .where(eq(tblLoanRequests.id, id))
        .limit(1);

      return results[0];
    } catch (error) {
      console.error('Error fetching loan request by ID:', error);
      throw new Error('Failed to fetch loan request');
    }
  }

  async approveLoanRequest(id: number, adminId: number, notes?: string): Promise<boolean> {
    try {
      const currentRequest = await this.getLoanRequestById(id);
      if (!currentRequest) {
        throw new Error('Loan request not found');
      }

      const approvalDate = new Date();
      const autoDueDate = addDays(approvalDate, 14);

      await db.update(tblLoanRequests).set({
        status: 'approved',
        approved_by: adminId,
        approval_date: approvalDate,
        approval_notes: notes,
        due_date: autoDueDate,
      }).where(eq(tblLoanRequests.id, id));

      // Log the approval action
      const logNotes = notes
        ? `${notes} (Due date auto-set to ${autoDueDate.toISOString().split('T')[0]})`
        : `Due date auto-set to ${autoDueDate.toISOString().split('T')[0]}`;

      await this.logLoanAction(id, 'approved', adminId, logNotes, 'pending', 'approved');

      // Update document repository (book) status to not available when approved
      try {
        if (currentRequest.id_buku) {
          await db.update(tblBuku).set({
            tersedia: 0 // mark as not available in repository
          }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
        }
      } catch (buchErr) {
        console.error('Error updating book availability on approve:', buchErr);
      }

      // Clear dashboard stats cache so it reflects the new loan count
      cache.delete('dashboard_stats');

      return true;
    } catch (error) {
      console.error('Error approving loan request:', error);
      return false;
    }
  }

  async rejectLoanRequest(id: number, adminId: number, notes?: string): Promise<boolean> {
    try {
      const currentRequest = await this.getLoanRequestById(id);
      if (!currentRequest) {
        throw new Error('Loan request not found');
      }

      await db.update(tblLoanRequests).set({
        status: 'rejected',
        approved_by: adminId,
        approval_date: new Date(),
        approval_notes: notes,
      }).where(eq(tblLoanRequests.id, id));

      // Log the rejection action
      await this.logLoanAction(id, 'rejected', adminId, notes, 'pending', 'rejected');

      // Clear dashboard stats cache
      cache.delete('dashboard_stats');

      return true;
    } catch (error) {
      console.error('Error rejecting loan request:', error);
      return false;
    }
  }

  async markBookAsLoaned(requestId: number, dueDate: Date): Promise<boolean> {
    try {
      const currentRequest = await this.getLoanRequestById(requestId);
      if (!currentRequest || currentRequest.status !== 'approved') {
        throw new Error('Invalid loan request for loaning');
      }

      // Update loan request status
      await db.update(tblLoanRequests).set({
        status: 'on_loan',
        loan_date: new Date(),
        due_date: dueDate,
      }).where(eq(tblLoanRequests.id, requestId));

      // Update book availability
      await db.update(tblBuku).set({
        tersedia: 0 // Mark as not available
      }).where(eq(tblBuku.id_buku, currentRequest.id_buku));

      // Log the loaning action
      await this.logLoanAction(requestId, 'loaned', currentRequest.approved_by || undefined, 'Book handed out to borrower', 'approved', 'on_loan');

      return true;
    } catch (error) {
      console.error('Error marking book as loaned:', error);
      return false;
    }
  }

  async returnBook(requestId: number, returnNotes?: string): Promise<boolean> {
    try {
      const currentRequest = await this.getLoanRequestById(requestId);
      if (!currentRequest || currentRequest.status !== 'on_loan') {
        throw new Error('Invalid loan request for return');
      }

      // Update loan request status
      await db.update(tblLoanRequests).set({
        status: 'returned',
        return_date: new Date(),
        return_notes: returnNotes,
      }).where(eq(tblLoanRequests.id, requestId));

      // Update book availability
      await db.update(tblBuku).set({
        tersedia: 1 // Mark as available again
      }).where(eq(tblBuku.id_buku, currentRequest.id_buku));

      // Log the return action
      await this.logLoanAction(requestId, 'returned', undefined, returnNotes, 'on_loan', 'returned');

      return true;
    } catch (error) {
      console.error('Error returning book:', error);
      return false;
    }
  }

  // Loan history methods
  async getLoanHistory(requestId: number): Promise<LoanHistory[]> {
    try {
      return await db
        .select()
        .from(tblLoanHistory)
        .where(eq(tblLoanHistory.loan_request_id, requestId))
        .orderBy(desc(tblLoanHistory.action_date));
    } catch (error) {
      console.error('Error fetching loan history:', error);
      return [];
    }
  }

  async logLoanAction(
    requestId: number,
    action: string,
    performedBy?: number,
    notes?: string,
    oldStatus?: string,
    newStatus?: string
  ): Promise<void> {
    try {
      await db.insert(tblLoanHistory).values({
        loan_request_id: requestId,
        action: action as any,
        performed_by: performedBy,
        notes: notes,
        old_status: oldStatus as any,
        new_status: newStatus as any,
      });
    } catch (error) {
      console.error('Error logging loan action:', error);
    }
  }

  async returnLoanRequest(id: number, adminId: number): Promise<boolean> {
    try {
      const currentRequest = await this.getLoanRequestById(id);
      if (!currentRequest) {
        throw new Error('Loan request not found');
      }

      // Update loan request status to returned
      await db.update(tblLoanRequests).set({
        status: 'returned',
        return_date: new Date(),
        approved_by: adminId,
      }).where(eq(tblLoanRequests.id, id));

      // When admin marks as returned, set the related book as available again
      try {
        if (currentRequest.id_buku) {
          await db.update(tblBuku).set({
            tersedia: 1 // mark as available
          }).where(eq(tblBuku.id_buku, currentRequest.id_buku));
        }
      } catch (buchErr) {
        console.error('Error updating book availability on return:', buchErr);
      }

      // Log the return action
      await this.logLoanAction(id, 'returned', adminId, 'Marked as returned by admin', 'approved', 'returned');

      // Clear dashboard stats cache
      cache.delete('dashboard_stats');

      return true;
    } catch (error) {
      console.error('Error marking loan as returned:', error);
      return false;
    }
  }

  async getLoanRequestStats(): Promise<{ pending: number; active: number; completed: number; overdue: number }> {
    try {
      const [pendingResult, activeResult, completedResult, overdueResult] = await Promise.all([
        db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, 'pending')),
        db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, 'approved')),
        db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, 'returned')),
        db.select({ count: count() }).from(tblLoanRequests).where(eq(tblLoanRequests.status, 'overdue'))
      ]);

      return {
        pending: pendingResult[0]?.count || 0,
        active: activeResult[0]?.count || 0,
        completed: completedResult[0]?.count || 0,
        overdue: overdueResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching loan request stats:', error);
      return { pending: 0, active: 0, completed: 0, overdue: 0 };
    }
  }

  async getUserLoanRequestStats(userId: number): Promise<{ pending: number; approved: number; returned: number }> {
    try {
      // First get the user's NIK from the login table
      const user = await db.select().from(tblLogin).where(eq(tblLogin.id_login, userId)).limit(1);
      if (!user[0] || !user[0].anggota_id) {
        return { pending: 0, approved: 0, returned: 0 };
      }
      
      return this.getUserLoanRequestStatsByNik(user[0].anggota_id);
    } catch (error) {
      console.error('Error fetching user loan request stats:', error);
      return { pending: 0, approved: 0, returned: 0 };
    }
  }

  async getUserLoanRequestStatsByNik(employeeNik: string): Promise<{ pending: number; approved: number; returned: number }> {
    try {
      const [pendingResult, approvedResult, returnedResult] = await Promise.all([
        db.select({ count: count() }).from(tblLoanRequests).where(and(
          eq(tblLoanRequests.employee_nik, employeeNik),
          eq(tblLoanRequests.status, 'pending')
        )),
        db.select({ count: count() }).from(tblLoanRequests).where(and(
          eq(tblLoanRequests.employee_nik, employeeNik),
          eq(tblLoanRequests.status, 'approved')
        )),
        db.select({ count: count() }).from(tblLoanRequests).where(and(
          eq(tblLoanRequests.employee_nik, employeeNik),
          eq(tblLoanRequests.status, 'returned')
        ))
      ]);

      return {
        pending: pendingResult[0]?.count || 0,
        approved: approvedResult[0]?.count || 0,
        returned: returnedResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching user loan request stats by NIK:', error);
      return { pending: 0, approved: 0, returned: 0 };
    }
  }

  async getMonthlyLoanBorrowed(): Promise<Array<{ month: string; borrowed: number }>> {
    try {
      const borrowDateExpression = sql`COALESCE(${tblLoanRequests.loan_date}, ${tblLoanRequests.approval_date})`;
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(1);
      startDate.setMonth(startDate.getMonth() - 11); // Last 12 months including current

      const rawResults = await db
        .select({
          monthKey: sql<string>`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`,
          borrowed: sql<number>`COUNT(*)`
        })
        .from(tblLoanRequests)
        .where(and(
          sql`${borrowDateExpression} IS NOT NULL`,
          sql`${borrowDateExpression} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${tblLoanRequests.status} NOT IN ('pending', 'rejected')`
        ))
        .groupBy(sql`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${borrowDateExpression}, '%Y-%m')`);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return rawResults.map(result => {
        const [year, month] = result.monthKey.split('-');
        const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1));
        return {
          month: `${monthNames[monthIndex]} ${year}`,
          borrowed: result.borrowed
        };
      });
    } catch (error) {
      console.error('Error fetching monthly loan borrowed stats:', error);
      return [];
    }
  }

  // ===== STAFF MANAGEMENT METHODS =====

  async getStaff(page: number = 1, limit: number = 25, search?: string): Promise<{ staff: Staff[]; total: number }> {
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
      console.error('Error fetching staff:', error);
      return { staff: [], total: 0 };
    }
  }

  async getStaffById(id: number): Promise<Staff | null> {
    try {
      const result = await db
        .select()
        .from(tblStaff)
        .where(eq(tblStaff.id_staff, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      return null;
    }
  }

  async getStaffByNik(nik: string): Promise<Staff | null> {
    try {
      const result = await db
        .select()
        .from(tblStaff)
        .where(eq(tblStaff.nik, nik))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching staff by NIK:', error);
      return null;
    }
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    try {
      const result = await db.insert(tblStaff).values(staffData);
      const insertedId = result[0].insertId;
      
      const newStaff = await this.getStaffById(Number(insertedId));
      if (!newStaff) {
        throw new Error('Failed to retrieve created staff');
      }
      
      return newStaff;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  async updateStaff(id: number, updates: Partial<InsertStaff>): Promise<Staff | null> {
    try {
      await db.update(tblStaff)
        .set({
          ...updates,
          updated_at: new Date()
        })
        .where(eq(tblStaff.id_staff, id));
      
      return await this.getStaffById(id);
    } catch (error) {
      console.error('Error updating staff:', error);
      return null;
    }
  }

  async deleteStaff(id: number): Promise<boolean> {
    try {
      const result = await db.delete(tblStaff).where(eq(tblStaff.id_staff, id));
      return (result[0]?.affectedRows || 0) > 0;
    } catch (error) {
      console.error('Error deleting staff:', error);
      return false;
    }
  }

  async bulkCreateStaff(staffList: InsertStaff[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const staffData of staffList) {
      try {
        // Check if NIK already exists
        const existing = await this.getStaffByNik(staffData.nik);
        if (existing) {
          errors.push(`Staff with NIK ${staffData.nik} already exists`);
          continue;
        }

        await this.createStaff(staffData);
        success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to create staff ${staffData.staff_name}: ${errorMessage}`);
      }
    }

    return { success, errors };
  }

  async getStaffDepartments(): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ dept_name: tblStaff.dept_name })
        .from(tblStaff)
        .where(isNotNull(tblStaff.dept_name))
        .orderBy(asc(tblStaff.dept_name));
      
      return result.map(r => r.dept_name).filter(Boolean) as string[];
    } catch (error) {
      console.error('Error fetching staff departments:', error);
      return [];
    }
  }

  async getStaffSections(): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ section_name: tblStaff.section_name })
        .from(tblStaff)
        .where(isNotNull(tblStaff.section_name))
        .orderBy(asc(tblStaff.section_name));
      
      return result.map(r => r.section_name).filter(Boolean) as string[];
    } catch (error) {
      console.error('Error fetching staff sections:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();

// Export cache for testing purposes
export { cache };
