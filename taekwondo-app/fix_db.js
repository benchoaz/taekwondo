import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres.lmdmramybunlpjhfepbh:t43Kwond01%23Kraksa4n@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  await client.connect();
  const res1 = await client.query('UPDATE "Member" SET "current_belt" = $1 WHERE "current_belt" = $2', ['Sabuk Merah (2 Geup)', 'Sabuk Sabuk Merah (2 Geup)']);
  console.log('Fixed Belts:', res1.rowCount);
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const res2 = await client.query('DELETE FROM "DailyQuestLog" WHERE "assignedAt" >= $1 AND "assignedAt" < $2', [today, tomorrow]);
  console.log('Deleted QuestLogs:', res2.rowCount);
  await client.end();
}
run().catch(console.error);
