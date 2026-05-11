import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user first
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_2XXXXX' },
    update: {},
    create: {
      clerkId: 'user_2XXXXX',
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Create a test project
  await prisma.project.upsert({
    where: { id: 'test-project-1' },
    update: {},
    create: {
      id: 'test-project-1',
      name: 'Test Project',
      description: 'This is a test project for development',
      userId: user.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
