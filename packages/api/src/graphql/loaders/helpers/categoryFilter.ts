import {
  RankCategoryAgeArgs,
  RankCategoryAppArgs,
  RankCategoryDeviceArgs,
  RankCategoryGenderArgs,
  RankCategoryGeoArgs,
  RankCategoryReferrerArgs,
  RankCategoryUtmArgs,
  TrendCategoryAgeArgs,
  TrendCategoryAppArgs,
  TrendCategoryDeviceArgs,
  TrendCategoryGenderArgs,
  TrendCategoryGeoArgs,
  TrendCategoryReferrerArgs,
  TrendCategoryUtmArgs,
} from '@/graphql/__generated__/graphql-resolvers';

type Filter =
  | RankCategoryAgeArgs
  | RankCategoryAppArgs
  | RankCategoryDeviceArgs
  | RankCategoryGenderArgs
  | RankCategoryGeoArgs
  | RankCategoryReferrerArgs
  | RankCategoryUtmArgs
  | TrendCategoryAgeArgs
  | TrendCategoryAppArgs
  | TrendCategoryDeviceArgs
  | TrendCategoryGenderArgs
  | TrendCategoryGeoArgs
  | TrendCategoryReferrerArgs
  | TrendCategoryUtmArgs;

function buildCondition<T>(
  filter: Filter,
  key: string,
  column: string,
  needHash = false
): string[] {
  const conditions: string[] = [];
  const includeKey = `include${key}`;
  const excludeKey = `exclude${key}`;
  if (
    includeKey in filter &&
    Array.isArray((filter as Record<string, unknown>)[includeKey]) &&
    ((filter as Record<string, unknown>)[includeKey] as unknown[]).length > 0
  ) {
    const values = ((filter as Record<string, unknown>)[includeKey] as T[])
      .map((v: T) => `'${v}'`)
      .join(', ');
    conditions.push(`${column} IN (${needHash ? `cityHash64(${values})` : values})`);
  }
  if (
    excludeKey in filter &&
    Array.isArray((filter as Record<string, unknown>)[excludeKey]) &&
    ((filter as Record<string, unknown>)[excludeKey] as unknown[]).length > 0
  ) {
    const values = ((filter as Record<string, unknown>)[excludeKey] as T[])
      .map((v: T) => `'${v}'`)
      .join(', ');
    conditions.push(`${column} NOT IN (${needHash ? `cityHash64(${values})` : values})`);
  }
  return conditions;
}

export default function processCategoryFilter(filter?: Filter): string | undefined {
  if (!filter) return undefined;
  const c: string[] = [];

  c.push(...buildCondition<string>(filter, 'Ages', 'age'));
  c.push(...buildCondition<string>(filter, 'AppTypes', 'app_type'));
  c.push(...buildCondition<string>(filter, 'Apps', 'app'));
  c.push(...buildCondition<string>(filter, 'Devices', 'device'));
  c.push(...buildCondition<string>(filter, 'DeviceTypes', 'device_type'));
  c.push(...buildCondition<string>(filter, 'DeviceVendors', 'device_vendor'));
  c.push(...buildCondition<string>(filter, 'Genders', 'gender'));
  c.push(...buildCondition<string>(filter, 'Continents', 'geo_continent'));
  c.push(...buildCondition<string>(filter, 'Subdivisions', 'geo_subdivision'));
  c.push(...buildCondition<string>(filter, 'Countries', 'geo_country'));
  c.push(...buildCondition<string>(filter, 'Cities', 'geo_city'));
  c.push(...buildCondition<string>(filter, 'Domains', 'domain_hash', true));
  c.push(...buildCondition<string>(filter, 'Referrers', 'referrer_hash', true));
  c.push(...buildCondition<string>(filter, 'UtmSources', 'utm_source'));
  c.push(...buildCondition<string>(filter, 'UtmMediums', 'utm_medium'));
  c.push(...buildCondition<string>(filter, 'UtmCampaigns', 'utm_campaign'));

  return c.length ? c.join(' AND ') : undefined;
}
