// prisma/seed.mjs
// Populates the database with a demo user + notification settings + three
// monitors (one healthy, one HTTP error, one unreachable).
//
// Run with:  npm run db:seed
//            (equivalent: node --env-file=.env prisma/seed.mjs)
//
// Idempotent: safe to run multiple times.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.SEED_EMAIL ?? 'demo@sitepulse.dev';
  const password = await bcrypt.hash('password123', 12);

  // 1. Demo user (password: password123)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Demo User', password },
  });
  console.log(`User ready: ${user.email} (id ${user.id})`);

  // 2. Notification settings — one row per user (rule C)
  await prisma.notificationSetting.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  console.log('Notification settings ready (defaults).');

  // 3. Monitors
  const monitors = [
    {
      name: 'Google (healthy)',
      url: 'https://www.google.com',
      checkIntervalSeconds: 60,
      timeoutMs: 5000,
      description: 'یک هدف سالم برای بررسی موفق',
    },
    {
      name: 'HTTP 404 target',
      url: 'https://example.com/definitely-missing',
      checkIntervalSeconds: 300,
      timeoutMs: 5000,
      description: 'HTTP 404 می‌دهد تا خطای HTTP تمرین شود',
    },
    {
      name: 'Unreachable host',
      url: 'https://nonexistent-host.invalid',
      checkIntervalSeconds: 1800,
      timeoutMs: 3000,
      description: 'هاست غیرقابل‌دسترس برای خطای اتصال',
    },
  ];

  for (const m of monitors) {
    const existing = await prisma.monitor.findFirst({
      where: { userId: user.id, name: m.name },
    });
    if (existing) {
      console.log(`Monitor already exists: ${m.name}`);
      continue;
    }
    const created = await prisma.monitor.create({
      data: { userId: user.id, ...m },
    });
    console.log(`Created monitor: ${created.name} → ${created.url}`);
  }

  console.log(
    '\nSeed complete. Run `npm run start:dev` and the scheduler will start checking.',
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
