const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.lmdmramybunlpjhfepbh:t43Kwond01%23Kraksa4n@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT full_name, current_belt FROM "Member" WHERE member_number = \'TKD-2026-0089\'');
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
