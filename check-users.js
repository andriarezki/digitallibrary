import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'projek_perpus',
      port: 3306
    });

    console.log('Connected to database successfully');
    
    const [rows] = await connection.execute('SELECT id_login, user, pass, level, nama FROM tbl_login');
    
    console.log('Users in database:');
    console.log('==================');
    rows.forEach(user => {
      console.log(`ID: ${user.id_login}`);
      console.log(`Username: ${user.user}`);
      console.log(`Password: ${user.pass}`);
      console.log(`Level: ${user.level}`);
      console.log(`Name: ${user.nama}`);
      console.log('---');
    });
    
    await connection.end();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

checkUsers();