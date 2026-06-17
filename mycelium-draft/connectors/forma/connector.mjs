#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Mycelium-for-Forma (v0.1 DRAFT) — Apache-2.0 (Mycelium open ecosystem; NOT Loam's proprietary license).
// Live connector: Autodesk Forma (cloud early-stage design) -> Connective Spine.
//
// PURPOSE = LURE / ONRAMP (see ../../BACKBONE.md): meet Autodesk-cloud users where they are and
// pull them INTO Loam + the open OpenAEC stack. Forma is US SaaS (CLOUD-Act) — an acquisition
// funnel, NOT a sovereign default.
//
// Forma is on Autodesk Platform Services (APS): OAuth Bearer auth. EARLY-STAGE design, so the join
// edge is zone/classification/project — NOT element ifcGuid (no IFC at concept stage).
// NOTE: endpoint/field names are best-effort vs the Forma/APS API — verify.
import { stamp, SPINE_VERSION } from '../../lib/spine-adapter.mjs';
import { checkConformance } from '../../conformance/validate.mjs';

const SOURCE  = 'forma';
const BASE    = process.env.FORMA_URL || 'https://developer.api.autodesk.com/forma'; // verify
const TOKEN   = process.env.FORMA_TOKEN || '';        // APS OAuth Bearer (2- or 3-legged)
const PROJECT = process.env.FORMA_PROJECT_ID || '';

async function forma(path) {
  if (!TOKEN) throw new Error('FORMA_TOKEN required (APS OAuth Bearer)');
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Forma ${path} -> HTTP ${res.status}`);
  return res.json();
}

// Pull proposal elements / zones for the project.
async function fetchSource() {
  const data = await forma(`/projects/${PROJECT}/elements`);
  const items = data.elements || data.results || [];
  return items.map((el) => ({
    id:        el.urn ?? el.id,
    projectKey: PROJECT,
    zone:      el.zone ?? el.area ?? null,               // Forma is zone/area-centric
    classification: el.classification ?? undefined,     // if assigned at this stage
    modified:  el.modifiedAt ?? el.updated,
  }));
}

function toSpine(rec) {
  return {
    identity: {
      source: SOURCE,
      sourceLocalId: String(rec.id),
      projectKey: rec.projectKey,
      ...(rec.zone ? { zone: rec.zone } : {}),                      // join edge (early design)
      ...(rec.classification ? { classification: rec.classification } : {}),
    },
    freshness: stamp({ source: SOURCE, revisionId: rec.modified, asOf: rec.modified, confidence: 'live' }),
    payload: rec,
  };
}

const rows = await fetchSource();
const records = rows.map(toSpine).map((r) => ({ ...r, ...checkConformance(r) }));
console.log(JSON.stringify({ source: SOURCE, spineVersion: SPINE_VERSION,
  conformant: records.every((r) => r.conformant), records }, null, 2));
process.exit(records.every((r) => r.conformant) ? 0 : 1);
