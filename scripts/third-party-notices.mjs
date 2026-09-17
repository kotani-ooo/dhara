import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (file) => JSON.parse(readFileSync(file, "utf8"));
const reviews = readJSON(path.join(root, "third-party-licenses.json"));

// Walking from the module file works for both pnpm's isolated layout and npm's
// flat layout, without hard-coding the package store or bypassing package exports.
export function packageAt(modulePath) {
  let directory = path.dirname(modulePath);
  while (directory !== path.dirname(directory)) {
    const file = path.join(directory, "package.json");
    if (existsSync(file)) {
      const manifest = readJSON(file);
      if (manifest.name && manifest.version) return { directory, manifest };
    }
    directory = path.dirname(directory);
  }
  throw new Error(`Cannot identify third-party module: ${modulePath}`);
}

export function verifyLicense(manifest, licenseText, review) {
  if (!review || manifest.name !== review.name || manifest.version !== review.version) {
    throw new Error(`Unreviewed third-party package: ${manifest.name}@${manifest.version}`);
  }
  if (manifest.license !== review.license
      || createHash("sha256").update(licenseText).digest("hex") !== review.sha256) {
    throw new Error(`License changed: ${manifest.name}@${manifest.version}`);
  }
}

export function thirdPartyNotices() {
  return {
    name: "dhara-third-party-notices",
    apply: "build",
    generateBundle() {
      const packages = new Map();
      const include = (modulePath) => {
        const item = packageAt(modulePath);
        packages.set(`${item.manifest.name}@${item.manifest.version}`, item);
      };
      const require = createRequire(path.join(root, "package.json"));
      const project = readJSON(path.join(root, "package.json"));
      // Check every direct dependency, including build-only tools.
      for (const name of Object.keys({ ...project.dependencies, ...project.devDependencies })) {
        include(require.resolve(name));
      }
      // Check transitive packages from the actual build graph too. This is
      // deliberately conservative: even a loaded-but-tree-shaken package is reviewed.
      for (const id of this.getModuleIds()) {
        if (!id.startsWith("\0") && id.includes("/node_modules/")) {
          include(id.split("?")[0]);
        }
      }

      const sections = [];
      for (const [id, { directory, manifest }] of [...packages].sort()) {
        const review = reviews.find((item) => item.name === manifest.name);
        if (!review) throw new Error(`Unreviewed third-party package: ${id}`);
        const licenseText = readFileSync(path.join(directory, review.licenseFile), "utf8");
        verifyLicense(manifest, licenseText, review);
        sections.push(`${id}\n${review.source}\nUsage: ${review.usage}\n\n${licenseText}`);
      }
      this.emitFile({
        type: "asset",
        fileName: "THIRD-PARTY-NOTICES.txt",
        source: "Dhara website — third-party software notices\n"
          + "Generated from the installed, reviewed package license files.\n"
          + "Build-tool notices are also included; this does not mean all their code ships in the browser.\n\n"
          + sections.join("\n\n----------------------------------------\n\n"),
      });
    },
  };
}
