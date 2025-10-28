#!/usr/bin/env node

// Simple deployment test script
// Run this on your server to check compatibility and fix common issues

const fs = require('fs');
const path = require('path');

console.log('🚀 DIGITAL LIBRARY - SERVER DEPLOYMENT TEST');
console.log('==========================================\n');

async function deploymentTest() {
  try {
    // Step 1: Check if we're in the right directory
    console.log('📁 Checking project structure...');
    const requiredFiles = [
      'package.json',
      'shared/schema.ts',
      'server/index.ts',
      'server/storage.ts'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${file} found`);
      } else {
        console.log(`  ❌ ${file} missing`);
        return;
      }
    }

    // Step 2: Test database connection
    console.log('\n🗄️  Testing database connection...');
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // You'll need to update this
        database: 'projek_perpus'
      });
      
      console.log('  ✅ Database connection successful');
      await connection.end();
    } catch (dbError) {
      console.log('  ❌ Database connection failed:', dbError.message);
      console.log('  💡 Update database credentials in server/db.ts');
      return;
    }

    // Step 3: Check for schema compatibility issues
    console.log('\n🔍 Checking for known compatibility issues...');
    
    const schemaContent = fs.readFileSync('shared/schema.ts', 'utf8');
    
    if (schemaContent.includes('file_type')) {
      console.log('  ⚠️  file_type field found in schema - this might cause errors');
      console.log('  💡 Consider using shared/schema-server-compatible.ts');
    } else {
      console.log('  ✅ file_type field properly removed');
    }

    if (schemaContent.includes('department')) {
      console.log('  ⚠️  department field found in schema - check if this column exists on server');
    }

    // Step 4: Offer to apply compatibility fixes
    console.log('\n🔧 Would you like to apply server compatibility fixes?');
    console.log('This will:');
    console.log('  - Backup current schema.ts');
    console.log('  - Replace with server-compatible version');
    console.log('  - Remove problematic fields');

    // For now, just provide instructions
    console.log('\n📋 MANUAL STEPS TO FIX COMPATIBILITY:');
    console.log('1. Backup your current files:');
    console.log('   cp shared/schema.ts shared/schema-backup.ts');
    console.log('');
    console.log('2. Use server-compatible schema:');
    console.log('   cp shared/schema-server-compatible.ts shared/schema.ts');
    console.log('');
    console.log('3. Update database connection in server/db.ts:');
    console.log('   - Set correct password');
    console.log('   - Verify database name');
    console.log('');
    console.log('4. Test the application:');
    console.log('   npm run dev');
    console.log('   curl http://localhost:5000/api/books');

    console.log('\n✨ Deployment test complete!');

  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
  }
}

// Run the test
deploymentTest();