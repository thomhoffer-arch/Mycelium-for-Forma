// SPDX-License-Identifier: Apache-2.0
// Connective Spine conformance validator — stub for mycelium-draft.

const REQUIRED_IDENTITY_FIELDS = ['source', 'sourceLocalId'];

/**
 * Check that a spine record meets minimum conformance.
 * Returns { conformant: boolean, violations: string[] } merged into the record.
 */
export function checkConformance(record) {
  const violations = [];

  if (!record.identity) {
    violations.push('missing identity block');
  } else {
    for (const field of REQUIRED_IDENTITY_FIELDS) {
      if (record.identity[field] == null || record.identity[field] === '') {
        violations.push(`identity.${field} is required`);
      }
    }
  }

  if (!record.freshness) {
    violations.push('missing freshness block');
  }

  return { conformant: violations.length === 0, violations };
}
