// Temporary server-compatible storage functions
// This version checks if columns exist before querying them

import { eq, desc, and, like, sql } from "drizzle-orm";
import { db } from "./db.js";
import {
  tblBuku,
  tblKategori,
  tblLokasi,
  tblLoanRequests,
  tblLogin,
  type BukuWithDetails,
  type Kategori,
  type Lokasi,
  type Login,
} from "@shared/schema";

// Check if a column exists in a table
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const rawResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ${tableName} 
      AND COLUMN_NAME = ${columnName}
    `);
    const result = rawResult as unknown as Array<{ count: number } & Record<string, unknown>>;
    return Number(result[0]?.count ?? 0) > 0;
  } catch (error) {
    console.log(`Error checking column ${columnName} in ${tableName}:`, error);
    return false;
  }
}

export class ServerCompatibleStorage {
  private fileTypeExists: boolean | null = null;
  private departmentExists: boolean | null = null;

  async checkColumns() {
    if (this.fileTypeExists === null) {
      this.fileTypeExists = await columnExists('tbl_buku', 'file_type');
      this.departmentExists = await columnExists('tbl_buku', 'department');
      console.log(`Column check: file_type=${this.fileTypeExists}, department=${this.departmentExists}`);
    }
  }

  async getBooks(params: any = {}) {
    await this.checkColumns();
    
    const {
      page = 1,
      limit = 25,
      search = "",
      categoryId,
      lokasiId,
      departmentFilter = "",
      yearFilter = ""
    } = params;

    console.log("Fetching books with params:", params);

    try {
      // Build select object based on available columns
      const availabilityExpression = sql<number>`CASE 
        WHEN ${tblBuku.tersedia} = 1 AND NOT EXISTS (
          SELECT 1 FROM ${tblLoanRequests}
          WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
            AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
        ) THEN 1 ELSE 0 END`;

      const selectFields: any = {
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
        kategori_nama: tblKategori.nama_kategori,
        lokasi_nama: tblLokasi.nama_lokasi,
      };

      // Only add optional columns if they exist
      if (this.departmentExists) {
        selectFields.department = tblBuku.department;
      }
      if (this.fileTypeExists) {
        selectFields.file_type = tblBuku.file_type;
      }

      const booksQuery = db
        .select(selectFields)
        .from(tblBuku)
        .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
        .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
        .orderBy(desc(tblBuku.id_buku));

      // Add where conditions if needed
      const conditions = [];
      
      if (search) {
        conditions.push(
          like(tblBuku.title, `%${search}%`)
        );
      }
      
      if (categoryId) {
        conditions.push(eq(tblBuku.id_kategori, categoryId));
      }
      
      if (lokasiId) {
        conditions.push(eq(tblBuku.id_lokasi, lokasiId));
      }
      
      if (departmentFilter && this.departmentExists) {
        conditions.push(eq(tblBuku.department, departmentFilter));
      }
      
      if (yearFilter) {
        conditions.push(eq(tblBuku.thn_buku, yearFilter));
      }

      const conditionedQuery = conditions.length > 0
        ? booksQuery.where(and(...conditions))
        : booksQuery;

      const offset = (page - 1) * limit;
      const books = await conditionedQuery.limit(limit).offset(offset);

      console.log(`Successfully fetched ${books.length} books`);
      return books;

    } catch (error) {
      console.error("Error fetching books:", error);
      throw new Error("Failed to fetch books");
    }
  }

  async getBookById(id: number): Promise<BukuWithDetails | undefined> {
    await this.checkColumns();

    try {
      // Build select object based on available columns
      const availabilityExpression = sql<number>`CASE 
        WHEN ${tblBuku.tersedia} = 1 AND NOT EXISTS (
          SELECT 1 FROM ${tblLoanRequests}
          WHERE ${tblLoanRequests.id_buku} = ${tblBuku.id_buku}
            AND ${tblLoanRequests.status} IN ('approved', 'on_loan')
        ) THEN 1 ELSE 0 END`;

      const selectFields: any = {
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
        kategori_nama: tblKategori.nama_kategori,
        lokasi_nama: tblLokasi.nama_lokasi,
      };

      // Only add optional columns if they exist
      if (this.departmentExists) {
        selectFields.department = tblBuku.department;
      }
      if (this.fileTypeExists) {
        selectFields.file_type = tblBuku.file_type;
      }

      const results = await db
        .select(selectFields)
        .from(tblBuku)
        .leftJoin(tblKategori, eq(tblBuku.id_kategori, tblKategori.id_kategori))
        .leftJoin(tblLokasi, eq(tblBuku.id_lokasi, tblLokasi.id_lokasi))
        .where(eq(tblBuku.id_buku, id))
        .limit(1);

  const normalizedResults = results as unknown as Array<BukuWithDetails & Record<string, unknown>>;
  return normalizedResults[0];
    } catch (error) {
      console.error("Error fetching book by ID:", error);
      throw new Error("Failed to fetch book");
    }
  }

  // Other methods remain the same...
  async getCategories(): Promise<Kategori[]> {
    return await db.select().from(tblKategori);
  }

  async getLocations(): Promise<Lokasi[]> {
    console.log("Fetching locations from database...");
    try {
      const locations = await db.select().from(tblLokasi);
      console.log(`Successfully fetched locations: ${locations.length}`);
      return locations;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw new Error("Failed to fetch locations");
    }
  }

  async getUsers(): Promise<Login[]> {
    return await db.select().from(tblLogin);
  }
}