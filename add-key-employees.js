// Simple script to add key employees directly
import { db } from "./server/db";
import { tblEmployees } from "./shared/schema";

async function addKeyEmployees() {
  try {
    console.log("Adding key employees...");
    
    // Clear existing data
    await db.delete(tblEmployees);
    
    // Add key employees from your CSV
    const employees = [
      {
        nik: '20000748',
        name: 'Andria Rezki',
        email: 'andriarezki@gmail.com',
        phone: '081376434343',
        department: 'DIAD',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '17000823',
        name: 'Abednego L. Simamora',
        email: null,
        phone: '81221233728',
        department: 'LABO',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '93000033',
        name: 'Achmad Wahyu S.',
        email: 'achmad.w.sulistyanto@sinarmas-agri.com',
        phone: '81365417208',
        department: 'CROP',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '10000107',
        name: 'Bram Hadiwijaya',
        email: 'bram.hadiwijaya@sinarmas-agri.com',
        phone: '81268696928',
        department: 'SUST',
        position: 'Dept Head',
        status: 'active'
      },
      {
        nik: '9000720',
        name: 'Divo Dharma Silalahi',
        email: 'divo.d.silalahi@sinarmas-agri.com',
        phone: '85211916330',
        department: 'DIAD',
        position: 'Dept Head',
        status: 'active'
      }
    ];

    for (const emp of employees) {
      await db.insert(tblEmployees).values(emp);
      console.log(`Added: ${emp.nik} - ${emp.name}`);
    }

    console.log(`Successfully added ${employees.length} employees`);
    
    // Verify
    const allEmployees = await db.select().from(tblEmployees);
    console.log(`Total employees in database: ${allEmployees.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error adding employees:", error);
    process.exit(1);
  }
}

addKeyEmployees();