const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Update admin password
const hashedPassword = bcrypt.hashSync('idL1008300#', 10);
db.prepare('UPDATE "User" SET password = ? WHERE email = ?').run(hashedPassword, 'admin');

console.log('✓ Updated admin password to: idL1008300#');
db.close();
