// Script to migrate staff data to employees table for loan system compatibility
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrateStaffToEmployees() {
  try {
    console.log("Starting staff to employees migration...");
    
    // Clear existing employees data (except system ones)
    console.log("Clearing existing employee data...");
    await db.execute(sql`DELETE FROM tbl_employees WHERE nik NOT LIKE 'EMP%'`);
    
    // Migrate staff data to employees table
    console.log("Migrating staff data to employees table...");
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

    // Check results
    const staffCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_staff`);
    const employeeCount = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_employees`);
    
    console.log(`Migration completed!`);
    console.log(`Staff table: ${staffCount[0]?.count || 0} records`);
    console.log(`Employees table: ${employeeCount[0]?.count || 0} records`);
    
    // Show some examples
    const examples = await db.execute(sql`
      SELECT nik, name, department, email 
      FROM tbl_employees 
      WHERE nik NOT LIKE 'EMP%' 
      LIMIT 5
    `);
    
    console.log("Example migrated employees:");
    examples.forEach((emp, i) => {
      console.log(`${i + 1}. NIK: ${emp.nik}, Name: ${emp.name}, Dept: ${emp.department}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error migrating staff to employees:", error);
    process.exit(1);
  }
}

migrateStaffToEmployees();