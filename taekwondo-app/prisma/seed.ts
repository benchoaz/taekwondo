import { seedDatabase } from '../src/lib/seed';

async function main() {
  await seedDatabase();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
