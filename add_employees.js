import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { tblEmployees } from './shared/schema.ts';

async function addEmployeeData() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'projek_perpus'
    });

    const db = drizzle(connection, { schema: { tblEmployees } });

    // Insert the missing employee
    await db.insert(tblEmployees).values({
      nik: '20000748',
      name: 'Aan',
      email: 'andriarezki@gmail.com',
      phone: '081376434343',
      department: 'IT',
      position: 'Developer',
      hire_date: new Date('2020-01-01'),
      is_active: true
    });

    console.log('✅ Employee with NIK 20000748 added successfully!');

    // Add a few more sample employees
    await db.insert(tblEmployees).values([
      {
        nik: '20000001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '081234567890',
        department: 'HR',
        position: 'Manager',
        hire_date: new Date('2019-01-15'),
        is_active: true
      },
      {
        nik: '20000002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        phone: '081234567891',
        department: 'Finance',
        position: 'Analyst',
        hire_date: new Date('2020-03-20'),
        is_active: true
      }
    ]);

    console.log('✅ Additional sample employees added successfully!');

    // Verify the data
    const allEmployees = await db.select().from(tblEmployees);
    console.log('\n📋 Current employees in database:');
    allEmployees.forEach(emp => {
      console.log(`- ${emp.nik}: ${emp.name} (${emp.department})`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Error adding employee data:', error);
  }
}

addEmployeeData();