export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function parseJson(input: string) {
  try {
    return { value: JSON.parse(input), error: null };
  } catch (error) {
    return { value: null, error: error as Error };
  }
}

export function normalizeInput(value: unknown) {
  return value == null ? {} : value;
}
