const sharp = require('sharp');
const path = require('path');

async function main() {
  const jarPath = path.join(__dirname, '../public/img/hero-clean-jar.png');
  const trufflePath = path.join(__dirname, '../public/img/makhana-prod-truffle.png');
  const outPath = path.join(__dirname, '../public/img/hero-clean-canister.png');

  // 1: Top seed
  const sTop = await sharp(jarPath)
    .extract({ left: 574, top: 34, width: 108, height: 101 })
    .toBuffer();

  // 2: Top-right seed
  const sTopRight = await sharp(jarPath)
    .extract({ left: 749, top: 189, width: 92, height: 103 })
    .toBuffer();

  // 3: Mid-right seed
  const sMidRight = await sharp(jarPath)
    .extract({ left: 844, top: 320, width: 96, height: 100 })
    .toBuffer();

  // 4: Left-upper seed
  const sLeftUpper = await sharp(jarPath)
    .extract({ left: 108, top: 328, width: 126, height: 134 })
    .toBuffer();

  // 5: Left-mid seed
  const sLeftMid = await sharp(jarPath)
    .extract({ left: 191, top: 501, width: 86, height: 87 })
    .toBuffer();

  // 6: Bottom-right clean isolated seed (minX: 865, minY: 803, width: 91, height: 79)
  const sBottomRight = await sharp(jarPath)
    .extract({ left: 864, top: 802, width: 93, height: 81 })
    .toBuffer();

  // Resize canister to fit beautifully centered in 1024x1024
  const canisterResized = await sharp(trufflePath)
    .resize(720, 720, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Composite all whole seeds around canister with 100% transparent background
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: canisterResized, top: 160, left: 152 },
    { input: sTop, top: 60, left: 490 },
    { input: sTopRight, top: 150, left: 770 },
    { input: sMidRight, top: 350, left: 830 },
    { input: sLeftUpper, top: 260, left: 80 },
    { input: sLeftMid, top: 480, left: 110 },
    { input: sBottomRight, top: 600, left: 800 },
  ])
  .png()
  .toFile(outPath);

  console.log('Cleaned canister created with 100% flawless seeds!');
}

main().catch(console.error);
