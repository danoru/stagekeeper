import { PrismaClient } from "@prisma/client";

import { MUSICALS_LIST } from "../src/data/musicals";
import { THEATRES_LIST } from "../src/data/theatres";

const prisma = new PrismaClient();

async function main() {
  await prisma.musicals.createMany({
    data: MUSICALS_LIST,
    skipDuplicates: true,
  });
  await prisma.theatres.createMany({
    data: THEATRES_LIST,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
