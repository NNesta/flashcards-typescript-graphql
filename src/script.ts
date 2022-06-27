import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newCategory = await prisma.category.create({
    data: {
      description:
        'Which occupation did John Tanner, the main protagonist for Driver and Driver 2, had before turning into an undercover cop?',
      name: 'Racing Driver',
    },
  });
  const allCategories = await prisma.category.findMany();
  console.log(newCategory)
  console.log(allCategories);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
