const sharp = require('sharp');
async function run() {
  const meta = await sharp('public/hero-tiger-solo.png').metadata();
  console.log(meta);
}
run();
