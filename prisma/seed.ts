import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await Bun.password.hash('admin123', {
    algorithm: 'bcrypt',
    cost: 10,
  });

  const userPassword = await Bun.password.hash('user123', {
    algorithm: 'bcrypt',
    cost: 10,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN',
      isKycVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: userPassword,
      role: 'USER',
      isKycVerified: false,
    },
  });

  console.log('Seed data created:');
  console.log({ admin: admin.email, user: user.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
