export const sortOptions = [
  {
    label: 'Total',
    value: {},
  },
  {
    label: 'Continent:Africa',
    value: {
      category: 'geo',
      includeContinents: ['AF'],
    },
  },
  {
    label: 'Continent:Antarctica',
    value: {
      category: 'geo',
      includeContinents: ['AN'],
    },
  },
  {
    label: 'Continent:Asia',
    value: {
      category: 'geo',
      includeContinents: ['AS'],
    },
  },
  {
    label: 'Continent:Europe',
    value: {
      category: 'geo',
      includeContinents: ['EU'],
    },
  },
  {
    label: 'Continent:North America',
    value: {
      category: 'geo',
      includeContinents: ['NA'],
    },
  },
  {
    label: 'Continent:Oceania',
    value: {
      category: 'geo',
      includeContinents: ['OC'],
    },
  },
  {
    label: 'Continent:South America',
    value: {
      category: 'geo',
      includeContinents: ['SA'],
    },
  },
  {
    label: 'Referrer:Direct',
    value: {
      category: 'referrer',
      includeDomains: ['direct'],
    },
  },
  {
    label: 'Device:Tablet',
    value: {
      category: 'device',
      includeDeviceTypes: ['tablet'],
    },
  },
  {
    label: 'Device:Desktop',
    value: {
      category: 'device',
      includeDeviceTypes: ['desktop'],
    },
  },
  {
    label: 'Device:Mobile',
    value: {
      category: 'device',
      includeDeviceTypes: ['mobile'],
    },
  },
];

export const allKeysUsedInSortOptions = Array.from(
  new Set<string>(sortOptions.flatMap((option) => Object.keys(option.value)))
).sort();

const preprocessedOptions = sortOptions.map((option, index) => {
  const value = { ...option.value } as Record<string, unknown>;
  const keys = Object.keys(value).sort();

  for (const key of keys) {
    const val = value[key];
    if (Array.isArray(val)) {
      value[key] = [...val].sort();
    }
  }

  return {
    sortedKeys: keys,
    value,
    index,
  };
});

export const findSortOptionByValue = (value: Record<string, unknown>) => {
  const categoryKeys = Object.keys(value)
    .filter((key) => allKeysUsedInSortOptions.includes(key))
    .sort();

  const sortedInputArrays = new Map<unknown[], unknown[]>();

  const foundOption = preprocessedOptions.find((option) => {
    const { sortedKeys: optionKeys } = option;
    if (categoryKeys.length !== optionKeys.length) {
      return false;
    }
    for (let i = 0; i < categoryKeys.length; i++) {
      const key = categoryKeys[i];
      if (key !== optionKeys[i]) {
        return false;
      }
      const val1 = value[key];
      const val2 = option.value[key as keyof typeof option.value];
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
          return false;
        }

        let sortedVal1 = sortedInputArrays.get(val1);
        if (!sortedVal1) {
          sortedVal1 = [...val1].sort();
          sortedInputArrays.set(val1, sortedVal1);
        }

        const sortedVal2 = val2 as unknown[]; // Already sorted in preprocessedOptions
        for (let j = 0; j < sortedVal1.length; j++) {
          if (sortedVal1[j] !== sortedVal2[j]) {
            return false;
          }
        }
      } else {
        if (val1 !== val2) {
          return false;
        }
      }
    }
    return true;
  });

  if (foundOption) return sortOptions[foundOption.index];

  return {
    label: 'Custom',
    value: categoryKeys.reduce(
      (acc, key) => {
        acc[key] = value[key];
        return acc;
      },
      {} as Record<string, unknown>
    ),
  };
};
