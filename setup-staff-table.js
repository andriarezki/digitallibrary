// Simple script to set up staff table
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function setupStaffTable() {
  try {
    console.log("Creating staff table...");
    
    // Create the staff table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS \`tbl_staff\` (
        \`id_staff\` int(11) NOT NULL AUTO_INCREMENT,
        \`staff_name\` varchar(255) NOT NULL,
        \`initial_name\` varchar(100) NULL,
        \`nik\` varchar(20) NOT NULL UNIQUE,
        \`section_name\` varchar(255) NULL,
        \`department_name\` varchar(255) NULL,
        \`dept_name\` varchar(50) NULL,
        \`no_hp\` varchar(20) NULL,
        \`email\` varchar(255) NULL,
        \`status\` int(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
        \`position\` varchar(255) NULL,
        \`photo\` varchar(255) NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_staff\`),
        UNIQUE KEY \`idx_staff_nik\` (\`nik\`),
        KEY \`idx_staff_dept\` (\`dept_name\`),
        KEY \`idx_staff_section\` (\`section_name\`),
        KEY \`idx_staff_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Staff table created successfully!");

    // Check if table has data
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_staff`);
    console.log(`Current staff count: ${count[0]?.count || 0}`);

    process.exit(0);
  } catch (error) {
    console.error("Error setting up staff table:", error);
    process.exit(1);
  }
}

setupStaffTable();