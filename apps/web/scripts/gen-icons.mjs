// Zero-dep PWA icon generator (node builtins only). Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.from(type); const cr = Buffer.alloc(4);
  cr.writeUInt32BE(crc(Buffer.concat([td, data])));
  return Buffer.concat([len, td, data, cr]);
}
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const GREEN = [22, 163, 74, 255], WHITE = [255, 255, 255, 255];
function draw(size, maskable) {
  const px = Buffer.alloc(size * size * 4);
  const put = (x, y, c) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    px.set(c, (y * size + x) * 4);
  };
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = Math.max(0, y0); y < Math.min(size, y1); y++)
      for (let x = Math.max(0, x0); x < Math.min(size, x1); x++) put(x, y, c);
  };
  const circle = (cx, cy, r, c) => {
    for (let y = Math.floor(cy - r); y <= cy + r; y++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(x, y, c);
  };
  rect(0, 0, size, size, GREEN); // full-bleed trust green
  const s = size / 512; // design grid
  const cx = size / 2;
  if (maskable) {
    // centered white tile inside safe zone (66% of canvas)
    const t = size * 0.17, b = size * 0.83;
    rect(t, t, b, b, WHITE);
    // green house glyph inside tile
    const hx0 = size * 0.32, hx1 = size * 0.68, hy0 = size * 0.48, hy1 = size * 0.72;
    rect(hx0, hy0, hx1, hy1, GREEN);
    for (let y = size * 0.34; y < hy0; y++) { // roof triangle
      const w = ((y - size * 0.34) / (hy0 - size * 0.34)) * (size * 0.22);
      rect(cx - w, y, cx + w, y + 1, GREEN);
    }
    rect(size * 0.47, size * 0.58, size * 0.53, hy1, WHITE); // door
  } else {
    // white house glyph directly
    const hy0 = size * 0.46, hy1 = size * 0.74;
    rect(size * 0.28, hy0, size * 0.72, hy1, WHITE);
    for (let y = size * 0.28; y < hy0; y++) {
      const w = ((y - size * 0.28) / (hy0 - size * 0.28)) * (size * 0.26);
      rect(cx - w, y, cx + w, y + 1, WHITE);
    }
    circle(cx, size * 0.40, size * 0.045, WHITE); // sun/dot accent
    rect(size * 0.46, size * 0.60, size * 0.54, hy1, GREEN); // door
  }
  return png(size, size, px);
}
mkdirSync(new URL('../public/icons', import.meta.url), { recursive: true });
const out = (n, b) => { writeFileSync(new URL('../public/icons/' + n, import.meta.url), b); console.log(n, b.length + 'B'); };
out('icon-192.png', draw(192, false));
out('icon-512.png', draw(512, false));
out('maskable-512.png', draw(512, true));
out('apple-touch-icon.png', draw(180, false));
