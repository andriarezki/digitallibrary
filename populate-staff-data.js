// Script to populate staff and employees tables with your CSV data
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function populateStaffData() {
  try {
    console.log("Populating staff data from CSV...");
    
    // Sample data from your CSV (first 10 records)
    const staffData = [
      {
        nik: '17000823',
        name: 'Abednego L. Simamora',
        initial: null,
        section: 'Research And Development',
        department: 'Analytical Laboratory',
        dept_code: 'LABO',
        phone: '81221233728',
        email: null,
        position: null,
        photo: null
      },
      {
        nik: '93000033',
        name: 'Achmad Wahyu S.',
        initial: null,
        section: 'Phytopathology',
        department: 'Crop Protection',
        dept_code: 'CROP',
        phone: '81365417208',
        email: 'achmad.w.sulistyanto@sinarmas-agri.com',
        position: null,
        photo: 'ACHMAD'
      },
      {
        nik: '20000748',
        name: 'Andria Rezki',
        initial: null,
        section: 'Biometry and Database',
        department: 'Data Intelligence and Analytics',
        dept_code: 'DIAD',
        phone: '81376434343',
        email: null,
        position: null,
        photo: 'ANDRIA'
      },
      {
        nik: '23000389',
        name: 'Adfal Afdala',
        initial: '',
        section: 'Big Data, AI, and Digitalization',
        department: 'Data Intelligence and Analytics',
        dept_code: 'DIAD',
        phone: '82372607516',
        email: null,
        position: null,
        photo: null
      },
      {
        nik: '13001639',
        name: 'Adin Afiyata',
        initial: '',
        section: 'Clonal Selection and Evaluation',
        department: 'Plant Breeding',
        dept_code: 'BREED',
        phone: '81327320380',
        email: null,
        position: null,
        photo: null
      },
      {
        nik: '10000291',
        name: 'Arnolly S. Ardi',
        initial: 'ASA',
        section: 'Clonal Selection and Evaluation',
        department: 'Plant Breeding',
        dept_code: 'BREED',
        phone: '82283968121',
        email: null,
        position: null,
        photo: 'ARNOLLY'
      },
      {
        nik: '10000107',
        name: 'Bram Hadiwijaya',
        initial: null,
        section: 'Sustainability Research',
        department: 'Sustainability Research',
        dept_code: 'SUST',
        phone: '81268696928',
        email: 'bram.hadiwijaya@sinarmas-agri.com',
        position: 'Dept Head',
        photo: 'BRAM'
      },
      {
        nik: '9000720',
        name: 'Divo Dharma Silalahi',
        initial: null,
        section: 'Data Intelligence and Analytics',
        department: 'Data Intelligence and Analytics',
        dept_code: 'DIAD',
        phone: '85211916330',
        email: 'divo.d.silalahi@sinarmas-agri.com',
        position: 'Dept Head',
        photo: 'DIVO'
      },
      {
        nik: '98000214',
        name: 'Pujianto',
        initial: null,
        section: 'Agronomy',
        department: 'Agronomy',
        dept_code: 'AGRO',
        phone: '81268897334',
        email: 'pujianto.libz@sinarmas-agri.com',
        position: 'Dept Head',
        photo: 'PUJIANTO'
      },
      {
        nik: '97000047',
        name: 'Hartono',
        initial: null,
        section: 'Field Operation and Extension Services',
        department: 'Field Operation and Extension Services',
        dept_code: 'FOES',
        phone: '81367077601',
        email: 'hartono.smartri@sinarmas-agri.com',
        position: 'Dept Head',
        photo: 'HARTONO'
      }
    ];

    // Clear existing data
    await db.execute(sql`DELETE FROM tbl_employees`);
    
    // Insert staff data into employees table for loan compatibility
    for (const staff of staffData) {
      await db.execute(sql`
        INSERT INTO tbl_employees (nik, name, email, phone, department, position, status)
        VALUES (${staff.nik}, ${staff.name}, ${staff.email}, ${staff.phone}, ${staff.dept_code}, ${staff.position}, 'active')
      `);
    }

    console.log(`Successfully inserted ${staffData.length} employee records`);
    
    // Verify the data
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM tbl_employees`);
    console.log(`Total employees in database: ${count[0]?.count}`);
    
    // Show some sample data
    const sample = await db.execute(sql`SELECT nik, name, department FROM tbl_employees LIMIT 5`);
    console.log("Sample employee data:");
    sample.forEach(emp => {
      console.log(`- NIK: ${emp.nik}, Name: ${emp.name}, Dept: ${emp.department}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error populating staff data:", error);
    process.exit(1);
  }
}

populateStaffData();