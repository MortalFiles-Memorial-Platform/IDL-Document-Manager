import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        password: bcrypt.hashSync('admin', 10)
      }
    });
    console.log('Created default admin account: admin / admin');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
