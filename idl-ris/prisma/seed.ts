import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with predefined users...');

  // Hash password "password123" for all users
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Clear existing users
  await prisma.user.deleteMany({});

  // Create users for each role/department
  const users = [
    {
      email: 'admin@idl.ng',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
    {
      email: 'finance@idl.ng',
      password: hashedPassword,
      firstName: 'Chioma',
      lastName: 'Okafor',
      role: 'FINANCE',
    },
    {
      email: 'accounts@idl.ng',
      password: hashedPassword,
      firstName: 'Emeka',
      lastName: 'Eze',
      role: 'FINANCE',
    },
    {
      email: 'sales@idl.ng',
      password: hashedPassword,
      firstName: 'Tunde',
      lastName: 'Akerele',
      role: 'SALES',
    },
    {
      email: 'inventory@idl.ng',
      password: hashedPassword,
      firstName: 'Folake',
      lastName: 'Adeyemi',
      role: 'PROCUREMENT',
    },
    {
      email: 'maintenance@idl.ng',
      password: hashedPassword,
      firstName: 'Ibrahim',
      lastName: 'Hassan',
      role: 'PROCUREMENT',
    },
    {
      email: 'auditor@idl.ng',
      password: hashedPassword,
      firstName: 'Ngozi',
      lastName: 'Ifeoma',
      role: 'AUDITOR',
    },
  ];

  for (const user of users) {
    const created = await prisma.user.create({
      data: user,
    });
    console.log(`✓ Created user: ${created.email} (${created.role})`);
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
