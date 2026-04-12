type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type SnakeToCamelObject<T> = T extends Date
  ? T
  : T extends Array<infer U>
    ? Array<SnakeToCamelObject<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<Extract<K, string>>]: SnakeToCamelObject<T[K]>;
        }
      : T;

const SNAKE_TO_CAMEL_REGEX = /_([a-z])/g;

const snakeToCamel = (str: string): string => {
  return str.replace(SNAKE_TO_CAMEL_REGEX, (_, letter) => letter.toUpperCase());
};

export function renameKeySnakeToCamel<T>(obj: T): SnakeToCamelObject<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item)) as SnakeToCamelObject<T>;
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj as SnakeToCamelObject<T>;
    }
    const newObj: Record<string, unknown> = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = renameKeySnakeToCamel((obj as Record<string, unknown>)[key]);
    }
    return newObj as SnakeToCamelObject<T>;
  }
  return obj as SnakeToCamelObject<T>;
}
