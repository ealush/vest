import { CB } from 'vest-utils';

const registry = new Map<string, CB>();

export const ServerRegistry = {
  delete: (id: string): void => {
    registry.delete(id);
  },
  get: (id: string): CB | undefined => registry.get(id),
  register: (id: string, callback: CB): void => {
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production' &&
      registry.has(id)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Vest] Server Handler for session "${id}" is being overwritten. This is normal during HMR but dangerous in production.`,
      );
    }
    registry.set(id, callback);
  },
  run: (id: string, payload: any): any => {
    const handler = registry.get(id);
    if (!handler) {
      throw new Error(
        `[Vest] No handler registered for session "${id}". Did you forget to import the server implementation?`,
      );
    }
    return handler(payload);
  },
};
