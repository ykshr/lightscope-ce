// TODO: Add unit tests - This utility converts snake_case keys to camelCase. Tests should cover nested objects and arrays.
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export function renameKeySnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = renameKeySnakeToCamel(obj[key]);
    }
    return newObj;
  }
  return obj;
}
