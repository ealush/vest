export interface ServerSession {
  id: string;
}

export function createSession(id: string): ServerSession {
  return { id };
}
