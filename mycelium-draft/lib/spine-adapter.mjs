// SPDX-License-Identifier: Apache-2.0
// Connective Spine adapter helpers — stub for mycelium-draft.

export const SPINE_VERSION = '0.1';

/**
 * Stamp a freshness envelope onto a record.
 * @param {{ source: string, revisionId?: string, asOf?: string, confidence: string }} opts
 */
export function stamp({ source, revisionId, asOf, confidence }) {
  return {
    source,
    revisionId: revisionId ?? null,
    asOf: asOf ?? new Date().toISOString(),
    confidence,
    stampedAt: new Date().toISOString(),
  };
}
