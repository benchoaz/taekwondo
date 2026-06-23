const sharp = require('sharp');

async function main() {
  const metadata = await sharp('public/logo.png').metadata();
  
  // We want to crop to the center tiger face
  // The tiger is roughly in the middle, and we'll crop the top and bottom text out.
  // The aspect ratio of the tiger is roughly square.
  const size = Math.min(metadata.width, metadata.height * 0.6); // 60% of height should safely cut off top/bottom text
  const x = Math.round((metadata.width - size) / 2);
  const y = Math.round((metadata.height - size) / 2);
  
  await sharp('public/logo.png')
    .extract({ left: x, top: y, width: Math.round(size), height: Math.round(size) })
    .resize(256, 256)
    .toFile('src/app/icon.png');
    
  console.log('Successfully cropped and created src/app/icon.png');
}

main().catch(console.error);
