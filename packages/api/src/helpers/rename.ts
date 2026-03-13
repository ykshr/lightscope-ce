const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export function renameKeySnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = renameKeySnakeToCamel(obj[key]);
    }
    return newObj;
  }
  return obj;
}
