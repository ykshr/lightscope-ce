import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useFetchData } from '@/hooks/useFetchData';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Aggregation = {
  __typename?: 'Aggregation';
  /** If unit is not AUTO or Total, specifies the interval for aggregation. */
  interval?: Maybe<Scalars['Int']['output']>;
  unit: AggregationUnit;
};

export type AggregationInput = {
  /** If unit is not AUTO or Total, specifies the interval for aggregation. */
  interval?: InputMaybe<Scalars['Int']['input']>;
  unit: AggregationUnit;
};

export const AggregationUnit = {
  Auto: 'AUTO',
  Day: 'DAY',
  Hour: 'HOUR',
  Minute: 'MINUTE',
  Month: 'MONTH',
  Total: 'TOTAL',
  Week: 'WEEK',
  Year: 'YEAR'
} as const;

export type AggregationUnit = typeof AggregationUnit[keyof typeof AggregationUnit];
export type Analytics = AnalyticsBase & {
  __typename?: 'Analytics';
  date: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

export type AnalyticsAge = AnalyticsBase & {
  __typename?: 'AnalyticsAge';
  age?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

export type AnalyticsApp = AnalyticsBase & {
  __typename?: 'AnalyticsApp';
  app?: Maybe<Scalars['String']['output']>;
  appType?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

export type AnalyticsBase = {
  date: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

export type AnalyticsDevice = AnalyticsBase & {
  __typename?: 'AnalyticsDevice';
  date: Scalars['DateTime']['output'];
  device?: Maybe<Scalars['String']['output']>;
  deviceType?: Maybe<Scalars['String']['output']>;
  deviceVendor?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type AnalyticsGender = AnalyticsBase & {
  __typename?: 'AnalyticsGender';
  date: Scalars['DateTime']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type AnalyticsGeo = AnalyticsBase & {
  __typename?: 'AnalyticsGeo';
  city?: Maybe<Scalars['String']['output']>;
  continent?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  subdivision?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type AnalyticsReferrer = AnalyticsBase & {
  __typename?: 'AnalyticsReferrer';
  date: Scalars['DateTime']['output'];
  domain?: Maybe<Scalars['String']['output']>;
  referrer?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type AnalyticsUtm = AnalyticsBase & {
  __typename?: 'AnalyticsUtm';
  campaign?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  medium?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type Article = {
  __typename?: 'Article';
  analytics?: Maybe<ArticleAnalytics>;
  authors: Array<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expirationTime?: Maybe<Scalars['DateTime']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  modifiedTime?: Maybe<Scalars['DateTime']['output']>;
  publishedTime?: Maybe<Scalars['DateTime']['output']>;
  section?: Maybe<Scalars['String']['output']>;
  siteName: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};


export type ArticleAnalyticsArgs = {
  aggregation?: InputMaybe<AggregationInput>;
  endDate: Scalars['DateTime']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  metric?: InputMaybe<Metric>;
  page?: InputMaybe<Scalars['Int']['input']>;
  startDate: Scalars['DateTime']['input'];
};

export type ArticleAnalytics = {
  __typename?: 'ArticleAnalytics';
  analytics?: Maybe<Array<Analytics>>;
  analyticsAge?: Maybe<Array<AnalyticsAge>>;
  analyticsApp?: Maybe<Array<AnalyticsApp>>;
  analyticsDevice?: Maybe<Array<AnalyticsDevice>>;
  analyticsGender?: Maybe<Array<AnalyticsGender>>;
  analyticsGeo?: Maybe<Array<AnalyticsGeo>>;
  analyticsReferrer?: Maybe<Array<AnalyticsReferrer>>;
  analyticsUtm?: Maybe<Array<AnalyticsUtm>>;
  parameters: ArticleAnalyticsParameters;
};

export type ArticleAnalyticsParameters = {
  __typename?: 'ArticleAnalyticsParameters';
  aggregation: Aggregation;
  endDate: Scalars['DateTime']['output'];
  limit: Scalars['Int']['output'];
  metric: Metric;
  page: Scalars['Int']['output'];
  siteName: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type ArticleFilter = {
  __typename?: 'ArticleFilter';
  description?: Maybe<Scalars['String']['output']>;
  excludeAuthors?: Maybe<Array<Maybe<Array<Scalars['String']['output']>>>>;
  excludeLocales?: Maybe<Array<Scalars['String']['output']>>;
  excludeSections?: Maybe<Array<Scalars['String']['output']>>;
  excludeSiteNames?: Maybe<Array<Scalars['String']['output']>>;
  excludeTags?: Maybe<Array<Maybe<Array<Scalars['String']['output']>>>>;
  excludeTypes?: Maybe<Array<Scalars['String']['output']>>;
  excludeUrls?: Maybe<Array<Scalars['String']['output']>>;
  expirationTimeAfter?: Maybe<Scalars['DateTime']['output']>;
  expirationTimeBefore?: Maybe<Scalars['DateTime']['output']>;
  includeAuthors?: Maybe<Array<Maybe<Array<Scalars['String']['output']>>>>;
  includeLocales?: Maybe<Array<Scalars['String']['output']>>;
  includeSections?: Maybe<Array<Scalars['String']['output']>>;
  includeSiteNames?: Maybe<Array<Scalars['String']['output']>>;
  includeTags?: Maybe<Array<Maybe<Array<Scalars['String']['output']>>>>;
  includeTypes?: Maybe<Array<Scalars['String']['output']>>;
  includeUrls?: Maybe<Array<Scalars['String']['output']>>;
  modifiedTimeAfter?: Maybe<Scalars['DateTime']['output']>;
  modifiedTimeBefore?: Maybe<Scalars['DateTime']['output']>;
  publishedTimeAfter?: Maybe<Scalars['DateTime']['output']>;
  publishedTimeBefore?: Maybe<Scalars['DateTime']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ArticleFilterInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  excludeAuthors?: InputMaybe<Array<InputMaybe<Array<Scalars['String']['input']>>>>;
  excludeLocales?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSections?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSiteNames?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeTags?: InputMaybe<Array<InputMaybe<Array<Scalars['String']['input']>>>>;
  excludeTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  expirationTimeAfter?: InputMaybe<Scalars['DateTime']['input']>;
  expirationTimeBefore?: InputMaybe<Scalars['DateTime']['input']>;
  includeAuthors?: InputMaybe<Array<InputMaybe<Array<Scalars['String']['input']>>>>;
  includeLocales?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSections?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSiteNames?: InputMaybe<Array<Scalars['String']['input']>>;
  includeTags?: InputMaybe<Array<InputMaybe<Array<Scalars['String']['input']>>>>;
  includeTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  includeUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  modifiedTimeAfter?: InputMaybe<Scalars['DateTime']['input']>;
  modifiedTimeBefore?: InputMaybe<Scalars['DateTime']['input']>;
  publishedTimeAfter?: InputMaybe<Scalars['DateTime']['input']>;
  publishedTimeBefore?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Category = {
  __typename?: 'Category';
  name: CategoryName;
  value: Scalars['String']['output'];
};

export type CategoryInput = {
  name: CategoryName;
  value: Scalars['String']['input'];
};

export const CategoryName = {
  Age: 'AGE',
  App: 'APP',
  AppType: 'APP_TYPE',
  Device: 'DEVICE',
  DeviceType: 'DEVICE_TYPE',
  DeviceVendor: 'DEVICE_VENDOR',
  Gender: 'GENDER',
  GeoCity: 'GEO_CITY',
  GeoContinent: 'GEO_CONTINENT',
  GeoCountry: 'GEO_COUNTRY',
  GeoSubdivision: 'GEO_SUBDIVISION',
  Referrer: 'REFERRER'
} as const;

export type CategoryName = typeof CategoryName[keyof typeof CategoryName];
export const Metric = {
  EngagementTime: 'ENGAGEMENT_TIME',
  UsersViews: 'USERS_VIEWS',
  VisitorsViews: 'VISITORS_VIEWS',
  VisitsViews: 'VISITS_VIEWS'
} as const;

export type Metric = typeof Metric[keyof typeof Metric];
export type Mutation = {
  __typename?: 'Mutation';
  tracker: Array<Maybe<Tracker>>;
};


export type MutationTrackerArgs = {
  availableMinutes?: InputMaybe<Scalars['Int']['input']>;
  origin: Scalars['String']['input'];
};

export const Order = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type Order = typeof Order[keyof typeof Order];
export type Query = {
  __typename?: 'Query';
  article?: Maybe<Article>;
  rank?: Maybe<Rank>;
  tracker: Array<Maybe<Tracker>>;
  trend?: Maybe<Trend>;
};


export type QueryArticleArgs = {
  url: Scalars['String']['input'];
};


export type QueryRankArgs = {
  articleFilter?: InputMaybe<ArticleFilterInput>;
  endDate: Scalars['DateTime']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  metric?: InputMaybe<Metric>;
  order?: InputMaybe<Order>;
  page?: InputMaybe<Scalars['Int']['input']>;
  startDate: Scalars['DateTime']['input'];
};


export type QueryTrendArgs = {
  aggregation?: InputMaybe<AggregationInput>;
  articleFilter?: InputMaybe<ArticleFilterInput>;
  endDate: Scalars['DateTime']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  metric?: InputMaybe<Metric>;
  page?: InputMaybe<Scalars['Int']['input']>;
  startDate: Scalars['DateTime']['input'];
};

export type Rank = {
  __typename?: 'Rank';
  articles?: Maybe<Array<RankAnalytics>>;
  categoryAge?: Maybe<Array<RankAnalytics>>;
  categoryApp?: Maybe<Array<RankAnalytics>>;
  categoryDevice?: Maybe<Array<RankAnalytics>>;
  categoryGender?: Maybe<Array<RankAnalytics>>;
  categoryGeo?: Maybe<Array<RankAnalytics>>;
  categoryReferrer?: Maybe<Array<RankAnalytics>>;
  categoryUtm?: Maybe<Array<RankAnalytics>>;
  parameters: RankParameters;
  total: Scalars['Int']['output'];
};


export type RankCategoryAgeArgs = {
  excludeAges?: InputMaybe<Array<Scalars['String']['input']>>;
  includeAges?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryAppArgs = {
  excludeAppTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeApps?: InputMaybe<Array<Scalars['String']['input']>>;
  includeAppTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  includeApps?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryDeviceArgs = {
  excludeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeDevices?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDevices?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryGenderArgs = {
  excludeGenders?: InputMaybe<Array<Scalars['String']['input']>>;
  includeGenders?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryGeoArgs = {
  excludeCities?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeContinents?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeCountries?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSubdivisions?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCities?: InputMaybe<Array<Scalars['String']['input']>>;
  includeContinents?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCountries?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSubdivisions?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryReferrerArgs = {
  excludeDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeReferrers?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  includeReferrers?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RankCategoryUtmArgs = {
  excludeCampaigns?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeMediums?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSources?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCampaigns?: InputMaybe<Array<Scalars['String']['input']>>;
  includeMediums?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSources?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RankAnalytics = RankAnalyticsBase & {
  __typename?: 'RankAnalytics';
  article?: Maybe<Article>;
  index: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type RankAnalyticsBase = {
  article?: Maybe<Article>;
  index: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type RankParameters = {
  __typename?: 'RankParameters';
  articleFilter?: Maybe<ArticleFilter>;
  endDate: Scalars['DateTime']['output'];
  limit: Scalars['Int']['output'];
  metric: Metric;
  order: Order;
  page: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
};

export type Sort = {
  __typename?: 'Sort';
  category?: Maybe<Category>;
  order: Order;
};

export type SortInput = {
  category?: InputMaybe<CategoryInput>;
  order: Order;
};

export type Tracker = {
  __typename?: 'Tracker';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  origin: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type Trend = {
  __typename?: 'Trend';
  articles?: Maybe<Array<TrendAnalyticsArticle>>;
  categoryAge?: Maybe<Array<TrendAnalyticsAge>>;
  categoryApp?: Maybe<Array<TrendAnalyticsApp>>;
  categoryDevice?: Maybe<Array<TrendAnalyticsDevice>>;
  categoryGender?: Maybe<Array<TrendAnalyticsGender>>;
  categoryGeo?: Maybe<Array<TrendAnalyticsGeo>>;
  categoryReferrer?: Maybe<Array<TrendAnalyticsReferrer>>;
  categoryUtm?: Maybe<Array<TrendAnalyticsUtm>>;
  parameters: TrendParameters;
  total: Array<TrendAnalytics>;
};


export type TrendArticlesArgs = {
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryAgeArgs = {
  excludeAges?: InputMaybe<Array<Scalars['String']['input']>>;
  includeAges?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryAppArgs = {
  excludeAppTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeApps?: InputMaybe<Array<Scalars['String']['input']>>;
  includeAppTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  includeApps?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryDeviceArgs = {
  excludeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeDevices?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDevices?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryGenderArgs = {
  excludeGenders?: InputMaybe<Array<Scalars['String']['input']>>;
  includeGenders?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryGeoArgs = {
  excludeCities?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeContinents?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeCountries?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSubdivisions?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCities?: InputMaybe<Array<Scalars['String']['input']>>;
  includeContinents?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCountries?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSubdivisions?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryReferrerArgs = {
  excludeDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeReferrers?: InputMaybe<Array<Scalars['String']['input']>>;
  includeDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  includeReferrers?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};


export type TrendCategoryUtmArgs = {
  excludeCampaigns?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeMediums?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeSources?: InputMaybe<Array<Scalars['String']['input']>>;
  includeCampaigns?: InputMaybe<Array<Scalars['String']['input']>>;
  includeMediums?: InputMaybe<Array<Scalars['String']['input']>>;
  includeSources?: InputMaybe<Array<Scalars['String']['input']>>;
  top?: InputMaybe<Scalars['Int']['input']>;
};

export type TrendAnalytics = TrendAnalyticsBase & {
  __typename?: 'TrendAnalytics';
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsAge = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsAge';
  age?: Maybe<Scalars['String']['output']>;
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsApp = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsApp';
  app?: Maybe<Scalars['String']['output']>;
  appType?: Maybe<Scalars['String']['output']>;
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsArticle = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsArticle';
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsBase = {
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsDevice = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsDevice';
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  device?: Maybe<Scalars['String']['output']>;
  deviceType?: Maybe<Scalars['String']['output']>;
  deviceVendor?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsGender = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsGender';
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsGeo = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsGeo';
  article?: Maybe<Article>;
  city?: Maybe<Scalars['String']['output']>;
  continent?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  subdivision?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsReferrer = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsReferrer';
  article?: Maybe<Article>;
  date: Scalars['DateTime']['output'];
  domain?: Maybe<Scalars['String']['output']>;
  referrer?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendAnalyticsUtm = TrendAnalyticsBase & {
  __typename?: 'TrendAnalyticsUtm';
  article?: Maybe<Article>;
  campaign?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  medium?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TrendParameters = {
  __typename?: 'TrendParameters';
  aggregation: Aggregation;
  articleFilter?: Maybe<ArticleFilter>;
  endDate: Scalars['DateTime']['output'];
  limit: Scalars['Int']['output'];
  metric: Metric;
  page: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
};

export type TotalEngagementTimeQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalEngagementTimeQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', total: Array<{ __typename?: 'TrendAnalytics', value: number }> } | null };

export type TotalViewsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalViewsQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', total: Array<{ __typename?: 'TrendAnalytics', value: number }> } | null };

export type TotalUniqueUsersQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalUniqueUsersQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', total: Array<{ __typename?: 'TrendAnalytics', value: number }> } | null };

export type ArticleTrendQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  metric?: InputMaybe<Metric>;
  isArticles?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryAge?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryAgeAge?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryApp?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryAppAppType?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryAppApp?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryDevice?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryDeviceDeviceType?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryDeviceDevice?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGender?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGenderGender?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGeo?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGeoContinent?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGeoCountry?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGeoSubdivision?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryReferrer?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryReferrerDomain?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryReferrerReferrer?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryUtm?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryUtmSource?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryUtmMedium?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryUtmCampaign?: InputMaybe<Scalars['Boolean']['input']>;
  includeAges?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeAges?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeAppTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeAppTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeApps?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeApps?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDevices?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDevices?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeGenders?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeGenders?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeContinents?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeContinents?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeSubdivisions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeSubdivisions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCountries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCountries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDomains?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDomains?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeReferrers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeReferrers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeSources?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeSources?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeMediums?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeMediums?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCampaigns?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCampaigns?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ArticleTrendQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', categoryAge?: Array<{ __typename?: 'TrendAnalyticsAge', age?: string | null, date: any, value: number }> | null, categoryApp?: Array<{ __typename?: 'TrendAnalyticsApp', appType?: string | null, app?: string | null, date: any, value: number }> | null, categoryDevice?: Array<{ __typename?: 'TrendAnalyticsDevice', deviceType?: string | null, device?: string | null, date: any, value: number }> | null, categoryGender?: Array<{ __typename?: 'TrendAnalyticsGender', gender?: string | null, date: any, value: number }> | null, categoryGeo?: Array<{ __typename?: 'TrendAnalyticsGeo', continent?: string | null, country?: string | null, subdivision?: string | null, date: any, value: number }> | null, categoryReferrer?: Array<{ __typename?: 'TrendAnalyticsReferrer', domain?: string | null, referrer?: string | null, date: any, value: number }> | null, categoryUtm?: Array<{ __typename?: 'TrendAnalyticsUtm', source?: string | null, medium?: string | null, campaign?: string | null, date: any, value: number }> | null, total?: Array<{ __typename?: 'TrendAnalytics', date: any, value: number }> } | null, total?: { __typename?: 'Trend', categoryAge?: Array<{ __typename?: 'TrendAnalyticsAge', age?: string | null, date: any, value: number }> | null, categoryApp?: Array<{ __typename?: 'TrendAnalyticsApp', appType?: string | null, app?: string | null, date: any, value: number }> | null, categoryDevice?: Array<{ __typename?: 'TrendAnalyticsDevice', deviceType?: string | null, device?: string | null, date: any, value: number }> | null, categoryGender?: Array<{ __typename?: 'TrendAnalyticsGender', gender?: string | null, date: any, value: number }> | null, categoryGeo?: Array<{ __typename?: 'TrendAnalyticsGeo', continent?: string | null, country?: string | null, subdivision?: string | null, date: any, value: number }> | null, categoryReferrer?: Array<{ __typename?: 'TrendAnalyticsReferrer', domain?: string | null, referrer?: string | null, date: any, value: number }> | null, categoryUtm?: Array<{ __typename?: 'TrendAnalyticsUtm', source?: string | null, medium?: string | null, campaign?: string | null, date: any, value: number }> | null, total?: Array<{ __typename?: 'TrendAnalytics', date: any, value: number }> } | null };

export type TrendTemplateFragment = { __typename?: 'Trend', categoryAge?: Array<{ __typename?: 'TrendAnalyticsAge', age?: string | null, date: any, value: number }> | null, categoryApp?: Array<{ __typename?: 'TrendAnalyticsApp', appType?: string | null, app?: string | null, date: any, value: number }> | null, categoryDevice?: Array<{ __typename?: 'TrendAnalyticsDevice', deviceType?: string | null, device?: string | null, date: any, value: number }> | null, categoryGender?: Array<{ __typename?: 'TrendAnalyticsGender', gender?: string | null, date: any, value: number }> | null, categoryGeo?: Array<{ __typename?: 'TrendAnalyticsGeo', continent?: string | null, country?: string | null, subdivision?: string | null, date: any, value: number }> | null, categoryReferrer?: Array<{ __typename?: 'TrendAnalyticsReferrer', domain?: string | null, referrer?: string | null, date: any, value: number }> | null, categoryUtm?: Array<{ __typename?: 'TrendAnalyticsUtm', source?: string | null, medium?: string | null, campaign?: string | null, date: any, value: number }> | null, total?: Array<{ __typename?: 'TrendAnalytics', date: any, value: number }> };

type TrendAnalytics_TrendAnalytics_Fragment = { __typename?: 'TrendAnalytics', date: any, value: number };

type TrendAnalytics_TrendAnalyticsAge_Fragment = { __typename?: 'TrendAnalyticsAge', date: any, value: number };

type TrendAnalytics_TrendAnalyticsApp_Fragment = { __typename?: 'TrendAnalyticsApp', date: any, value: number };

type TrendAnalytics_TrendAnalyticsArticle_Fragment = { __typename?: 'TrendAnalyticsArticle', date: any, value: number };

type TrendAnalytics_TrendAnalyticsDevice_Fragment = { __typename?: 'TrendAnalyticsDevice', date: any, value: number };

type TrendAnalytics_TrendAnalyticsGender_Fragment = { __typename?: 'TrendAnalyticsGender', date: any, value: number };

type TrendAnalytics_TrendAnalyticsGeo_Fragment = { __typename?: 'TrendAnalyticsGeo', date: any, value: number };

type TrendAnalytics_TrendAnalyticsReferrer_Fragment = { __typename?: 'TrendAnalyticsReferrer', date: any, value: number };

type TrendAnalytics_TrendAnalyticsUtm_Fragment = { __typename?: 'TrendAnalyticsUtm', date: any, value: number };

export type TrendAnalyticsFragment =
  | TrendAnalytics_TrendAnalytics_Fragment
  | TrendAnalytics_TrendAnalyticsAge_Fragment
  | TrendAnalytics_TrendAnalyticsApp_Fragment
  | TrendAnalytics_TrendAnalyticsArticle_Fragment
  | TrendAnalytics_TrendAnalyticsDevice_Fragment
  | TrendAnalytics_TrendAnalyticsGender_Fragment
  | TrendAnalytics_TrendAnalyticsGeo_Fragment
  | TrendAnalytics_TrendAnalyticsReferrer_Fragment
  | TrendAnalytics_TrendAnalyticsUtm_Fragment
;

export type TotalCountryQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalCountryQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', categoryGeo?: Array<{ __typename?: 'TrendAnalyticsGeo', country?: string | null, value: number }> | null } | null };

export type TotalCityQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
  country: Scalars['String']['input'];
}>;


export type TotalCityQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', categoryGeo?: Array<{ __typename?: 'TrendAnalyticsGeo', city?: string | null, value: number }> | null } | null };

export type TotalReferrerDomainQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalReferrerDomainQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', categoryReferrer?: Array<{ __typename?: 'TrendAnalyticsReferrer', domain?: string | null, value: number }> | null } | null };

export type TotalUtmCampaignQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
}>;


export type TotalUtmCampaignQuery = { __typename?: 'Query', trend?: { __typename?: 'Trend', categoryUtm?: Array<{ __typename?: 'TrendAnalyticsUtm', campaign?: string | null, value: number }> | null } | null };

export type ArticleRankQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
  articleFilter?: InputMaybe<ArticleFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Order>;
  metric?: InputMaybe<Metric>;
  isArticles?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryAge?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryApp?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryDevice?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGender?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryGeo?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryReferrer?: InputMaybe<Scalars['Boolean']['input']>;
  isCategoryUtm?: InputMaybe<Scalars['Boolean']['input']>;
  includeAges?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeAges?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeAppTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeAppTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeApps?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeApps?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDeviceTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDeviceVendors?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDevices?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDevices?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeGenders?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeGenders?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeContinents?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeContinents?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeSubdivisions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeSubdivisions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCountries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCountries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeDomains?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeDomains?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeReferrers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeReferrers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeSources?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeSources?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeMediums?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeMediums?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  includeCampaigns?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  excludeCampaigns?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ArticleRankQuery = { __typename?: 'Query', rank?: { __typename?: 'Rank', total: number, categoryAge?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryApp?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryDevice?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryGender?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryGeo?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryReferrer?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryUtm?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, articles?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null } | null };

export type RankTemplateFragment = { __typename?: 'Rank', categoryAge?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryApp?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryDevice?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryGender?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryGeo?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryReferrer?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, categoryUtm?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null, articles?: Array<{ __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null }> | null };

export type RankAnalyticsFragment = { __typename?: 'RankAnalytics', index: number, url: string, value: number, article?: { __typename?: 'Article', url: string, title?: string | null, type?: string | null, image?: string | null, siteName: string, publishedTime?: any | null, section?: string | null, analytics?: { __typename?: 'ArticleAnalytics', analytics?: Array<{ __typename?: 'Analytics', value: number }> | null } | null } | null };


export const TrendAnalyticsFragmentDoc = `
    fragment TrendAnalytics on TrendAnalyticsBase {
  date
  value
}
    `;
export const TrendTemplateFragmentDoc = `
    fragment TrendTemplate on Trend {
  categoryAge(includeAges: $includeAges, excludeAges: $excludeAges) @include(if: $isCategoryAge) {
    ...TrendAnalytics
    age @include(if: $isCategoryAgeAge)
  }
  categoryApp(
    includeAppTypes: $includeAppTypes
    excludeAppTypes: $excludeAppTypes
    includeApps: $includeApps
    excludeApps: $excludeApps
  ) @include(if: $isCategoryApp) {
    ...TrendAnalytics
    appType @include(if: $isCategoryAppAppType)
    app @include(if: $isCategoryAppApp)
  }
  categoryDevice(
    includeDeviceTypes: $includeDeviceTypes
    excludeDeviceTypes: $excludeDeviceTypes
    includeDeviceVendors: $includeDeviceVendors
    excludeDeviceVendors: $excludeDeviceVendors
    includeDevices: $includeDevices
    excludeDevices: $excludeDevices
  ) @include(if: $isCategoryDevice) {
    ...TrendAnalytics
    deviceType @include(if: $isCategoryDeviceDeviceType)
    device @include(if: $isCategoryDeviceDevice)
  }
  categoryGender(includeGenders: $includeGenders, excludeGenders: $excludeGenders) @include(if: $isCategoryGender) {
    ...TrendAnalytics
    gender @include(if: $isCategoryGenderGender)
  }
  categoryGeo(
    includeContinents: $includeContinents
    excludeContinents: $excludeContinents
    includeSubdivisions: $includeSubdivisions
    excludeSubdivisions: $excludeSubdivisions
    includeCountries: $includeCountries
    excludeCountries: $excludeCountries
    includeCities: $includeCities
    excludeCities: $excludeCities
  ) @include(if: $isCategoryGeo) {
    ...TrendAnalytics
    continent @include(if: $isCategoryGeoContinent)
    country @include(if: $isCategoryGeoCountry)
    subdivision @include(if: $isCategoryGeoSubdivision)
  }
  categoryReferrer(
    includeDomains: $includeDomains
    excludeDomains: $excludeDomains
    includeReferrers: $includeReferrers
    excludeReferrers: $excludeReferrers
  ) @include(if: $isCategoryReferrer) {
    ...TrendAnalytics
    domain @include(if: $isCategoryReferrerDomain)
    referrer @include(if: $isCategoryReferrerReferrer)
  }
  categoryUtm(
    includeSources: $includeSources
    excludeSources: $excludeSources
    includeMediums: $includeMediums
    excludeMediums: $excludeMediums
    includeCampaigns: $includeCampaigns
    excludeCampaigns: $excludeCampaigns
  ) @include(if: $isCategoryUtm) {
    ...TrendAnalytics
    source @include(if: $isCategoryUtmSource)
    medium @include(if: $isCategoryUtmMedium)
    campaign @include(if: $isCategoryUtmCampaign)
  }
  total @include(if: $isArticles) {
    ...TrendAnalytics
  }
}
    ${TrendAnalyticsFragmentDoc}`;
export const RankAnalyticsFragmentDoc = `
    fragment RankAnalytics on RankAnalytics {
  index
  url
  value
  article {
    url
    title
    type
    image
    siteName
    publishedTime
    section
    analytics(
      startDate: $startDate
      endDate: $endDate
      aggregation: {unit: TOTAL}
      metric: $metric
    ) {
      analytics {
        value
      }
    }
  }
}
    `;
export const RankTemplateFragmentDoc = `
    fragment RankTemplate on Rank {
  categoryAge(includeAges: $includeAges, excludeAges: $excludeAges) @include(if: $isCategoryAge) {
    ...RankAnalytics
  }
  categoryApp(
    includeAppTypes: $includeAppTypes
    excludeAppTypes: $excludeAppTypes
    includeApps: $includeApps
    excludeApps: $excludeApps
  ) @include(if: $isCategoryApp) {
    ...RankAnalytics
  }
  categoryDevice(
    includeDeviceTypes: $includeDeviceTypes
    excludeDeviceTypes: $excludeDeviceTypes
    includeDeviceVendors: $includeDeviceVendors
    excludeDeviceVendors: $excludeDeviceVendors
    includeDevices: $includeDevices
    excludeDevices: $excludeDevices
  ) @include(if: $isCategoryDevice) {
    ...RankAnalytics
  }
  categoryGender(includeGenders: $includeGenders, excludeGenders: $excludeGenders) @include(if: $isCategoryGender) {
    ...RankAnalytics
  }
  categoryGeo(
    includeContinents: $includeContinents
    excludeContinents: $excludeContinents
    includeSubdivisions: $includeSubdivisions
    excludeSubdivisions: $excludeSubdivisions
    includeCountries: $includeCountries
    excludeCountries: $excludeCountries
    includeCities: $includeCities
    excludeCities: $excludeCities
  ) @include(if: $isCategoryGeo) {
    ...RankAnalytics
  }
  categoryReferrer(
    includeDomains: $includeDomains
    excludeDomains: $excludeDomains
    includeReferrers: $includeReferrers
    excludeReferrers: $excludeReferrers
  ) @include(if: $isCategoryReferrer) {
    ...RankAnalytics
  }
  categoryUtm(
    includeSources: $includeSources
    excludeSources: $excludeSources
    includeMediums: $includeMediums
    excludeMediums: $excludeMediums
    includeCampaigns: $includeCampaigns
    excludeCampaigns: $excludeCampaigns
  ) @include(if: $isCategoryUtm) {
    ...RankAnalytics
  }
  articles @include(if: $isArticles) {
    ...RankAnalytics
  }
}
    ${RankAnalyticsFragmentDoc}`;
export const TotalEngagementTimeDocument = `
    query TotalEngagementTime($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: ENGAGEMENT_TIME
  ) {
    total {
      value
    }
  }
}
    `;

export const useTotalEngagementTimeQuery = <
      TData = TotalEngagementTimeQuery,
      TError = unknown
    >(
      variables: TotalEngagementTimeQueryVariables,
      options?: Omit<UseQueryOptions<TotalEngagementTimeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalEngagementTimeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalEngagementTimeQuery, TError, TData>(
      {
    queryKey: ['TotalEngagementTime', variables],
    queryFn: useFetchData<TotalEngagementTimeQuery, TotalEngagementTimeQueryVariables>(TotalEngagementTimeDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalViewsDocument = `
    query TotalViews($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: VISITS_VIEWS
  ) {
    total {
      value
    }
  }
}
    `;

export const useTotalViewsQuery = <
      TData = TotalViewsQuery,
      TError = unknown
    >(
      variables: TotalViewsQueryVariables,
      options?: Omit<UseQueryOptions<TotalViewsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalViewsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalViewsQuery, TError, TData>(
      {
    queryKey: ['TotalViews', variables],
    queryFn: useFetchData<TotalViewsQuery, TotalViewsQueryVariables>(TotalViewsDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalUniqueUsersDocument = `
    query TotalUniqueUsers($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: USERS_VIEWS
  ) {
    total {
      value
    }
  }
}
    `;

export const useTotalUniqueUsersQuery = <
      TData = TotalUniqueUsersQuery,
      TError = unknown
    >(
      variables: TotalUniqueUsersQueryVariables,
      options?: Omit<UseQueryOptions<TotalUniqueUsersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalUniqueUsersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalUniqueUsersQuery, TError, TData>(
      {
    queryKey: ['TotalUniqueUsers', variables],
    queryFn: useFetchData<TotalUniqueUsersQuery, TotalUniqueUsersQueryVariables>(TotalUniqueUsersDocument).bind(null, variables),
    ...options
  }
    )};

export const ArticleTrendDocument = `
    query ArticleTrend($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput, $limit: Int, $page: Int, $metric: Metric, $isArticles: Boolean = false, $isCategoryAge: Boolean = false, $isCategoryAgeAge: Boolean = false, $isCategoryApp: Boolean = false, $isCategoryAppAppType: Boolean = false, $isCategoryAppApp: Boolean = false, $isCategoryDevice: Boolean = false, $isCategoryDeviceDeviceType: Boolean = false, $isCategoryDeviceDevice: Boolean = false, $isCategoryGender: Boolean = false, $isCategoryGenderGender: Boolean = false, $isCategoryGeo: Boolean = false, $isCategoryGeoContinent: Boolean = false, $isCategoryGeoCountry: Boolean = false, $isCategoryGeoSubdivision: Boolean = false, $isCategoryReferrer: Boolean = false, $isCategoryReferrerDomain: Boolean = false, $isCategoryReferrerReferrer: Boolean = false, $isCategoryUtm: Boolean = false, $isCategoryUtmSource: Boolean = false, $isCategoryUtmMedium: Boolean = false, $isCategoryUtmCampaign: Boolean = false, $includeAges: [String!], $excludeAges: [String!], $includeAppTypes: [String!], $excludeAppTypes: [String!], $includeApps: [String!], $excludeApps: [String!], $includeDeviceTypes: [String!], $excludeDeviceTypes: [String!], $includeDeviceVendors: [String!], $excludeDeviceVendors: [String!], $includeDevices: [String!], $excludeDevices: [String!], $includeGenders: [String!], $excludeGenders: [String!], $includeContinents: [String!], $excludeContinents: [String!], $includeSubdivisions: [String!], $excludeSubdivisions: [String!], $includeCountries: [String!], $excludeCountries: [String!], $includeCities: [String!], $excludeCities: [String!], $includeDomains: [String!], $excludeDomains: [String!], $includeReferrers: [String!], $excludeReferrers: [String!], $includeSources: [String!], $excludeSources: [String!], $includeMediums: [String!], $excludeMediums: [String!], $includeCampaigns: [String!], $excludeCampaigns: [String!]) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    limit: $limit
    page: $page
    metric: $metric
    aggregation: {unit: AUTO}
  ) {
    ...TrendTemplate
  }
  total: trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    limit: $limit
    page: $page
    metric: $metric
    aggregation: {unit: TOTAL}
  ) {
    ...TrendTemplate
  }
}
    ${TrendTemplateFragmentDoc}`;

export const useArticleTrendQuery = <
      TData = ArticleTrendQuery,
      TError = unknown
    >(
      variables: ArticleTrendQueryVariables,
      options?: Omit<UseQueryOptions<ArticleTrendQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ArticleTrendQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ArticleTrendQuery, TError, TData>(
      {
    queryKey: ['ArticleTrend', variables],
    queryFn: useFetchData<ArticleTrendQuery, ArticleTrendQueryVariables>(ArticleTrendDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalCountryDocument = `
    query TotalCountry($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: VISITS_VIEWS
  ) {
    categoryGeo {
      country
      value
    }
  }
}
    `;

export const useTotalCountryQuery = <
      TData = TotalCountryQuery,
      TError = unknown
    >(
      variables: TotalCountryQueryVariables,
      options?: Omit<UseQueryOptions<TotalCountryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalCountryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalCountryQuery, TError, TData>(
      {
    queryKey: ['TotalCountry', variables],
    queryFn: useFetchData<TotalCountryQuery, TotalCountryQueryVariables>(TotalCountryDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalCityDocument = `
    query TotalCity($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput, $country: String!) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: VISITS_VIEWS
  ) {
    categoryGeo(includeCountries: [$country]) {
      city
      value
    }
  }
}
    `;

export const useTotalCityQuery = <
      TData = TotalCityQuery,
      TError = unknown
    >(
      variables: TotalCityQueryVariables,
      options?: Omit<UseQueryOptions<TotalCityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalCityQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalCityQuery, TError, TData>(
      {
    queryKey: ['TotalCity', variables],
    queryFn: useFetchData<TotalCityQuery, TotalCityQueryVariables>(TotalCityDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalReferrerDomainDocument = `
    query TotalReferrerDomain($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: VISITS_VIEWS
  ) {
    categoryReferrer {
      domain
      value
    }
  }
}
    `;

export const useTotalReferrerDomainQuery = <
      TData = TotalReferrerDomainQuery,
      TError = unknown
    >(
      variables: TotalReferrerDomainQueryVariables,
      options?: Omit<UseQueryOptions<TotalReferrerDomainQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalReferrerDomainQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalReferrerDomainQuery, TError, TData>(
      {
    queryKey: ['TotalReferrerDomain', variables],
    queryFn: useFetchData<TotalReferrerDomainQuery, TotalReferrerDomainQueryVariables>(TotalReferrerDomainDocument).bind(null, variables),
    ...options
  }
    )};

export const TotalUtmCampaignDocument = `
    query TotalUtmCampaign($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput) {
  trend(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    aggregation: {unit: TOTAL}
    metric: VISITS_VIEWS
  ) {
    categoryUtm {
      campaign
      value
    }
  }
}
    `;

export const useTotalUtmCampaignQuery = <
      TData = TotalUtmCampaignQuery,
      TError = unknown
    >(
      variables: TotalUtmCampaignQueryVariables,
      options?: Omit<UseQueryOptions<TotalUtmCampaignQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TotalUtmCampaignQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TotalUtmCampaignQuery, TError, TData>(
      {
    queryKey: ['TotalUtmCampaign', variables],
    queryFn: useFetchData<TotalUtmCampaignQuery, TotalUtmCampaignQueryVariables>(TotalUtmCampaignDocument).bind(null, variables),
    ...options
  }
    )};

export const ArticleRankDocument = `
    query ArticleRank($startDate: DateTime!, $endDate: DateTime!, $articleFilter: ArticleFilterInput, $limit: Int, $page: Int, $order: Order, $metric: Metric, $isArticles: Boolean = false, $isCategoryAge: Boolean = false, $isCategoryApp: Boolean = false, $isCategoryDevice: Boolean = false, $isCategoryGender: Boolean = false, $isCategoryGeo: Boolean = false, $isCategoryReferrer: Boolean = false, $isCategoryUtm: Boolean = false, $includeAges: [String!], $excludeAges: [String!], $includeAppTypes: [String!], $excludeAppTypes: [String!], $includeApps: [String!], $excludeApps: [String!], $includeDeviceTypes: [String!], $excludeDeviceTypes: [String!], $includeDeviceVendors: [String!], $excludeDeviceVendors: [String!], $includeDevices: [String!], $excludeDevices: [String!], $includeGenders: [String!], $excludeGenders: [String!], $includeContinents: [String!], $excludeContinents: [String!], $includeSubdivisions: [String!], $excludeSubdivisions: [String!], $includeCountries: [String!], $excludeCountries: [String!], $includeCities: [String!], $excludeCities: [String!], $includeDomains: [String!], $excludeDomains: [String!], $includeReferrers: [String!], $excludeReferrers: [String!], $includeSources: [String!], $excludeSources: [String!], $includeMediums: [String!], $excludeMediums: [String!], $includeCampaigns: [String!], $excludeCampaigns: [String!]) {
  rank(
    startDate: $startDate
    endDate: $endDate
    articleFilter: $articleFilter
    limit: $limit
    page: $page
    order: $order
    metric: $metric
  ) {
    total
    ...RankTemplate
  }
}
    ${RankTemplateFragmentDoc}`;

export const useArticleRankQuery = <
      TData = ArticleRankQuery,
      TError = unknown
    >(
      variables: ArticleRankQueryVariables,
      options?: Omit<UseQueryOptions<ArticleRankQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ArticleRankQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ArticleRankQuery, TError, TData>(
      {
    queryKey: ['ArticleRank', variables],
    queryFn: useFetchData<ArticleRankQuery, ArticleRankQueryVariables>(ArticleRankDocument).bind(null, variables),
    ...options
  }
    )};
