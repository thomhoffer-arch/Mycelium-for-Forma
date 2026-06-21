// SPDX-License-Identifier: Apache-2.0
// mycelium-sdk stub — implements runAdapter, stamp, checkConformance, SPINE_VERSION.
// Drop-in shim until the real package is published to npm.

export const SPINE_VERSION = '0.1';

export function stamp({ source, revisionId, asOf, confidence }) {
  return {
    source,
    revisionId: revisionId ?? null,
    asOf: asOf ?? new Date().toISOString(),
    confidence,
    stampedAt: new Date().toISOString(),
  };
}

const REQUIRED = ['source', 'sourceLocalId'];

export function checkConformance(record) {
  const violations = [];
  if (!record.identity) {
    violations.push('missing identity block');
  } else {
    for (const f of REQUIRED) {
      if (record.identity[f] == null || record.identity[f] === '')
        violations.push(`identity.${f} is required`);
    }
  }
  if (!record.freshness) violations.push('missing freshness block');
  return { conformant: violations.length === 0, violations };
}

// Resolve a {field} template string against a record object.
function interpolate(tmpl, rec) {
  return tmpl.replace(/\{(\w+)\}/g, (_, k) => rec[k] ?? '');
}

/**
 * runAdapter(config, { fetchSource }) — fetch records, map to spine, conformance-check.
 *
 * config shape:
 *   source          string
 *   identity        { uniqueId: 'src:{field}', projectKey: '{field}', localIdField: 'field' }
 *   freshness       { revisionId: '{field}', asOf: '{field}', confidence: string }
 */
export async function runAdapter(config, { fetchSource }) {
  const raw = await fetchSource();
  const records = raw.map((rec) => {
    const identity = {
      source: config.source,
      sourceLocalId: String(rec[config.identity.localIdField] ?? interpolate(config.identity.uniqueId, rec)),
      ...(config.identity.projectKey ? { projectKey: interpolate(config.identity.projectKey, rec) } : {}),
    };

    // carry any extra domain fields (zone, classification, …)
    for (const [k, v] of Object.entries(rec)) {
      if (!['elementId', 'project', 'modified'].includes(k) && v != null)
        identity[k] = v;
    }

    const freshness = stamp({
      source: config.source,
      revisionId: interpolate(config.freshness.revisionId, rec) || null,
      asOf:       interpolate(config.freshness.asOf, rec) || null,
      confidence: config.freshness.confidence,
    });

    const spine = { identity, freshness, payload: rec };
    return { ...spine, ...checkConformance(spine) };
  });

  return {
    source: config.source,
    spineVersion: SPINE_VERSION,
    conformant: records.every((r) => r.conformant),
    records,
  };
}
