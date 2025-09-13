# My Personal Website!

Find the real site [HERE!](https://thedav.is)

## Writing a Post

Run the command:

```bash

# 1. Make sure Zola is installed.
#    https://www.getzola.org/documentation/getting-started/installation/
$ pnpm run build ; pnpm run serve
```

This will create a test-server at `http://127.0.0.1:1111`

Now write, and changes will be reflected.

## Development ##

This repository contains code that must be built and appended onto the zola build.
Specifically, the `applications/` directory is full of single-page react apps.

To build and run the site from scratch:

1) Prerequisites

- Node.js 24 and npm
- PNPM (uses Corepack) — if not available, enable via:

```bash
corepack enable
```

- Zola static site generator
	- Install from https://www.getzola.org/documentation/getting-started/installation/

2) Install dependencies

```bash
# From repo root
pnpm install --recursive
```

This will install dependencies for the root and each app under `applications/*`.

3) Build everything

```bash
pnpm run build
```

What this does:
- Builds all React apps in `applications/*` (emits each app’s `dist/`)
- Builds the Zola site into `public/`
- Copies each app’s built files into `public/<app>/` so they’re served alongside the site

4) Serve locally

```bash
pnpm run serve
```

Navigate to Site: http://127.0.0.1:1111/

Common checks:

```bash
zola check
```

If you edit or add an app under `applications/`, check its README for information on developing it.

## Releasing The Site

A continuous integration script is run when this code is pushed to the github repository
which will automatically build and publish this site, as long as the zola build succeeds.

```sh
zola check
git push origin master
```
