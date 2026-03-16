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
} from '@/__generated__/resolvers';

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
): { conditions: string[]; params: Record<string, unknown> } {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};
  const includeKey = `include${key}`;
  const excludeKey = `exclude${key}`;

  if (
    includeKey in filter &&
    Array.isArray((filter as Record<string, unknown>)[includeKey]) &&
    ((filter as Record<string, unknown>)[includeKey] as unknown[]).length > 0
  ) {
    const values = (filter as Record<string, unknown>)[includeKey] as T[];
    params[includeKey] = values;
    conditions.push(
      `${column} IN (${needHash ? `arrayMap(x -> cityHash64(x), {${includeKey}:Array(String)})` : `{${includeKey}:Array(String)}`})`
    );
  }

  if (
    excludeKey in filter &&
    Array.isArray((filter as Record<string, unknown>)[excludeKey]) &&
    ((filter as Record<string, unknown>)[excludeKey] as unknown[]).length > 0
  ) {
    const values = (filter as Record<string, unknown>)[excludeKey] as T[];
    params[excludeKey] = values;
    conditions.push(
      `${column} NOT IN (${needHash ? `arrayMap(x -> cityHash64(x), {${excludeKey}:Array(String)})` : `{${excludeKey}:Array(String)}`})`
    );
  }

  return { conditions, params };
}

export default function processCategoryFilter(
  filter?: Filter
): { query: string; params: Record<string, unknown> } | undefined {
  if (!filter) return undefined;

  const c: string[] = [];
  const p: Record<string, unknown> = {};

  const processCondition = (res: { conditions: string[]; params: Record<string, unknown> }) => {
    c.push(...res.conditions);
    Object.assign(p, res.params);
  };

  processCondition(buildCondition<string>(filter, 'Ages', 'age'));
  processCondition(buildCondition<string>(filter, 'AppTypes', 'app_type'));
  processCondition(buildCondition<string>(filter, 'Apps', 'app'));
  processCondition(buildCondition<string>(filter, 'Devices', 'device'));
  processCondition(buildCondition<string>(filter, 'DeviceTypes', 'device_type'));
  processCondition(buildCondition<string>(filter, 'DeviceVendors', 'device_vendor'));
  processCondition(buildCondition<string>(filter, 'Genders', 'gender'));
  processCondition(buildCondition<string>(filter, 'Continents', 'geo_continent'));
  processCondition(buildCondition<string>(filter, 'Subdivisions', 'geo_subdivision'));
  processCondition(buildCondition<string>(filter, 'Countries', 'geo_country'));
  processCondition(buildCondition<string>(filter, 'Cities', 'geo_city'));
  processCondition(buildCondition<string>(filter, 'Domains', 'domain_hash', true));
  processCondition(buildCondition<string>(filter, 'Referrers', 'referrer_hash', true));
  processCondition(buildCondition<string>(filter, 'UtmSources', 'utm_source'));
  processCondition(buildCondition<string>(filter, 'UtmMediums', 'utm_medium'));
  processCondition(buildCondition<string>(filter, 'UtmCampaigns', 'utm_campaign'));

  return c.length ? { query: c.join(' AND '), params: p } : undefined;
}
