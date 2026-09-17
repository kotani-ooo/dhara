#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist", "client");
const index = path.join(client, "index.html");
if (!existsSync(index)) throw new Error("Missing client index: " + index);

const locales = ["en", "ja", "es", "ko", "pt-br"];
const pages = ["support", "privacy", "terms", "coming-soon"];
for (const locale of locales) {
  const localeDirectory = path.join(client, locale);
  mkdirSync(localeDirectory, { recursive: true });
  copyFileSync(index, path.join(localeDirectory, "index.html"));
  for (const page of pages) {
    const directory = path.join(localeDirectory, page);
    mkdirSync(directory, { recursive: true });
    copyFileSync(index, path.join(directory, "index.html"));
  }
}
copyFileSync(index, path.join(client, "404.html"));
console.log("Prepared GitHub Pages locale and legal routes.");
