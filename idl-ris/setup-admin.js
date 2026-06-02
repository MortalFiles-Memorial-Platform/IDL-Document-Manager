const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" text NOT NULL UNIQUE,
    "password" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "role" text NOT NULL DEFAULT 'SALES',
    "isActive" integer NOT NULL DEFAULT 1,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Customer" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" text NOT NULL,
    "contactEmail" text NOT NULL,
    "phone" text NOT NULL,
    "address" text NOT NULL,
    "tin" text,
    "notes" text,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" text NOT NULL,
    "contactEmail" text NOT NULL,
    "phone" text NOT NULL,
    "address" text NOT NULL,
    "tin" text,
    "notes" text,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "InventoryItem" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "category" text NOT NULL,
    "unit" text NOT NULL,
    "unitPrice" real NOT NULL,
    "quantity" integer NOT NULL,
    "reorderLevel" integer NOT NULL DEFAULT 5,
    "location" text NOT NULL,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Expense" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" text NOT NULL UNIQUE,
    "category" text NOT NULL,
    "amount" real NOT NULL,
    "date" datetime NOT NULL,
    "paidBy" text NOT NULL,
    "status" text NOT NULL DEFAULT 'PENDING',
    "notes" text,
    "createdById" integer NOT NULL,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
  );

  CREATE TABLE IF NOT EXISTS "Document" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "docType" text NOT NULL,
    "reference" text NOT NULL UNIQUE,
    "customerId" integer,
    "supplierId" integer,
    "issueDate" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" datetime,
    "status" text NOT NULL DEFAULT 'OPEN',
    "approvalStatus" text NOT NULL DEFAULT 'DRAFT',
    "currency" text NOT NULL DEFAULT 'NGN',
    "totalAmount" real NOT NULL,
    "vatAmount" real NOT NULL,
    "discountAmount" real NOT NULL,
    "amountPaid" real NOT NULL,
    "balanceDue" real NOT NULL,
    "transactionStatus" text NOT NULL,
    "signedBy" text,
    "customerSignatureUrl" text,
    "documentUrl" text,
    "qrCodeData" text,
    "createdById" integer NOT NULL,
    "approvedById" integer,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id"),
    FOREIGN KEY ("createdById") REFERENCES "User"("id"),
    FOREIGN KEY ("approvedById") REFERENCES "User"("id")
  );

  CREATE TABLE IF NOT EXISTS "DocumentLineItem" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentId" integer NOT NULL,
    "description" text NOT NULL,
    "quantity" integer NOT NULL,
    "unit" text NOT NULL,
    "unitPrice" real NOT NULL,
    "discount" real NOT NULL,
    "vat" real NOT NULL,
    "total" real NOT NULL,
    FOREIGN KEY ("documentId") REFERENCES "Document"("id")
  );

  CREATE TABLE IF NOT EXISTS "Loan" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "borrower" text NOT NULL,
    "principal" real NOT NULL,
    "outstanding" real NOT NULL,
    "interestRate" real NOT NULL,
    "currency" text NOT NULL DEFAULT 'NGN',
    "dueDate" datetime NOT NULL,
    "status" text NOT NULL DEFAULT 'ACTIVE',
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "LoanRepayment" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loanId" integer NOT NULL,
    "amount" real NOT NULL,
    "paidAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptRef" text NOT NULL,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("loanId") REFERENCES "Loan"("id")
  );

  CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" text NOT NULL,
    "entity" text NOT NULL,
    "entityId" integer,
    "userId" integer,
    "timestamp" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" text,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
  );
`);

// Setup admin user
const adminEmail = 'interiorductltd@gmail.com';
const adminPassword = 'idL1008300#';
const hashedPassword = bcrypt.hashSync(adminPassword, 10);

const existingAdmin = db.prepare('SELECT * FROM "User" WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  db.prepare(`
    INSERT INTO "User" (email, password, firstName, lastName, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminEmail, hashedPassword, 'Admin', 'User', 'ADMIN');
  console.log(`✓ Created admin account: ${adminEmail} / ${adminPassword}`);
} else {
  // Update existing user's password
  db.prepare('UPDATE "User" SET password = ? WHERE email = ?').run(hashedPassword, adminEmail);
  console.log(`✓ Updated admin account: ${adminEmail} / ${adminPassword}`);
}

db.close();
console.log('✓ Database setup complete');
