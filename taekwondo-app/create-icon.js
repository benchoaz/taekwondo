const sharp = require('sharp');

async function main() {
  await sharp('public/hero-tiger-solo.png')
    .resize(256, 256, { fit: 'cover' })
    .toFile('src/app/icon.png');
    
  console.log('Successfully resized hero-tiger-solo.png to src/app/icon.png');
}

main().catch(console.error);
