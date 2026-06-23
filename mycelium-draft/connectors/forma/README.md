# mycelium-for-forma

A [Mycelium Studio](https://myceliumstudio.io) connector for **Autodesk Forma** — early-design site and massing records.

Forma operates before a BIM model exists, so records join on `zone` and `classification` rather than `ifcGuid`. This connector pulls those early-design elements into Mycelium Studio's Connective Spine so intent can be tracked through to coordination.

## Install

```sh
npm install
```

## Run

```sh
node connector.mjs
```

Should print `"conformant": true`.

## Wire it to real Forma

Replace `fetchSource()` in `connector.mjs` with a call to the Forma API. Keep the field shape — the spine adapter normalises and conformance-checks the rest.

## Credentials

| Env var | Value |
|---|---|
| `FORMA_TOKEN` | APS OAuth Bearer token — generate at [aps.autodesk.com](https://aps.autodesk.com) |
| `FORMA_PROJECT_ID` | Your Forma project URN or ID |
| `FORMA_URL` | Optional — defaults to the Autodesk API base |

Copy `.env.example` to `.env` and fill in your values.

## License

Apache-2.0
