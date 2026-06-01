import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@interiorduct.com' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: 'admin@interiorduct.com',
        firstName: 'Interior',
        lastName: 'Duct',
        role: 'ADMIN',
        password: bcrypt.hashSync('Admin123!', 10)
      }
    });
    console.log('Created default admin account: admin@interiorduct.com / Admin123!');
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
