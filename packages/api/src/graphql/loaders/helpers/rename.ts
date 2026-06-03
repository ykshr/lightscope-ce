const cache = new Map<string, string>();
const SNAKE_TO_CAMEL_REGEX = /_([a-z])/g;

const snakeToCamel = (str: string): string => {
  const cached = cache.get(str);
  if (cached !== undefined) return cached;
  const result = str.replace(SNAKE_TO_CAMEL_REGEX, (_, letter) => letter.toUpperCase());
  cache.set(str, result);
  return result;
};

export function renameKeySnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item));
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj;
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamel(key);
        newObj[camelKey] = renameKeySnakeToCamel(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
