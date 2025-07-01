import { db } from "./db";
import { tblLogin, tblBuku, tblKategori, tblRak, type Login, type Buku, type BukuWithDetails, type Kategori, type Rak, type InsertBuku } from "@shared/schema";
import { eq, like, or, desc, asc, count, sql, and } from "drizzle-orm";
import bcrypt from "bcrypt";

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
  getTopCategories(limit: number): Promise<Array<{ id: number; name: string; count: number }>>;

  // Shelves methods
  getShelves(): Promise<Rak[]>;
  getShelfById(id: number): Promise<Rak | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    onLoan: number;
    categories: number;
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

  async getBooks(page: number, limit: number, search?: string, categoryId?: number, rakId?: number): Promise<{ books: BukuWithDetails[], total: number }> {
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

    return results;
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

  async getDashboardStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    onLoan: number;
    categories: number;
  }> {
    const [booksCount, availableCount, categoriesCount] = await Promise.all([
      db.select({ count: count() }).from(tblBuku),
      db.select({ count: count() }).from(tblBuku).where(eq(tblBuku.tersedia, 1)),
      db.select({ count: count() }).from(tblKategori)
    ]);

    const totalBooks = booksCount[0].count;
    const availableBooks = availableCount[0].count;
    const onLoan = totalBooks - availableBooks;
    const categories = categoriesCount[0].count;

    return {
      totalBooks,
      availableBooks,
      onLoan,
      categories
    };
  }
}

export const storage = new DatabaseStorage();
