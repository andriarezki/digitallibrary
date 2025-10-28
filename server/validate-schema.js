// Database Schema Validation Script
// This script checks which tables and columns exist on the server database
// Run this on your server to identify schema differences

const mysql = require('mysql2/promise');

async function validateSchema() {
  console.log('=== DATABASE SCHEMA VALIDATION ===\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Add your server's MySQL password
    database: 'projek_perpus', // Your server database name
  });

  try {
    console.log('✅ Database connection successful\n');

    // Check if tables exist
    console.log('📋 CHECKING TABLES:');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'projek_perpus'
      ORDER BY TABLE_NAME
    `);
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    console.log('Tables found:', tableNames.join(', '));
    console.log();

    // Check tbl_buku columns specifically
    console.log('📖 CHECKING TBL_BUKU COLUMNS:');
    const [bukuColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'projek_perpus' AND TABLE_NAME = 'tbl_buku'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('tbl_buku columns:');
    bukuColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log();

    // Check for analytics tables
    console.log('📊 CHECKING ANALYTICS TABLES:');
    const analyticsTableCheck = [
      'tbl_user_activity',
      'tbl_pdf_views', 
      'tbl_site_visitors'
    ];
    
    for (const table of analyticsTableCheck) {
      const exists = tableNames.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table} ${exists ? 'exists' : 'missing'}`);
    }
    console.log();

    // Check tbl_rak structure
    console.log('📍 CHECKING TBL_RAK COLUMNS:');
    const [rakColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'projek_perpus' AND TABLE_NAME = 'tbl_rak'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('tbl_rak columns:');
    rakColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateSchema().catch(console.error);
}

module.exports = { validateSchema };