export function first<T>(items: Array<T>): T | undefined {
  return items[0];
}

export function firstSure<T>(items: Array<T>): T {
  return items[0];
}
