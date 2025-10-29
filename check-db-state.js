// Check current database state
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkDatabaseState() {
  try {
    console.log("Checking database state...");
    
    // Check staff table
    const staffCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_staff`);
    console.log(`Staff table count: ${staffCount[0]?.count || 0}`);
    
    if (staffCount[0]?.count > 0) {
      const sampleStaff = await db.execute(sql`SELECT * FROM tbl_staff LIMIT 3`);
      console.log("Sample staff data:");
      sampleStaff.forEach(staff => {
        console.log(`- ID: ${staff.id_staff}, NIK: ${staff.nik}, Name: ${staff.staff_name}`);
      });
    }
    
    // Check employees table
    const empCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_employees`);
    console.log(`Employees table count: ${empCount[0]?.count || 0}`);
    
    if (empCount[0]?.count > 0) {
      const sampleEmp = await db.execute(sql`SELECT * FROM tbl_employees LIMIT 3`);
      console.log("Sample employee data:");
      sampleEmp.forEach(emp => {
        console.log(`- ID: ${emp.id}, NIK: ${emp.nik}, Name: ${emp.name}`);
      });
    }
    
    // Check if tables exist
    const tables = await db.execute(sql`SHOW TABLES LIKE 'tbl_%'`);
    console.log("Available tables:");
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }
}

checkDatabaseState();