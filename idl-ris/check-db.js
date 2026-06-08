const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('=== Users ===');
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
    
    const customers = await prisma.customer.findMany();
    console.log('\n=== Customers ===');
    customers.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}`));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
