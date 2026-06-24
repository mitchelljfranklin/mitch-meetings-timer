import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestDir = join(__dirname, "..", "manifest");

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

function generateSolidPng(size, filePath, r, g, b, a) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(Buffer.from([0]));
    const pixel = Buffer.from([r, g, b, a]);
    for (let x = 0; x < size; x++) {
      rawRows.push(pixel);
    }
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = deflateSync(rawData, { level: 9 });

  const png = Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);

  writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${size}x${size})`);
}

mkdirSync(manifestDir, { recursive: true });

generateSolidPng(192, join(manifestDir, "color.png"), 98, 100, 167, 255);
generateSolidPng(32, join(manifestDir, "outline.png"), 98, 100, 167, 255);

console.log("Icons generated successfully.");
