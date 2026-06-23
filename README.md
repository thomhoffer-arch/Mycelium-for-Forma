# mycelium-for-forma

Autodesk Forma connector for **Mycelium Studio** — pulls early-design site and massing records into the Connective Spine.

Forma operates before a BIM model exists, so records join on `zone` and `classification` rather than `ifcGuid`. This makes it useful for tracking early-design intent all the way through to coordination inside Mycelium Studio.

## What's in here

```
mycelium-draft/
  connectors/forma/   — the connector (connector.mjs + package.json)
  sdk-stub/           — local mycelium-sdk shim (until the package is on npm)
build/                — esbuild + pkg bundler scripts
installer/
  windows/            — NSIS setup wizard → mycelium-for-forma-setup.exe
  macos/              — pkgbuild distribution → mycelium-for-forma-macos-*.pkg
.github/workflows/    — CI: builds installers and drafts a GitHub Release on v* tags
```

## Quick start

```sh
git clone https://github.com/thomhoffer-arch/Mycelium-for-Forma
cd Mycelium-for-Forma
bash install.sh
```

The installer checks Node ≥18, installs dependencies, prompts for your Autodesk credentials, and runs a smoke test.

## Credentials

You need an [Autodesk Platform Services](https://aps.autodesk.com) account and app to generate a bearer token:

| Env var | Value |
|---|---|
| `FORMA_TOKEN` | APS OAuth Bearer token (2- or 3-legged) |
| `FORMA_PROJECT_ID` | Your Forma project URN or ID |
| `FORMA_URL` | Optional — defaults to the Autodesk API base |

Add them to `mycelium-draft/connectors/forma/.env` (created by `install.sh`).

## Wire it to real Forma

Replace `fetchSource()` in `connector.mjs` with a live Forma API call. Keep the field shape — the spine adapter normalises and conformance-checks the rest.

## Build installers locally

```sh
npm install
npm run build:win    # dist/mycelium-for-forma-win-x64.exe + NSIS setup
npm run build:mac    # dist/mycelium-for-forma-macos-{x64,arm64}
```

Tagged releases (`git tag v0.1.0 && git push origin v0.1.0`) trigger GitHub Actions to build and attach all three installers to a draft release automatically.

## License

Apache-2.0 — Mycelium open ecosystem connector.
