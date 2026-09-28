const sharp = require('sharp');
const path = require('path');

async function findWholeSeeds() {
  const jarPath = path.join(__dirname, '../public/img/hero-clean-jar.png');
  const { data, info } = await sharp(jarPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // We want to find disjoint connected components of alpha > 20
  const visited = new Uint8Array(w * h);
  const components = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (visited[idx] || data[idx * 4 + 3] <= 20) continue;

      // BFS to find component
      const queue = [idx];
      visited[idx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let count = 0;

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        count++;
        const cy = Math.floor(curr / w);
        const cx = curr % w;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          cy > 0 ? (cy - 1) * w + cx : -1,
          cy < h - 1 ? (cy + 1) * w + cx : -1,
          cx > 0 ? cy * w + (cx - 1) : -1,
          cx < w - 1 ? cy * w + (cx + 1) : -1,
        ];

        for (const n of neighbors) {
          if (n !== -1 && !visited[n] && data[n * 4 + 3] > 20) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      // If it's a seed (not the massive jar in the center, and not tiny noise)
      if (count > 800 && count < 35000) {
        components.push({
          count,
          minX, maxX, minY, maxY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          touchesBorder: minX === 0 || maxX === w - 1 || minY === 0 || maxY === h - 1
        });
      }
    }
  }

  console.log('Found whole seed components:', components.filter(c => !c.touchesBorder));
}

findWholeSeeds().catch(console.error);
