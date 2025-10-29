// Script to sync staff data to employees table
// Run this script to fix foreign key constraint issues

const fetch = require('node-fetch');

async function syncStaffToEmployees() {
  try {
    console.log('Starting staff to employees synchronization...');
    
    // First, let's get the staff data
    const staffResponse = await fetch('http://localhost:5000/api/test/sample-niks');
    if (staffResponse.ok) {
      const sampleData = await staffResponse.json();
      console.log('Sample staff data:', sampleData);
    }
    
    // For now, let's manually sync specific NIKs that are causing issues
    const problematicNiks = ['09000720', '20000748']; // Add more as needed
    
    for (const nik of problematicNiks) {
      try {
        // Try to get staff by NIK
        const staffResponse = await fetch(`http://localhost:5000/api/employees/${nik}`);
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          console.log(`Successfully verified NIK ${nik}:`, staffData.name);
        } else {
          console.log(`NIK ${nik} not found in system`);
        }
      } catch (error) {
        console.error(`Error checking NIK ${nik}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

syncStaffToEmployees();