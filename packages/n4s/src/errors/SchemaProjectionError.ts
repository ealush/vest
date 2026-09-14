/**
 * Stable identity for structural projection unavailability: a fragment or
 * member rebuild that cannot preserve its dependency sources (e.g. an
 * orphaned $.root edge in a standalone member) fails before user execution
 * begins. Emitted ONLY by n4s-owned rebuild operations, never by user
 * predicates, parsers, resolvers, or getters — so selective-execution
 * fallback routes can distinguish genuine structural gaps from unexpected
 * user exceptions. Consumers catch this by identity (`instanceof`) and
 * `code`, never by parsing the message. The original framework failure is
 * retained as `cause` by identity.
 */
export class SchemaProjectionError extends Error {
  readonly code = 'SCHEMA_PROJECTION_UNAVAILABLE';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'SchemaProjectionError';
    if (options !== undefined && 'cause' in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
