#!/usr/bin/env node
// mycelium-for-forma — Forma proposal/site element → spine records.
// Forma is an early-design tool: join keys are zone + classification, not
// ifcGuid (model GUIDs don't exist yet at this stage).
import { runAdapter } from 'mycelium-sdk';
import { fileURLToPath } from 'url';


const config = {
  source: 'forma',
  identity: {
    uniqueId: 'forma:{elementId}',
    projectKey: '{project}',
    localIdField: 'elementId',
  },
  freshness: {
    revisionId: '{modified}',
    asOf: '{modified}',
    confidence: 'snapshot',
  },
};

async function fetchSource() {
  // Replace with a real Forma API call.
  return [
    {
      elementId: 'FRM-massing-014',
      project: 'horizons',
      classification: [{ system: 'NL-SfB', code: '11.00' }],
      zone: { kind: 'siteRegion', id: 'Block-B', name: 'Block B' },
      modified: '2026-06-17T09:00:00Z',
    },
  ];
}

export async function run() {
  const result = await runAdapter(config, { fetchSource });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.conformant ? 0 : 1);
}

// Auto-run when executed directly (node connector.mjs or packaged binary).
// __filename is defined in CJS bundles (esbuild/pkg); fall back to import.meta.url in native ESM.
const _thisFile = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
if (process.argv[1] === _thisFile) {
  run().catch(err => { console.error(err); process.exit(1); });
}
