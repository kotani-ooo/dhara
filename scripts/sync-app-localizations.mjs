import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, "..");
if (!process.env.DHARA_APP_ROOT) {
  throw new Error("Set DHARA_APP_ROOT to the Dhara app repository to sync its support and legal text.");
}
const repositoryRoot = resolve(process.env.DHARA_APP_ROOT);
const outputPath = resolve(siteRoot, "src", "generated", "app-content.js");

const locales = {
  en: "en",
  ja: "ja",
  es: "es",
  ko: "ko",
  "pt-br": "pt-BR",
};

const keys = [
  "settings.support.title",
  "settings.support.body",
  "legal.privacy.title",
  "legal.privacy.body",
  "legal.terms.title",
  "legal.terms.body",
];

function decodeAppleString(value) {
  return value
    .replaceAll("\\n", "\n")
    .replaceAll('\\"', '"')
    .replaceAll("\\\\", "\\");
}

function extractStrings(source) {
  const values = {};

  for (const key of keys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^"${escapedKey}"\\s*=\\s*"((?:\\\\.|[^"\\\\])*)";`, "m");
    const match = source.match(pattern);

    if (!match) {
      throw new Error(`Missing localized key: ${key}`);
    }

    values[key] = decodeAppleString(match[1]);
  }

  return {
    support: {
      title: values["settings.support.title"],
      body: values["settings.support.body"].replace("%@", "dhara.support@icloud.com"),
    },
    privacy: {
      title: values["legal.privacy.title"],
      body: values["legal.privacy.body"].replace("%@", "dhara.support@icloud.com"),
    },
    terms: {
      title: values["legal.terms.title"],
      body: values["legal.terms.body"].replace("%@", "dhara.support@icloud.com"),
    },
  };
}

const content = {};

for (const [websiteLocale, appLocale] of Object.entries(locales)) {
  const sourcePath = resolve(repositoryRoot, "Dhara", `${appLocale}.lproj`, "Localizable.strings");
  const source = await readFile(sourcePath, "utf8");
  content[websiteLocale] = extractStrings(source);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `// Generated from the app's Localizable.strings files. Do not edit manually.\nexport const appContent = ${JSON.stringify(content, null, 2)};\n`,
  "utf8",
);

console.log(`Updated ${outputPath}`);
