// Migration script to copy staff data to employees table for loan system compatibility
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrateStaffToEmployees() {
  try {
    console.log("Starting migration from tbl_staff to tbl_employees...");
    
    // First, clear existing employees data to avoid conflicts
    console.log("Clearing existing employees data...");
    await db.execute(sql`DELETE FROM tbl_employees`);
    
    // Copy staff data to employees table
    console.log("Copying staff data to employees table...");
    await db.execute(sql`
      INSERT INTO tbl_employees (nik, name, email, phone, department, position, status, created_at, updated_at)
      SELECT 
        nik,
        staff_name as name,
        email,
        no_hp as phone,
        dept_name as department,
        position,
        CASE WHEN status = 1 THEN 'active' ELSE 'inactive' END as status,
        created_at,
        updated_at
      FROM tbl_staff
      WHERE nik IS NOT NULL AND staff_name IS NOT NULL
    `);

    // Check the results
    const staffCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_staff`);
    const employeeCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_employees`);
    
    console.log(`Migration completed!`);
    console.log(`Staff records: ${staffCount[0]?.count || 0}`);
    console.log(`Employee records: ${employeeCount[0]?.count || 0}`);
    
    // Show some sample data
    const sampleEmployees = await db.execute(sql`
      SELECT nik, name, department, email FROM tbl_employees LIMIT 5
    `);
    
    console.log("Sample migrated employees:");
    sampleEmployees.forEach(emp => {
      console.log(`- ${emp.nik}: ${emp.name} (${emp.department})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

migrateStaffToEmployees();