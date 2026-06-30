import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateRawSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestDir = join(root, "manifest");

const defaultBaseUrl = process.env.BASE_URL || "https://localhost:3000";
const baseUrl = defaultBaseUrl.replace(/\/+$/, "");
const baseUrlDomain = new URL(baseUrl).hostname;

let manifest = readFileSync(join(manifestDir, "manifest.json"), "utf-8");
manifest = manifest.replace(/\{\{BASE_URL\}\}/g, baseUrl);
manifest = manifest.replace(/\{\{BASE_URL_DOMAIN\}\}/g, baseUrlDomain);
if (process.env.APP_ID) {
  manifest = manifest.replace(/\{\{APP_ID\}\}/g, process.env.APP_ID);
}

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const DOS_DATE = 0x0021;
const DOS_TIME = 0x0000;

function buildZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf-8");
    const crc = crc32(data);
    const compressed = deflateRawSync(data, { level: 9 });

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, end]);
}

const entries = [
  { name: "manifest.json", data: Buffer.from(manifest, "utf-8") },
];
for (const file of readdirSync(manifestDir)) {
  if (file.endsWith(".png")) {
    entries.push({ name: file, data: readFileSync(join(manifestDir, file)) });
  }
}

const zipFile = join(root, "meetings-timer.zip");
writeFileSync(zipFile, buildZip(entries));

console.log(`Package created: ${zipFile}`);
console.log(`  Files:    ${entries.map((e) => e.name).join(", ")}`);
console.log(`  Base URL: ${baseUrl}`);
console.log(`  Domain:   ${baseUrlDomain}`);
