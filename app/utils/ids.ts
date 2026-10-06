let counter = 0;

/** Unique enough for in-memory prototype records. */
export function createId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
