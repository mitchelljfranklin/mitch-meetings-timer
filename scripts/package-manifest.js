import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestDir = join(root, "manifest");

const defaultBaseUrl = process.env.BASE_URL || "https://localhost:3000";
const baseUrl = defaultBaseUrl.replace(/\/+$/, "");
const baseUrlDomain = new URL(baseUrl).hostname;

const appId = process.env.APP_ID || "00000000-0000-0000-0000-000000000000";

let manifest = readFileSync(join(manifestDir, "manifest.json"), "utf-8");
manifest = manifest.replace(/\{\{BASE_URL\}\}/g, baseUrl);
manifest = manifest.replace(/\{\{BASE_URL_DOMAIN\}\}/g, baseUrlDomain);
manifest = manifest.replace(/\{\{APP_ID\}\}/g, appId);

const tempDir = join(root, ".package");
execSync(`rm -rf "${tempDir}"`);
execSync(`mkdir -p "${tempDir}"`);

writeFileSync(join(tempDir, "manifest.json"), manifest);

for (const file of readdirSync(manifestDir)) {
  if (file.endsWith(".png")) {
    execSync(`cp "${join(manifestDir, file)}" "${join(tempDir, file)}"`);
  }
}

const zipFile = join(root, "meetings-timer.zip");
execSync(`rm -f "${zipFile}"`);
execSync(`cd "${tempDir}" && zip -r "${zipFile}" .`, { cwd: tempDir });
execSync(`rm -rf "${tempDir}"`);

console.log(`Package created: ${zipFile}`);
console.log(`  Base URL: ${baseUrl}`);
console.log(`  Domain:   ${baseUrlDomain}`);
console.log(`  App ID:   ${appId}`);
