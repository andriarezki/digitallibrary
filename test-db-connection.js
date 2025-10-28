// Database Connection Test for Server Deployment
// Run this script to verify database connectivity and schema completeness

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./shared/schema.js";

const testDatabaseConnection = async () => {
  console.log("🔍 Testing Database Connection...");
  
  try {
    // Create connection
    const connection = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'projek_perpus',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const db = drizzle(connection, { schema, mode: 'default' });

    console.log("✅ Database connection established");

    // Test basic queries
    console.log("\n🔍 Testing table access...");
    
    // Test locations (tbl_rak)
    try {
      const locations = await db.select().from(schema.tblLokasi).limit(1);
      console.log("✅ Locations table accessible");
    } catch (error) {
      console.log("❌ Locations table error:", error.message);
    }

    // Test categories
    try {
      const categories = await db.select().from(schema.tblKategori).limit(1);
      console.log("✅ Categories table accessible");
    } catch (error) {
      console.log("❌ Categories table error:", error.message);
    }

    // Test books (with file_type field)
    try {
      const books = await db.select().from(schema.tblBuku).limit(1);
      console.log("✅ Books table accessible with all fields");
    } catch (error) {
      console.log("❌ Books table error:", error.message);
      console.log("💡 This might indicate missing file_type or department columns");
    }

    // Test analytics tables
    try {
      const visitors = await db.select().from(schema.tblSiteVisitors).limit(1);
      console.log("✅ Site visitors table accessible");
    } catch (error) {
      console.log("❌ Site visitors table error:", error.message);
      console.log("💡 Analytics tables might need to be created");
    }

    console.log("\n🎯 Connection test completed!");
    console.log("If you see any ❌ errors above, run the server_database_setup.sql script");
    
    await connection.end();
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n💡 Check your database configuration:");
    console.log("- Is MySQL running?");
    console.log("- Are the connection parameters correct?");
    console.log("- Does the database 'projek_perpus' exist?");
  }
};

// Run the test
testDatabaseConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});