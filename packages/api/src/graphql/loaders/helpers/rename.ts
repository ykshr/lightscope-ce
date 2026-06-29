const cache = new Map<string, string>();
const SNAKE_TO_CAMEL_REGEX = /_([a-z])/g;

export const snakeToCamel = (str: string): string => {
  const cached = cache.get(str);
  if (cached !== undefined) return cached;
  const result = str.replace(SNAKE_TO_CAMEL_REGEX, (_, letter) => letter.toUpperCase());
  cache.set(str, result);
  return result;
};

export function renameKeySnakeToCamel<T = unknown>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj as unknown as T;
    }
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = renameKeySnakeToCamel((obj as Record<string, unknown>)[key]);
    }
    return newObj as unknown as T;
  }
  return obj as unknown as T;
}

const camelToSnakeCache = new Map<string, string>();
const CAMEL_TO_SNAKE_REGEX = /[A-Z]/g;

export const camelToSnake = (str: string): string => {
  const cached = camelToSnakeCache.get(str);
  if (cached !== undefined) return cached;
  const result = str.replace(CAMEL_TO_SNAKE_REGEX, (letter) => `_${letter.toLowerCase()}`);
  camelToSnakeCache.set(str, result);
  return result;
};
