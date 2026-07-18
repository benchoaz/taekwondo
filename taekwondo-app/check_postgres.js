const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const user = await client.query("SELECT * FROM \"User\" WHERE username = 'londokacang' OR email = 'londokacang@taekwondo.local'");
  console.log("USER:", user.rows);
  if (user.rows.length > 0) {
    const member = await client.query("SELECT * FROM \"Member\" WHERE user_id = $1", [user.rows[0].id]);
    console.log("MEMBER:", member.rows);
  }
  await client.end();
}
main().catch(console.error);
