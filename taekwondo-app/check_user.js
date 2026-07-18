const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const userRes = await client.query('SELECT id, username, email, role FROM "User" WHERE username = \'londokacang\' OR email = \'londokacang\'');
  console.log("USER:", userRes.rows);
  if (userRes.rows.length > 0) {
    const memberRes = await client.query('SELECT id, "full_name", status, "member_number" FROM "Member" WHERE "user_id" = $1', [userRes.rows[0].id]);
    console.log("MEMBER:", memberRes.rows);
  }
  await client.end();
}
main().catch(console.error);
