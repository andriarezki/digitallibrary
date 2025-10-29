// Add more employees from the CSV for better testing
import { db } from "./server/db";
import { tblEmployees } from "./shared/schema";

async function addMoreEmployees() {
  try {
    console.log("Adding more employees from CSV...");
    
    // Add more employees from your CSV file
    const moreEmployees = [
      {
        nik: '23000389',
        name: 'Adfal Afdala',
        email: null,
        phone: '82372607516',
        department: 'DIAD',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '13001639',
        name: 'Adin Afiyata',
        email: null,
        phone: '81327320380',
        department: 'BREED',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '23000433',
        name: 'Aditya Fajar Kurniawan',
        email: null,
        phone: '82199042639',
        department: 'FOES',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '10000291',
        name: 'Arnolly S. Ardi',
        email: null,
        phone: '82283968121',
        department: 'BREED',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '10002115',
        name: 'Bayu Septiwibowo',
        email: null,
        phone: '82170705550',
        department: 'SUST',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '21000490',
        name: 'Chyntia Novanti',
        email: null,
        phone: '85219225991',
        department: 'FOES',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '8000775',
        name: 'Doni Artanto R',
        email: null,
        phone: '81265127307',
        department: 'AGRO',
        position: 'Staff',
        status: 'active'
      },
      {
        nik: '98000214',
        name: 'Pujianto',
        email: 'pujianto.libz@sinarmas-agri.com',
        phone: '81268897334',
        department: 'AGRO',
        position: 'Dept Head',
        status: 'active'
      },
      {
        nik: '97000047',
        name: 'Hartono',
        email: 'hartono.smartri@sinarmas-agri.com',
        phone: '81367077601',
        department: 'FOES',
        position: 'Dept Head',
        status: 'active'
      },
      {
        nik: '21000087',
        name: 'Anisa Putri',
        email: null,
        phone: '8118681802',
        department: 'LABO',
        position: 'Staff',
        status: 'active'
      }
    ];

    for (const emp of moreEmployees) {
      try {
        await db.insert(tblEmployees).values(emp);
        console.log(`Added: ${emp.nik} - ${emp.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`Skipped duplicate: ${emp.nik} - ${emp.name}`);
        } else {
          throw error;
        }
      }
    }

    // Get total count
    const allEmployees = await db.select().from(tblEmployees);
    console.log(`Total employees in database: ${allEmployees.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error adding employees:", error);
    process.exit(1);
  }
}

addMoreEmployees();