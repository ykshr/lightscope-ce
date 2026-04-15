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

export const findCategoryOptionByValue = (value: Record<string, unknown>) => {
  const categoryKeys = Object.keys(value)
    .filter((key) => allKeysUsedInCategoryOptions.includes(key))
    .sort();

  const foundOption = categoryOptions.find((option) => {
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
