// TODO: Add unit tests - This utility handles deep merging of objects and needs to be tested with various edge cases like arrays, nulls, and nested structures.
const isObject = (item: any): item is Record<string, any> => {
  return !!(item && typeof item === 'object' && !Array.isArray(item));
};

export default function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: any[]
): T {
  if (!sources.length) {
    return target;
  }

  return sources.reduce(
    (acc, source) => {
      if (!isObject(acc) || !isObject(source)) {
        return acc;
      }

      Object.keys(source).forEach((key) => {
        const targetValue = acc[key];
        const sourceValue = source[key];

        if (isObject(targetValue) && isObject(sourceValue)) {
          (acc as any)[key] = deepMerge(targetValue, sourceValue);
        } else {
          (acc as any)[key] = sourceValue;
        }
      });

      return acc;
    },
    { ...target }
  );
}
