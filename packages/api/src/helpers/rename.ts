const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export function renameKeySnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameKeySnakeToCamel(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const camelKey = snakeToCamel(keys[i]);
      newObj[camelKey] = renameKeySnakeToCamel(obj[keys[i]]);
    }
    return newObj;
  }
  return obj;
}
