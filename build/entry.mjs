// Bundle entry point: env-loader runs first (ESM evaluation order),
// then the connector module executes with env vars already set.
import './env-loader.mjs';
import '../mycelium-draft/connectors/forma/connector.mjs';
