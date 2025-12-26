export type ServerTransport = (
  tokenId: string,
  data: any,
  options: { signal: AbortSignal },
) => Promise<any>;

let adapter: ServerTransport | null = null;

export function createServerAdapter(transport: ServerTransport | null): void {
  adapter = transport;
}

export function useServerAdapter(): ServerTransport | null {
  return adapter;
}
