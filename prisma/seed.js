const { PrismaClient } = require("@prisma/client");
const products = require("./products.json");

const db = new PrismaClient();

async function main() {
  for (const product of products) {
    await db.product.create({ data: product });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
