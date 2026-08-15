import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const tauriConfig = JSON.parse(
  await readFile(join(root, "src-tauri", "tauri.conf.json"), "utf8"),
);
const cargoToml = await readFile(join(root, "src-tauri", "Cargo.toml"), "utf8");
const cargoVersion = cargoToml
  .match(/^\[package\][\s\S]*?^version\s*=\s*"([^"]+)"/m)?.[1];

const versions = {
  "package.json": packageJson.version,
  "src-tauri/Cargo.toml": cargoVersion,
  "src-tauri/tauri.conf.json": tauriConfig.version,
};
const uniqueVersions = new Set(Object.values(versions));

if (uniqueVersions.size !== 1 || uniqueVersions.has(undefined)) {
  console.error("LuckyDrop version mismatch:", versions);
  process.exit(1);
}

const [version] = uniqueVersions;
const tag = process.env.GITHUB_REF_NAME;
if (tag?.startsWith("v")) {
  const tagVersion = tag.slice(1);
  const matchesRelease = tagVersion === version;
  const matchesPrerelease = tagVersion.startsWith(`${version}-`);
  if (!matchesRelease && !matchesPrerelease) {
    console.error(`Tag ${tag} does not match application version ${version}.`);
    process.exit(1);
  }
}

console.log(`LuckyDrop version ${version} is consistent.`);
