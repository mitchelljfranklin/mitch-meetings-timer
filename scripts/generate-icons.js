import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestDir = join(__dirname, "..", "manifest");

const ACCENT = [98, 100, 167];

function crc32(data) {
  let crc = 0xffffffff;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = crc32(typeAndData);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function writePng(size, filePath, pixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;

  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(Buffer.from([0]));
    const row = Buffer.alloc(size * 4);
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x + 0.5, y + 0.5, size);
      row[x * 4] = r;
      row[x * 4 + 1] = g;
      row[x * 4 + 2] = b;
      row[x * 4 + 3] = a;
    }
    rawRows.push(row);
  }
  const compressed = deflateSync(Buffer.concat(rawRows), { level: 9 });

  const png = Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);

  writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${size}x${size})`);
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = clamp01(t);
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function clockCoverage(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.4;
  const t = Math.max(size * 0.075, 1.5);
  const d = Math.hypot(x - cx, y - cy);

  const ringEdge = Math.max(d - R, R - t - d);
  let cov = clamp01(0.5 - ringEdge);

  const minuteHand =
    distToSegment(x, y, cx, cy, cx, cy - R * 0.72) - Math.max(size * 0.028, 1);
  cov = Math.max(cov, clamp01(0.5 - minuteHand));

  const hourHand =
    distToSegment(x, y, cx, cy, cx + R * 0.46, cy) - Math.max(size * 0.034, 1);
  cov = Math.max(cov, clamp01(0.5 - hourHand));

  const pivot = d - size * 0.045;
  cov = Math.max(cov, clamp01(0.5 - pivot));

  return cov;
}

function colorPixel(x, y, size) {
  const cov = clockCoverage(x, y, size);
  const r = Math.round(ACCENT[0] + (255 - ACCENT[0]) * cov);
  const g = Math.round(ACCENT[1] + (255 - ACCENT[1]) * cov);
  const b = Math.round(ACCENT[2] + (255 - ACCENT[2]) * cov);
  return [r, g, b, 255];
}

function outlinePixel(x, y, size) {
  const cov = clockCoverage(x, y, size);
  return [255, 255, 255, Math.round(cov * 255)];
}

mkdirSync(manifestDir, { recursive: true });

writePng(192, join(manifestDir, "color.png"), colorPixel);
writePng(32, join(manifestDir, "outline.png"), outlinePixel);

console.log("Icons generated successfully.");
