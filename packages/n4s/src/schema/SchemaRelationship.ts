import type { SchemaPath } from './SchemaPath';

export interface SchemaRelationship {
  source: SchemaPath;
  target: SchemaPath;
  effect: 'invalidate';
  metadata?: { reason?: string };
}

export type InternalRelationship = SchemaRelationship & {
  __isRootSource?: boolean;
  __isRootTarget?: boolean;
};

export interface SchemaDependency {
  target: SchemaPath;
  sources: readonly SchemaPath[];
}
