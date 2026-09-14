/**
 * Stable identity for the failure-mapping fallback boundary: only a
 * framework-declared mapping-unavailable fault keeps the documented
 * best-effort raw-input fallback. A generic EnforceSchemaError (publicly
 * exported, throwable by user parsers) must NOT be treated as mapping
 * unavailable — otherwise a user parser fault is swallowed and raw input
 * reaches the schema-typed callback. Consumers catch this by identity
 * (`instanceof`) and `code`, never by parsing the message.
 */
export class SchemaMappingUnavailableError extends Error {
  readonly code = 'SCHEMA_MAPPING_UNAVAILABLE';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'SchemaMappingUnavailableError';
    if (options !== undefined && 'cause' in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
