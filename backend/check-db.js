const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database structure...');

db.all("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Users table columns:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  }
  
  // Check if email verification columns exist
  const hasEmailVerified = rows.some(row => row.name === 'isEmailVerified');
  const hasVerificationCode = rows.some(row => row.name === 'emailVerificationCode');
  const hasVerificationExpires = rows.some(row => row.name === 'emailVerificationExpires');
  
  console.log('\nEmail verification columns:');
  console.log(`- isEmailVerified: ${hasEmailVerified ? 'EXISTS' : 'MISSING'}`);
  console.log(`- emailVerificationCode: ${hasVerificationCode ? 'EXISTS' : 'MISSING'}`);
  console.log(`- emailVerificationExpires: ${hasVerificationExpires ? 'EXISTS' : 'MISSING'}`);
  
  if (!hasEmailVerified || !hasVerificationCode || !hasVerificationExpires) {
    console.log('\n⚠️  MISSING COLUMNS! You need to add these columns to your database:');
    console.log('ALTER TABLE users ADD COLUMN isEmailVerified BOOLEAN NOT NULL DEFAULT 0;');
    console.log('ALTER TABLE users ADD COLUMN emailVerificationCode TEXT;');
    console.log('ALTER TABLE users ADD COLUMN emailVerificationExpires DATETIME;');
  }
  
  db.close();
}); 