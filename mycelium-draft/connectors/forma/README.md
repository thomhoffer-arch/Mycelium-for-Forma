# Mycelium-for-Forma

Live connector: Autodesk **Forma** (cloud early-stage design) → Connective Spine.

> **Purpose = LURE / ONRAMP.** This connector exists to **pull Autodesk-cloud users into Loam and
> the open OpenAEC stack** — meet them where they are, then migrate their gravity to the open/EU
> backbone. It is an **acquisition funnel, not a sovereign default** (see
> [`../../BACKBONE.md`](../../BACKBONE.md) → connector tiers).

- **Auth:** APS **OAuth Bearer** (2-/3-legged). Config: `FORMA_URL`, `FORMA_TOKEN`, `FORMA_PROJECT_ID`.
- **Join edge:** `zone` / `classification` / project — **NOT** `ifcGuid` (early design has no IFC).
  Thinner edge by nature; elements with neither don't join (by design).
- **Freshness:** `live`.
- **Residency:** Autodesk = **US SaaS → CLOUD-Act exposure.** Must be **labelled** in the hub; never
  part of the sovereign base layer.
- **Endpoints:** best-effort, marked `// verify` — confirm against the Forma/APS API docs.
- **Status:** 🧪 experimental (draft). **License:** Apache-2.0.
