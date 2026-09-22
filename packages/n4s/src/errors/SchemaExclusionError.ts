/**
 * Stable identity for exclusion enforcement failures: a run requested an
 * explicit field skip that the executable schema cannot honor without
 * executing the excluded work. Throwing fails closed before any excluded
 * predicate runs. Consumers catch this by identity (`instanceof`) and
 * `code`, never by parsing the message.
 */
export class SchemaExclusionError extends Error {
  readonly code = 'SCHEMA_EXCLUSION_UNSUPPORTED';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'SchemaExclusionError';
    if (options !== undefined && 'cause' in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
