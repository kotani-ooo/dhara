import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { content, locales } from "../src/content.js";

const pages = ["support", "privacy", "terms", "coming-soon"];

test("emits the landing page and the not-found fallback", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/client/404.html", import.meta.url));
});

test("emits every page for every locale", async () => {
  for (const locale of locales) {
    await access(new URL(`../dist/client/${locale}/index.html`, import.meta.url));
    for (const page of pages) {
      await access(new URL(`../dist/client/${locale}/${page}/index.html`, import.meta.url));
    }
  }
});

test("provides localized Coming Soon copy for every locale", () => {
  for (const locale of locales) {
    assert.ok(content[locale].comingSoon.title);
    assert.ok(content[locale].comingSoon.body);
    assert.ok(content[locale].comingSoon.back);
  }
});
