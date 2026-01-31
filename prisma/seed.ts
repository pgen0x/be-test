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

  console.log('Cleaning up existing data...');
  await prisma.withdraw.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.user.deleteMany({ where: { NOT: { email: { in: ['admin@test.com', 'user@test.com'] } } } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      username: 'Admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'Active',
      isKycVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      username: 'User',
      firstName: 'John',
      lastName: 'Doe',
      password: userPassword,
      role: 'USER',
      status: 'Active',
      isKycVerified: false,
    },
  });

  console.log('Seed data created:');
  console.log({ admin: admin.email, user: user.email });

  // Create real mock data for stats
  const years = [2023, 2024];
  const months = Array.from({ length: 12 }, (_, i) => i);

  console.log("Generating mock stats data for 2023 and 2024...");

  for (const year of years) {
    for (const month of months) {
      // Create some users for this month
      const userCount = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < userCount; i++) {
        await prisma.user.create({
          data: {
            email: `user_${year}_${month + 1}_${i}@example.com`,
            username: `User_${year}_${month + 1}_${i}`,
            firstName: `User${i}`,
            lastName: `${month + 1}_${year}`,
            password: userPassword,
            status: Math.random() > 0.1 ? 'Active' : 'Suspended',
            isKycVerified: Math.random() > 0.5,
            createdAt: new Date(year, month, Math.floor(Math.random() * 28) + 1),
          },
        });
      }

      // Create some deposits for this month
      const depositCount = Math.floor(Math.random() * 8) + 3;
      for (let i = 0; i < depositCount; i++) {
        const amount = (Math.floor(Math.random() * 100) + 1) * 50000;
        const isBtc = Math.random() > 0.8;
        const asset = isBtc ? 'BTC' : 'IDR';
        const amountDisplay = isBtc ? Number((amount / 500000000).toFixed(8)) : amount;
        
        await prisma.deposit.create({
          data: {
            depositId: `DEPO-${asset}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            asset,
            amount: amountDisplay,
            amountNett: amountDisplay,
            status: Math.random() > 0.2 ? 'SUCCESS' : 'REJECTED',
            userId: user.id,
            createdAt: new Date(year, month, Math.floor(Math.random() * 28) + 1),
          },
        });
      }

      // Create some withdraws for this month
      const withdrawCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < withdrawCount; i++) {
        const amount = (Math.floor(Math.random() * 100) + 2) * 10000;
        const asset = 'IDR';
        await prisma.withdraw.create({
          data: {
            withdrawId: `WITH-${asset}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            asset,
            amount,
            amountNett: amount,
            status: 'SUCCESS',
            userId: user.id,
            createdAt: new Date(year, month, Math.floor(Math.random() * 28) + 1),
          },
        });
      }
    }
  }

  console.log("Mock analytics data seeded successfully.");
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
