import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin' },
      timeout: 5000,
    }).catch(() => null);

    if (!existingUser) {
      console.log('Creating admin user...');
      const admin = await prisma.user.create({
        data: {
          email: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          password: bcrypt.hashSync('admin', 10)
        }
      });
      console.log('Created admin: admin / admin');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
