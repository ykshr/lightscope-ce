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

export const findSortOptionByValue = (value: Record<string, unknown>) => {
  const categoryKeys = Object.keys(value)
    .filter((key) => allKeysUsedInSortOptions.includes(key))
    .sort();

  const foundOption = sortOptions.find((option) => {
    const optionKeys = Object.keys(option.value).sort();
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
        const sortedVal1 = [...val1].sort();
        const sortedVal2 = [...val2].sort();
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

  if (foundOption) return foundOption;

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
