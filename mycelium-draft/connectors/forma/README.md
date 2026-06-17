# mycelium-for-forma

A [Mycelium](https://connectivespine.org) connector for **Autodesk Forma** — early-design site/massing records.

Forma sits before the BIM model exists, so join keys are `zone` and `classification` rather than `ifcGuid`. Useful for tracking early-design intent through to coordination.

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

## Reference

- [Mycelium spec](https://connectivespine.org/spec/)
- [mycelium-sdk on npm](https://www.npmjs.com/package/mycelium-sdk)

## License

Apache-2.0
