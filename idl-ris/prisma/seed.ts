import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with predefined data...');

  // Hash password for all users
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Clear existing data
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.supplier.deleteMany({});

  // Create users for each role/department
  const users = [
    {
      email: 'admin@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Admin',
      role: 'ADMIN',
    },
    {
      email: 'finance@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Finance',
      role: 'FINANCE',
    },
    {
      email: 'accounts@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Accounts',
      role: 'FINANCE',
    },
    {
      email: 'sales@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Sales',
      role: 'SALES',
    },
    {
      email: 'inventory@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Procurement',
      role: 'PROCUREMENT',
    },
    {
      email: 'maintenance@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Procurement',
      role: 'PROCUREMENT',
    },
    {
      email: 'auditor@idl.ng',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Auditor',
      role: 'AUDITOR',
    },
  ];

  for (const user of users) {
    const created = await prisma.user.create({
      data: user,
    });
    console.log(`✓ Created user: ${created.email} (${created.role})`);
  }

  // Create sample customers
  const customers = [
    {
      name: 'ABC Enterprises Ltd',
      contactEmail: 'abc@example.com',
      phone: '+234 803 456 7890',
      address: '123 Marina Street, Lagos, Nigeria',
      tin: 'TIN001',
    },
    {
      name: 'XYZ Manufacturing Co',
      contactEmail: 'xyz@example.com',
      phone: '+234 704 567 8901',
      address: '456 Island Road, Ikoyi, Lagos',
      tin: 'TIN002',
    },
    {
      name: 'Tech Solutions Nigeria',
      contactEmail: 'tech@example.com',
      phone: '+234 805 678 9012',
      address: '789 Business Park, Lekki, Lagos',
      tin: 'TIN003',
    },
  ];

  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: customer,
    });
    console.log(`✓ Created customer: ${created.name}`);
  }

  // Create sample suppliers
  const suppliers = [
    {
      name: 'Global Supplies Ltd',
      contactEmail: 'global@example.com',
      phone: '+234 806 789 0123',
      address: '321 Trade Zone, Ajah, Lagos',
      tin: 'SUPP001',
    },
    {
      name: 'Local Materials Ltd',
      contactEmail: 'local@example.com',
      phone: '+234 707 890 1234',
      address: '654 Industrial Area, Ilupeju, Lagos',
      tin: 'SUPP002',
    },
  ];

  for (const supplier of suppliers) {
    const created = await prisma.supplier.create({
      data: supplier,
    });
    console.log(`✓ Created supplier: ${created.name}`);
  }

  console.log('\n✅ Seeding completed!');
  console.log('\n📋 LOGIN CREDENTIALS:\n');
  console.log('Role'.padEnd(15) + ' | ' + 'Email'.padEnd(20) + ' | Password');
  console.log('-'.repeat(60));
  users.forEach(user => {
    console.log(user.role.padEnd(15) + ' | ' + user.email.padEnd(20) + ' | password123');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

