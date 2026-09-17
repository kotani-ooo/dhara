# Dhara website

The public website for Dhara, an iOS app for rest and calm focus through procedural
sound, animation, and a small character named Momu. It provides a landing page and
the support, privacy policy, and terms of use pages in English, Japanese, Spanish,
Korean, and Portuguese (Brazil).

It is published with GitHub Pages at <https://kotani-ooo.github.io/dhara/>.

## Requirements

- Node.js 22.13+ or 24
- pnpm 10 or 11

`pnpm-lock.yaml` is the only dependency lockfile. Do not use `npm install` or commit
a `package-lock.json`.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Build and test

```sh
pnpm build
pnpm test:sites
```

`pnpm build` writes the static site to `dist/client`, prepares a copy of the page for
every locale route, and writes the reviewed third-party license texts to
`dist/client/THIRD-PARTY-NOTICES.txt`. It fails if a bundled package or license text
is not recorded in `third-party-licenses.json`. `pnpm test:sites` checks the routes and
the notices.

Set `BASE_PATH` (for example `/dhara/`) when building for a GitHub project page.

## Support and legal text

The support, privacy policy, and terms of use text is copied from the app's
localizations and committed in `src/generated/app-content.js`. When that text changes
in the app, regenerate it with the app repository checked out next to this one:

```sh
DHARA_APP_ROOT=../dhara pnpm sync:content
```

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys the site on every push to
`main`. In the repository settings, set Pages to deploy from GitHub Actions. The
workflow sets `BASE_PATH` from the repository name.

App Store buttons open a localized Coming Soon page until the repository variable
`VITE_APP_STORE_URL` is set to the live App Store URL.
