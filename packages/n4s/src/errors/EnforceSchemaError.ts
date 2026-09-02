export class EnforceSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnforceSchemaError';
  }
}
