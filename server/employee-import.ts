// Employee Import Utility for Excel Data
// This utility helps you import employee data from Excel into the loans system

import fs from 'fs';
import path from 'path';
import { storage } from './storage.js';

interface ExcelEmployeeRow {
  NIK: string;
  Name: string;
  Email?: string;
  Phone?: string;
  Department?: string;
  Position?: string;
}

export async function importEmployeesFromCSV(csvFilePath: string): Promise<{ success: number; errors: string[] }> {
  try {
    // Read CSV file (you can use libraries like 'csv-parser' or 'fast-csv' for better parsing)
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const employees = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < 2) {
        errors.push(`Line ${i + 1}: Insufficient data`);
        continue;
      }

      const employee = {
        nik: values[0],
        name: values[1],
        email: values[2] || null,
        phone: values[3] || null,
        department: values[4] || null,
        position: values[5] || null,
        status: 'active' as const
      };

      if (!employee.nik || !employee.name) {
        errors.push(`Line ${i + 1}: NIK and Name are required`);
        continue;
      }

      employees.push(employee);
    }

    if (employees.length === 0) {
      return { success: 0, errors: ['No valid employee data found'] };
    }

    // Import to database
    const result = await storage.importEmployees(employees);
    return result;

  } catch (error) {
    console.error('Error importing employees:', error);
    return { success: 0, errors: [`Import failed: ${error}`] };
  }
}

// Sample function to create CSV template
export function createEmployeeTemplate(outputPath: string = './employee_template.csv'): void {
  const template = `NIK,Name,Email,Phone,Department,Position
EMP001,John Doe,john.doe@company.com,081234567890,IT,Software Developer
EMP002,Jane Smith,jane.smith@company.com,081234567891,HR,HR Manager
EMP003,Bob Johnson,bob.johnson@company.com,081234567892,Finance,Accountant
EMP004,Alice Wilson,alice.wilson@company.com,081234567893,Marketing,Marketing Specialist
EMP005,Charlie Brown,charlie.brown@company.com,081234567894,Operations,Operations Manager`;

  fs.writeFileSync(outputPath, template);
  console.log(`Employee template created at: ${outputPath}`);
  console.log('Fill in your employee data and use importEmployeesFromCSV() to import');
}

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'template') {
    createEmployeeTemplate();
  } else if (command === 'import' && process.argv[3]) {
    importEmployeesFromCSV(process.argv[3])
      .then(result => {
        console.log(`Import completed: ${result.success} successful`);
        if (result.errors.length > 0) {
          console.log('Errors:', result.errors);
        }
      })
      .catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  npx tsx employee-import.ts template          # Create CSV template');
    console.log('  npx tsx employee-import.ts import file.csv   # Import from CSV');
  }
}