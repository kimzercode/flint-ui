// Copies the library from the repo root into the Eleventy input tree so the
// docs build can ship it as static assets:
//
//   ../css/flint.css  → src/vendor/css/flint.css
//   ../js/flint.js    → src/vendor/js/flint.js
//   ../demos/*        → src/vendor/demos/*
//
// Run from support/package.json ("npm run vendor"). The vendor dir is
// git-ignored; the built docs/ output is what gets committed.
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docsSite = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendor = join(docsSite, "src", "vendor");

rmSync(vendor, { recursive: true, force: true });

const pairs = [
  ["../css", "vendor/css"],
  ["../js", "vendor/js"],
  ["../demos", "vendor/demos"],
];

for (const [from, to] of pairs) {
  const src = join(docsSite, from);
  cpSync(src, join(docsSite, "src", to), { recursive: true });
  console.log(`vendored ${from} → src/${to}`);
}
