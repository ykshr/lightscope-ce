const cache = new Map<string, string>();

const snakeToCamel = (str: string): string => {
  const cached = cache.get(str);
  if (cached !== undefined) return cached;
  const result = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
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
