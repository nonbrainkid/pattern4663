import { rmSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const buildDirectory = resolve(repositoryRoot, ".next");

if (
  dirname(buildDirectory) !== repositoryRoot ||
  basename(buildDirectory) !== ".next"
) {
  throw new Error(`Refusing to remove unsafe build path: ${buildDirectory}`);
}

rmSync(buildDirectory, { recursive: true, force: true });
console.log(`Removed stale Next.js output: ${buildDirectory}`);
