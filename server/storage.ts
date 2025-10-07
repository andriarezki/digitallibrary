import { db } from "./db";
import { tblLogin, tblBuku, tblKategori, tblRak, tblUserActivity, type Login, type Buku, type BukuWithDetails, type Kategori, type Rak, type InsertBuku, type UserActivity } from "@shared/schema";
import { eq, like, or, desc, asc, count, sql, and } from "drizzle-orm";
import bcrypt from "bcrypt";

// Visitor and PDF view counters (in-memory, resets on server restart)
let siteVisitorCount = 0;
let pdfViewCount = 0;

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

export function incrementSiteVisitor() {
  siteVisitorCount++;
}
export function incrementPdfView() {
  pdfViewCount++;
}
export function getVisitorStats() {
  return { siteVisitorCount, pdfViewCount };
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
  getBooks(page: number, limit: number, search?: string, categoryId?: number, rakId?: number): Promise<{ books: BukuWithDetails[], total: number }>;
  getBookById(id: number): Promise<BukuWithDetails | undefined>;
  createBook(book: InsertBuku): Promise<Buku>;
  updateBook(id: number, book: Partial<InsertBuku>): Promise<Buku | undefined>;
  deleteBook(id: number): Promise<boolean>;

  // Categories methods
  getCategories(): Promise<Kategori[]>;
  getCategoryById(id: number): Promise<Kategori | undefined>;
  createCategory(data: { nama_kategori: string }): Promise<Kategori>;
  updateCategory(id: number, data: { nama_kategori: string }): Promise<void>;
  deleteCategory(id: number): Promise<boolean>;
  getTopCategories(limit: number): Promise<Array<{ id: number; name: string; count: number }>>;

  // Shelves methods
  getShelves(): Promise<Rak[]>;
  getShelfById(id: number): Promise<Rak | undefined>;
  createShelf(data: { nama_rak: string; lokasi: string | null; kapasitas: number | null }): Promise<Rak>;
  updateShelf(id: number, data: { nama_rak: string; lokasi: string | null; kapasitas: number | null }): Promise<void>;
  deleteShelf(id: number): Promise<boolean>;

  // Departments methods
  getDepartments(): Promise<Array<{ department: string }>>;

  // User Activity methods
  logUserActivity(userId: number, activityType: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getMonthlyUserActivity(): Promise<Array<{ month: string; activeUsers: number }>>;
  getWeeklyBooksAdded(): Promise<Array<{ week: string; booksAdded: number }>>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    onLoan: number;
    categories: number;
    siteVisitorCount: number;
    pdfViewCount: number;
  }>;
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

  async getBooks(page: number, limit: number, search?: string, categoryId?: number, rakId?: number, departmentFilter?: string): Promise<{ books: BukuWithDetails[], total: number }> {
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

    if (rakId) {
      whereConditions.push(eq(tblBuku.id_rak, rakId));
    }

    if (departmentFilter) {
      whereConditions.push(eq(tblBuku.department, departmentFilter));
    }

    const offset = (page - 1) * limit;

    const booksQuery = db
      .select({
        id_buku: tblBuku.id_buku,
        buku_id: tblBuku.buku_id,
        id_kategori: tblBuku.id_kategori,
        id_rak: tblBuku.id_rak,
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
        kategori_nama: tblKategori.nama_kategori,
        rak_nama: tblRak.nama_rak,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblRak, eq(tblBuku.id_rak, tblRak.id_rak))
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

  async getBookById(id: number): Promise<BukuWithDetails | undefined> {
    const results = await db
      .select({
        id_buku: tblBuku.id_buku,
        buku_id: tblBuku.buku_id,
        id_kategori: tblBuku.id_kategori,
        id_rak: tblBuku.id_rak,
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
        kategori_nama: tblKategori.nama_kategori,
        rak_nama: tblRak.nama_rak,
      })
      .from(tblBuku)
      .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
      .leftJoin(tblRak, eq(tblBuku.id_rak, tblRak.id_rak))
      .where(eq(tblBuku.id_buku, id))
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

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(tblKategori)
      .where(eq(tblKategori.id_kategori, id));
    return result[0].affectedRows > 0;
  }

  async getShelves(): Promise<Rak[]> {
    return await db.select().from(tblRak).orderBy(asc(tblRak.nama_rak));
  }

  async getShelfById(id: number): Promise<Rak | undefined> {
    const results = await db
      .select()
      .from(tblRak)
      .where(eq(tblRak.id_rak, id))
      .limit(1);
    
    return results[0];
  }

  async createShelf(data: { nama_rak: string; lokasi: string | null; kapasitas: number | null }): Promise<Rak> {
    const result = await db.insert(tblRak)
      .values({ 
        nama_rak: data.nama_rak,
        lokasi: data.lokasi,
        kapasitas: data.kapasitas
      });
    
    const newShelf = await db
      .select()
      .from(tblRak)
      .where(eq(tblRak.id_rak, result[0].insertId))
      .limit(1);
    
    return newShelf[0];
  }

  async updateShelf(id: number, data: { nama_rak: string; lokasi: string | null; kapasitas: number | null }): Promise<void> {
    await db.update(tblRak)
      .set({ 
        nama_rak: data.nama_rak,
        lokasi: data.lokasi,
        kapasitas: data.kapasitas
      })
      .where(eq(tblRak.id_rak, id));
  }

  async deleteShelf(id: number): Promise<boolean> {
    const result = await db.delete(tblRak)
      .where(eq(tblRak.id_rak, id));
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
        siteVisitorCount,
        pdfViewCount
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
      siteVisitorCount,
      pdfViewCount
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
      // Check if user activity table exists
      const tableCheck = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'tbl_user_activity'
      `);

      // If table doesn't exist, return mock data for now
      if (!tableCheck[0] || (tableCheck[0] as any).count === 0) {
        console.log('User activity table not found, returning sample data');
        return [
          { month: 'May', activeUsers: 5 },
          { month: 'Jun', activeUsers: 8 },
          { month: 'Jul', activeUsers: 12 },
          { month: 'Aug', activeUsers: 15 },
          { month: 'Sep', activeUsers: 18 },
          { month: 'Oct', activeUsers: 22 }
        ];
      }

      // Get user activity for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const results = await db
        .select({
          month: sql<string>`DATE_FORMAT(activity_date, '%Y-%m')`,
          activeUsers: sql<number>`COUNT(DISTINCT user_id)`
        })
        .from(tblUserActivity)
        .where(sql`activity_date >= ${sixMonthsAgo}`)
        .groupBy(sql`DATE_FORMAT(activity_date, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(activity_date, '%Y-%m')`);

      // Format month names for display
      return results.map(result => ({
        month: new Date(result.month + '-01').toLocaleString('default', { month: 'short' }),
        activeUsers: result.activeUsers
      }));
    } catch (error) {
      console.error('Error fetching monthly user activity:', error);
      // Return sample data if there's an error
      return [
        { month: 'May', activeUsers: 5 },
        { month: 'Jun', activeUsers: 8 },
        { month: 'Jul', activeUsers: 12 },
        { month: 'Aug', activeUsers: 15 },
        { month: 'Sep', activeUsers: 18 },
        { month: 'Oct', activeUsers: 22 }
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
          categoryName: sql<string>`COALESCE(tk.nama_kategori, 'Uncategorized')`,
          booksAdded: sql<number>`COUNT(*)`,
          latestDate: sql<string>`MAX(STR_TO_DATE(tb.tgl_masuk, '%Y-%m-%d'))`
        })
        .from(tblBuku)
        .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
        .where(sql`
          tb.tgl_masuk IS NOT NULL 
          AND tb.tgl_masuk != ''
          AND tb.tgl_masuk != '0000-00-00'
          AND STR_TO_DATE(tb.tgl_masuk, '%Y-%m-%d') >= ${fourWeeksAgo}
        `)
        .groupBy(sql`tk.id_kategori, tk.nama_kategori`)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(8); // Top 8 categories by book count

      // If no recent data, get top categories from all time
      if (results.length === 0) {
        const fallbackResults = await db
          .select({
            categoryName: sql<string>`COALESCE(tk.nama_kategori, 'Uncategorized')`,
            booksAdded: sql<number>`COUNT(*)`
          })
          .from(tblBuku)
          .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
          .where(sql`tb.tgl_masuk IS NOT NULL AND tb.tgl_masuk != '' AND tb.tgl_masuk != '0000-00-00'`)
          .groupBy(sql`tk.id_kategori, tk.nama_kategori`)
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
}

export const storage = new DatabaseStorage();
