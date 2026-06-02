const fs = require('fs');
const path = require('path');

// Ensure dev.db doesn't exist
const dbPath = path.join(__dirname, 'dev.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

console.log('Database file cleaned. Ready for Prisma to create fresh schema.');
