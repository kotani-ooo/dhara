import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { packageAt, thirdPartyNotices, verifyLicense } from "../scripts/third-party-notices.mjs";

const reviews = JSON.parse(readFileSync(new URL("../third-party-licenses.json", import.meta.url)));
const require = createRequire(import.meta.url);
const reactReview = reviews.find(({ name }) => name === "react");
const reactManifest = require("react/package.json");
const reactLicense = readFileSync(path.join(path.dirname(require.resolve("react")), "LICENSE"), "utf8");

test("accepts reviewed license and version, rejects version and text drift", () => {
  assert.doesNotThrow(() => verifyLicense(reactManifest, reactLicense, reactReview));
  assert.throws(() => verifyLicense({ ...reactManifest, version: "0.0.0" }, reactLicense, reactReview), /Unreviewed/);
  assert.throws(() => verifyLicense(reactManifest, `${reactLicense}\nchanged`, reactReview), /License changed/);
  assert.throws(() => verifyLicense({ ...reactManifest, license: "unknown" }, reactLicense, reactReview), /License changed/);
  assert.throws(() => verifyLicense(reactManifest, reactLicense, undefined), /Unreviewed/);
});

test("fails the build for an unreviewed transitive package", () => {
  const viteRequire = createRequire(require.resolve("vite"));
  assert.throws(() => thirdPartyNotices().generateBundle.call({
    getModuleIds: () => [viteRequire.resolve("postcss")],
    emitFile: () => assert.fail("must not emit unreviewed notices"),
  }), /Unreviewed third-party package: postcss/);
});

test("distribution contains complete license texts for runtime and direct build packages", () => {
  const notices = readFileSync(new URL("../dist/client/THIRD-PARTY-NOTICES.txt", import.meta.url), "utf8");
  const reactDOMRequire = createRequire(require.resolve("react-dom"));
  for (const review of reviews) {
    const resolver = review.name === "scheduler" ? reactDOMRequire : require;
    const { directory, manifest } = packageAt(resolver.resolve(review.name));
    const license = readFileSync(path.join(directory, review.licenseFile), "utf8");
    verifyLicense(manifest, license, review);
    assert.ok(notices.includes(`${review.name}@${review.version}`));
    assert.ok(notices.includes(license));
  }
});
