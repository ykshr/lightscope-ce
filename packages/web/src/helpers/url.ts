import { DEFAULT_DATE_STRING } from '@/components/filters/DateFilter';
import type { FilterToQuery } from '@/types/filter';
import { convertDateString, formatDate } from './date';

type DataType = 'date' | 'string' | 'array' | 'nestedArray' | 'number';

interface KeyConfig {
  short: string;
  type: DataType;
  parent?: 'articleFilter';
}

export const PARAM_CONFIG: Record<string, KeyConfig> = {
  // --- Basic Period ---
  startDate: { short: 'sd', type: 'date' },
  endDate: { short: 'ed', type: 'date' },

  // --- Article Filter: String/Date Types ---
  title: { short: 'tt', type: 'string', parent: 'articleFilter' },
  description: { short: 'ds', type: 'string', parent: 'articleFilter' },
  publishedTimeBefore: { short: 'ptb', type: 'date', parent: 'articleFilter' },
  publishedTimeAfter: { short: 'pta', type: 'date', parent: 'articleFilter' },
  modifiedTimeBefore: { short: 'mtb', type: 'date', parent: 'articleFilter' },
  modifiedTimeAfter: { short: 'mta', type: 'date', parent: 'articleFilter' },
  expirationTimeBefore: { short: 'etb', type: 'date', parent: 'articleFilter' },
  expirationTimeAfter: { short: 'eta', type: 'date', parent: 'articleFilter' },

  // --- Article Filter: Array Types (1D) ---
  includeUrls: { short: 'iu', type: 'array', parent: 'articleFilter' },
  excludeUrls: { short: 'xu', type: 'array', parent: 'articleFilter' },
  includeTypes: { short: 'it', type: 'array', parent: 'articleFilter' },
  excludeTypes: { short: 'xt', type: 'array', parent: 'articleFilter' },
  includeSiteNames: { short: 'isn', type: 'array', parent: 'articleFilter' },
  excludeSiteNames: { short: 'xsn', type: 'array', parent: 'articleFilter' },
  includeLocales: { short: 'il', type: 'array', parent: 'articleFilter' },
  excludeLocales: { short: 'xl', type: 'array', parent: 'articleFilter' },
  includeSections: { short: 'is', type: 'array', parent: 'articleFilter' },
  excludeSections: { short: 'xs', type: 'array', parent: 'articleFilter' },

  // --- Article Filter: Nested Array Types (2D) ---
  includeAuthors: { short: 'ia', type: 'nestedArray', parent: 'articleFilter' },
  excludeAuthors: { short: 'xa', type: 'nestedArray', parent: 'articleFilter' },
  includeTags: { short: 'itg', type: 'nestedArray', parent: 'articleFilter' },
  excludeTags: { short: 'xtg', type: 'nestedArray', parent: 'articleFilter' },

  // --- Sorting and Pagination ---
  category: { short: 'cat', type: 'string' },
  limit: { short: 'lm', type: 'number' },
  page: { short: 'pg', type: 'number' },
  order: { short: 'ord', type: 'string' },
  metric: { short: 'mtc', type: 'string' },

  // --- Additional Sorting Conditions (Handling Overlaps) ---
  includeAges: { short: 'iag', type: 'array' },
  excludeAges: { short: 'xag', type: 'array' },
  includeAppTypes: { short: 'iatp', type: 'array' },
  excludeAppTypes: { short: 'xatp', type: 'array' },
  includeApps: { short: 'iap', type: 'array' },
  excludeApps: { short: 'xap', type: 'array' },
  includeDeviceTypes: { short: 'idt', type: 'array' },
  excludeDeviceTypes: { short: 'xdt', type: 'array' },
  includeDeviceVendors: { short: 'idv', type: 'array' },
  excludeDeviceVendors: { short: 'xdv', type: 'array' },
  includeDevices: { short: 'idev', type: 'array' },
  excludeDevices: { short: 'xdev', type: 'array' },
  includeGenders: { short: 'ig', type: 'array' },
  excludeGenders: { short: 'xg', type: 'array' },
  includeContinents: { short: 'icn', type: 'array' },
  excludeContinents: { short: 'xcn', type: 'array' },
  includeSubdivisions: { short: 'isd', type: 'array' },
  excludeSubdivisions: { short: 'xsd', type: 'array' },
  includeCountries: { short: 'ict', type: 'array' },
  excludeCountries: { short: 'xct', type: 'array' },
  includeCities: { short: 'icty', type: 'array' },
  excludeCities: { short: 'xcty', type: 'array' },
  includeDomains: { short: 'idm', type: 'array' },
  excludeDomains: { short: 'xdm', type: 'array' },
  includeReferrers: { short: 'irf', type: 'array' },
  excludeReferrers: { short: 'xrf', type: 'array' },
  includeSources: { short: 'isc', type: 'array' },
  excludeSources: { short: 'xsc', type: 'array' },
  includeMediums: { short: 'im', type: 'array' },
  excludeMediums: { short: 'xm', type: 'array' },
  includeCampaigns: { short: 'icp', type: 'array' },
  excludeCampaigns: { short: 'xcp', type: 'array' },
};

const REVERSE_CONFIG = Object.fromEntries(
  Object.entries(PARAM_CONFIG).map(([key, config]) => [config.short, { key, ...config }])
);

export type urlParamValue = null | undefined | number | Date | string | string[] | string[][];

export function encodeUrlParams(
  params: Record<string, urlParamValue>, // Use any or appropriate union type to process based on config
  isMerge: boolean = true
): URLSearchParams {
  const urlParams = isMerge ? new URLSearchParams(window.location.search) : new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const config = PARAM_CONFIG[key] || REVERSE_CONFIG[key];

    // If the key does not exist in config, use the key name as is or ignore (for safety, use the key name here)
    const shortKey = config?.short || key;

    // 1. If value is null/undefined, delete the parameter and exit
    if (value == null || value === '') {
      urlParams.delete(shortKey);
      return;
    }

    // 2. Default processing if config does not exist (for backward compatibility)
    if (!config) {
      urlParams.set(shortKey, value.toString());
      return;
    }

    // 3. Encoding process based on DataType
    switch (config.type) {
      case 'date':
        if (value instanceof Date) {
          urlParams.set(shortKey, formatDate(value));
        } else if (typeof value === 'string') {
          urlParams.set(shortKey, value);
        }
        break;

      case 'nestedArray':
        // Process string[][]: [["a", "b"], ["c"]] -> ?shortKey=a,b&shortKey=c
        urlParams.delete(shortKey); // Delete once to prevent duplicates
        if (Array.isArray(value)) {
          value.forEach((subArray) => {
            if (Array.isArray(subArray)) {
              urlParams.append(shortKey, subArray.map(encodeURIComponent).join(','));
            }
          });
        }
        break;

      case 'array':
        // Process string[]: ["a", "b"] -> ?shortKey=a&shortKey=b
        urlParams.delete(shortKey);
        if (Array.isArray(value)) {
          value.forEach((item) => {
            urlParams.append(shortKey, item.toString());
          });
        }
        break;

      case 'number':
      case 'string':
      default:
        urlParams.set(shortKey, value.toString());
        break;
    }
  });

  return urlParams;
}

export function decodeUrlParams(search: string): FilterToQuery {
  const params = new URLSearchParams(search);
  const result: any = {
    startDate: convertDateString(DEFAULT_DATE_STRING.startDateString),
    endDate: convertDateString(DEFAULT_DATE_STRING.endDateString),
  };

  params.forEach((value, shortKey) => {
    const config = REVERSE_CONFIG[shortKey];
    if (!config) return;

    const { key, type, parent } = config;
    let convertedValue: any;

    // Conversion process based on type
    switch (type) {
      case 'date':
        convertedValue = convertDateString(value);
        break;
      case 'nestedArray':
        convertedValue = value.split(',').map(decodeURIComponent).filter(Boolean);
        break;
      case 'array':
        convertedValue = value; // Use the value as is for push
        break;
      case 'number':
        convertedValue = Number(value);
        break;
      default:
        convertedValue = value;
    }

    // Decide where to store (inside articleFilter or directly)
    if (parent && !result[parent]) result[parent] = {} as any;
    const target = parent ? result[parent] : result;

    // For array types, push; otherwise, assign
    if (type === 'nestedArray' || type === 'array') {
      if (!target[key]) target[key] = [];
      target[key].push(convertedValue);
    } else {
      target[key] = convertedValue;
    }
  });

  return result as FilterToQuery;
}
