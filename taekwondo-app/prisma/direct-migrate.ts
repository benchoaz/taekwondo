import { Client } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  console.log('Connected to database.');

  // Find members with non-null weight/height/waist
  const result = await client.query(`
    SELECT id, weight, height, waist_circum as "waistCircum", "createdAt"
    FROM "Member"
    WHERE weight IS NOT NULL OR height IS NOT NULL OR waist_circum IS NOT NULL;
  `);

  console.log(`Found ${result.rows.length} members to migrate.`);

  for (const row of result.rows) {
    const check = await client.query(`SELECT id FROM "PhysicalMeasurementLog" WHERE member_id = $1`, [row.id]);
    if (check.rows.length === 0) {
      // Insert
      await client.query(`
        INSERT INTO "PhysicalMeasurementLog" (id, member_id, weight, height, waist_circum, recorded_at, notes)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
      `, [row.id, row.weight, row.height, row.waistCircum, row.createdAt, 'Migrated from static member data']);
      console.log(`Migrated member ${row.id}`);
    }
  }

  await client.end();
  console.log('Migration complete.');
}

main().catch(console.error);
