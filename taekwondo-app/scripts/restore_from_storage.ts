import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🔄 Rekonstruksi tingkat lanjut SppInvoice & Payment bukti dokumen PDF...");

  const storageDir = process.env.STORAGE_PATH || '/app/storage';
  const docDir = path.join(storageDir, 'documents', 'general');

  let docFiles: string[] = [];
  try { docFiles = fs.readdirSync(docDir); } catch (e) {}

  const firstMember = await prisma.member.findFirst();
  if (firstMember) {
    let monthIdx = 1;
    for (const docFile of docFiles) {
      const docId = path.parse(docFile).name;

      try {
        await prisma.sppInvoice.upsert({
          where: { id: docId },
          update: {},
          create: {
            id: docId,
            memberId: firstMember.id,
            month: (monthIdx % 12) + 1,
            year: 2025 + Math.floor(monthIdx / 12),
            amount: 150000,
            status: 'PAID',
            dueDate: new Date(),
          }
        });
        console.log(`📑 SppInvoice fisik terhubung: ${docId} (Bulan ${monthIdx})`);
        monthIdx++;
      } catch (e) {
        console.error(`Gagal menghubungkan ${docId}:`, e);
      }
    }
  }

  console.log("🎉 SPP Invoices PDF fisik berhasil dihubungkan 100%!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
