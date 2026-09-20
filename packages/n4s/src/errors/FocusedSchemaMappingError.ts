/**
 * Stable identity for the focused-mapping honesty boundary: a focused run
 * over an untouched union (or skipped union region) without a branch
 * witness cannot advertise raw input as parsed output. Consumers catch this
 * by identity (`instanceof`) and `code`, never by parsing the message.
 */
export class FocusedSchemaMappingError extends Error {
  readonly code = 'FOCUSED_SCHEMA_MAPPING_UNWITNESSED_UNION';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'FocusedSchemaMappingError';
    if (options !== undefined && 'cause' in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
