export const categoryOptions = [
  {
    label: 'Total',
    value: {},
  },
  {
    label: 'Age',
    value: {
      category: 'ageAge',
    },
  },
  {
    label: 'App type',
    value: {
      category: 'appAppType',
    },
  },
  {
    label: 'Device type',
    value: {
      category: 'deviceDeviceType',
    },
  },
  {
    label: 'Gender',
    value: {
      category: 'genderGender',
    },
  },
  {
    label: 'Continent',
    value: {
      category: 'geoContinent',
    },
  },
  {
    label: 'Country',
    value: {
      category: 'geoCountry',
    },
  },
  {
    label: 'Referrer',
    value: {
      category: 'referrerDomain',
    },
  },
];

export const allKeysUsedInCategoryOptions = Array.from(
  new Set<string>(categoryOptions.flatMap((option) => Object.keys(option.value)))
).sort();

export const allKeysUsedInCategoryOptionsSet = new Set(allKeysUsedInCategoryOptions);

const preprocessedOptions = categoryOptions.map((option, index) => {
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

export const findCategoryOptionByValue = (value: Record<string, unknown>) => {
  const categoryKeys = Object.keys(value)
    .filter((key) => allKeysUsedInCategoryOptionsSet.has(key))
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

        const sortedVal2 = val2; // Already sorted in preprocessedOptions
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

  if (foundOption) {
    return categoryOptions[foundOption.index];
  }

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
