import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting password hashing migration...");

  const users = await prisma.user.findMany();
  let updatedCount = 0;

  for (const user of users) {
    // Only hash if password exists and doesn't look like a bcrypt hash (length 60 and starts with $)
    if (user.password && !(user.password.startsWith("$2") && user.password.length === 60)) {
      console.log(`Hashing password for user: ${user.email} (current: ${user.password})`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      updatedCount++;
    } else if (user.password) {
      console.log(`User ${user.email} password already hashed. Skipping.`);
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} users.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
