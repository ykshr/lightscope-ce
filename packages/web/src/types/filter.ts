export type FilterToQuery = {
  startDate: Date;
  endDate: Date;
  articleFilter?: ArticleFilter;
  sort?: string;
  limit?: number;
  page?: number;
  order?: string;
  metric?: string;
  includeAges?: string[];
  excludeAges?: string[];
  includeAppTypes?: string[];
  excludeAppTypes?: string[];
  includeApps?: string[];
  excludeApps?: string[];
  includeDeviceTypes?: string[];
  excludeDeviceTypes?: string[];
  includeDeviceVendors?: string[];
  excludeDeviceVendors?: string[];
  includeDevices?: string[];
  excludeDevices?: string[];
  includeGenders?: string[];
  excludeGenders?: string[];
  includeContinents?: string[];
  excludeContinents?: string[];
  includeSubdivisions?: string[];
  excludeSubdivisions?: string[];
  includeCountries?: string[];
  excludeCountries?: string[];
  includeCities?: string[];
  excludeCities?: string[];
  includeDomains?: string[];
  excludeDomains?: string[];
  includeReferrers?: string[];
  excludeReferrers?: string[];
  includeSources?: string[];
  excludeSources?: string[];
  includeMediums?: string[];
  excludeMediums?: string[];
  includeCampaigns?: string[];
  excludeCampaigns?: string[];
};

export type ArticleFilter = {
  includeUrls?: string[];
  excludeUrls?: string[];
  title?: string;
  includeTypes?: string[];
  excludeTypes?: string[];
  description?: string;
  includeSiteNames?: string[];
  excludeSiteNames?: string[];
  includeLocales?: string[];
  excludeLocales?: string[];
  publishedTimeBefore?: Date;
  publishedTimeAfter?: Date;
  modifiedTimeBefore?: Date;
  modifiedTimeAfter?: Date;
  expirationTimeBefore?: Date;
  expirationTimeAfter?: Date;
  // Each inner array represents a set of authors where at least one author must be present (logical OR) while outer array represents sets that must all be satisfied (logical AND).
  includeAuthors?: string[][];
  // Each inner array represents a set of authors where at least one author must be present (logical OR) while outer array represents sets that must all be satisfied (logical AND).
  excludeAuthors?: string[][];
  includeSections?: string[];
  excludeSections?: string[];
  // Each inner array represents a set of tags where at least one tag must be present (logical OR) while outer array represents sets that must all be satisfied (logical AND).
  includeTags?: string[][];
  // Each inner array represents a set of tags where at least one tag must be present (logical OR) while outer array represents sets that must all be satisfied (logical AND).
  excludeTags?: string[][];
};
