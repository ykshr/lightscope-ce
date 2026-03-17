import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '@/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
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

export enum AggregationUnit {
  Auto = 'AUTO',
  Day = 'DAY',
  Hour = 'HOUR',
  Minute = 'MINUTE',
  Month = 'MONTH',
  Total = 'TOTAL',
  Week = 'WEEK',
  Year = 'YEAR'
}

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

export enum CategoryName {
  Age = 'AGE',
  App = 'APP',
  AppType = 'APP_TYPE',
  Device = 'DEVICE',
  DeviceType = 'DEVICE_TYPE',
  DeviceVendor = 'DEVICE_VENDOR',
  Gender = 'GENDER',
  GeoCity = 'GEO_CITY',
  GeoContinent = 'GEO_CONTINENT',
  GeoCountry = 'GEO_COUNTRY',
  GeoSubdivision = 'GEO_SUBDIVISION',
  Referrer = 'REFERRER'
}

export enum Metric {
  EngagementTime = 'ENGAGEMENT_TIME',
  UsersViews = 'USERS_VIEWS',
  VisitorsViews = 'VISITORS_VIEWS',
  VisitsViews = 'VISITS_VIEWS'
}

export type Mutation = {
  __typename?: 'Mutation';
  createToken: Array<Maybe<Token>>;
};


export type MutationCreateTokenArgs = {
  availableMinutes?: InputMaybe<Scalars['Int']['input']>;
  origin: Scalars['String']['input'];
};

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Query = {
  __typename?: 'Query';
  article?: Maybe<Article>;
  rank?: Maybe<Rank>;
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

export type Token = {
  __typename?: 'Token';
  expirationTime?: Maybe<Scalars['DateTime']['output']>;
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;




/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  AnalyticsBase:
    | ( Analytics )
    | ( AnalyticsAge )
    | ( AnalyticsApp )
    | ( AnalyticsDevice )
    | ( AnalyticsGender )
    | ( AnalyticsGeo )
    | ( AnalyticsReferrer )
    | ( AnalyticsUtm )
  ;
  RankAnalyticsBase: ( RankAnalytics );
  TrendAnalyticsBase:
    | ( TrendAnalytics )
    | ( TrendAnalyticsAge )
    | ( TrendAnalyticsApp )
    | ( TrendAnalyticsArticle )
    | ( TrendAnalyticsDevice )
    | ( TrendAnalyticsGender )
    | ( TrendAnalyticsGeo )
    | ( TrendAnalyticsReferrer )
    | ( TrendAnalyticsUtm )
  ;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Aggregation: ResolverTypeWrapper<Aggregation>;
  AggregationInput: AggregationInput;
  AggregationUnit: AggregationUnit;
  Analytics: ResolverTypeWrapper<Analytics>;
  AnalyticsAge: ResolverTypeWrapper<AnalyticsAge>;
  AnalyticsApp: ResolverTypeWrapper<AnalyticsApp>;
  AnalyticsBase: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnalyticsBase']>;
  AnalyticsDevice: ResolverTypeWrapper<AnalyticsDevice>;
  AnalyticsGender: ResolverTypeWrapper<AnalyticsGender>;
  AnalyticsGeo: ResolverTypeWrapper<AnalyticsGeo>;
  AnalyticsReferrer: ResolverTypeWrapper<AnalyticsReferrer>;
  AnalyticsUtm: ResolverTypeWrapper<AnalyticsUtm>;
  Article: ResolverTypeWrapper<Article>;
  ArticleAnalytics: ResolverTypeWrapper<ArticleAnalytics>;
  ArticleAnalyticsParameters: ResolverTypeWrapper<ArticleAnalyticsParameters>;
  ArticleFilter: ResolverTypeWrapper<ArticleFilter>;
  ArticleFilterInput: ArticleFilterInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Category: ResolverTypeWrapper<Category>;
  CategoryInput: CategoryInput;
  CategoryName: CategoryName;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Metric: Metric;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Order: Order;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Rank: ResolverTypeWrapper<Rank>;
  RankAnalytics: ResolverTypeWrapper<RankAnalytics>;
  RankAnalyticsBase: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['RankAnalyticsBase']>;
  RankParameters: ResolverTypeWrapper<RankParameters>;
  Sort: ResolverTypeWrapper<Sort>;
  SortInput: SortInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Token: ResolverTypeWrapper<Token>;
  Trend: ResolverTypeWrapper<Trend>;
  TrendAnalytics: ResolverTypeWrapper<TrendAnalytics>;
  TrendAnalyticsAge: ResolverTypeWrapper<TrendAnalyticsAge>;
  TrendAnalyticsApp: ResolverTypeWrapper<TrendAnalyticsApp>;
  TrendAnalyticsArticle: ResolverTypeWrapper<TrendAnalyticsArticle>;
  TrendAnalyticsBase: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['TrendAnalyticsBase']>;
  TrendAnalyticsDevice: ResolverTypeWrapper<TrendAnalyticsDevice>;
  TrendAnalyticsGender: ResolverTypeWrapper<TrendAnalyticsGender>;
  TrendAnalyticsGeo: ResolverTypeWrapper<TrendAnalyticsGeo>;
  TrendAnalyticsReferrer: ResolverTypeWrapper<TrendAnalyticsReferrer>;
  TrendAnalyticsUtm: ResolverTypeWrapper<TrendAnalyticsUtm>;
  TrendParameters: ResolverTypeWrapper<TrendParameters>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Aggregation: Aggregation;
  AggregationInput: AggregationInput;
  Analytics: Analytics;
  AnalyticsAge: AnalyticsAge;
  AnalyticsApp: AnalyticsApp;
  AnalyticsBase: ResolversInterfaceTypes<ResolversParentTypes>['AnalyticsBase'];
  AnalyticsDevice: AnalyticsDevice;
  AnalyticsGender: AnalyticsGender;
  AnalyticsGeo: AnalyticsGeo;
  AnalyticsReferrer: AnalyticsReferrer;
  AnalyticsUtm: AnalyticsUtm;
  Article: Article;
  ArticleAnalytics: ArticleAnalytics;
  ArticleAnalyticsParameters: ArticleAnalyticsParameters;
  ArticleFilter: ArticleFilter;
  ArticleFilterInput: ArticleFilterInput;
  Boolean: Scalars['Boolean']['output'];
  Category: Category;
  CategoryInput: CategoryInput;
  DateTime: Scalars['DateTime']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Rank: Rank;
  RankAnalytics: RankAnalytics;
  RankAnalyticsBase: ResolversInterfaceTypes<ResolversParentTypes>['RankAnalyticsBase'];
  RankParameters: RankParameters;
  Sort: Sort;
  SortInput: SortInput;
  String: Scalars['String']['output'];
  Token: Token;
  Trend: Trend;
  TrendAnalytics: TrendAnalytics;
  TrendAnalyticsAge: TrendAnalyticsAge;
  TrendAnalyticsApp: TrendAnalyticsApp;
  TrendAnalyticsArticle: TrendAnalyticsArticle;
  TrendAnalyticsBase: ResolversInterfaceTypes<ResolversParentTypes>['TrendAnalyticsBase'];
  TrendAnalyticsDevice: TrendAnalyticsDevice;
  TrendAnalyticsGender: TrendAnalyticsGender;
  TrendAnalyticsGeo: TrendAnalyticsGeo;
  TrendAnalyticsReferrer: TrendAnalyticsReferrer;
  TrendAnalyticsUtm: TrendAnalyticsUtm;
  TrendParameters: TrendParameters;
};

export type AggregationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Aggregation'] = ResolversParentTypes['Aggregation']> = {
  interval?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['AggregationUnit'], ParentType, ContextType>;
};

export type AnalyticsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Analytics'] = ResolversParentTypes['Analytics']> = {
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsAgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsAge'] = ResolversParentTypes['AnalyticsAge']> = {
  age?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsAppResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsApp'] = ResolversParentTypes['AnalyticsApp']> = {
  app?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  appType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsBaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsBase'] = ResolversParentTypes['AnalyticsBase']> = {
  __resolveType: TypeResolveFn<'Analytics' | 'AnalyticsAge' | 'AnalyticsApp' | 'AnalyticsDevice' | 'AnalyticsGender' | 'AnalyticsGeo' | 'AnalyticsReferrer' | 'AnalyticsUtm', ParentType, ContextType>;
};

export type AnalyticsDeviceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsDevice'] = ResolversParentTypes['AnalyticsDevice']> = {
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  device?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceVendor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsGenderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsGender'] = ResolversParentTypes['AnalyticsGender']> = {
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsGeoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsGeo'] = ResolversParentTypes['AnalyticsGeo']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  continent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  subdivision?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsReferrerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsReferrer'] = ResolversParentTypes['AnalyticsReferrer']> = {
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  domain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referrer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnalyticsUtmResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnalyticsUtm'] = ResolversParentTypes['AnalyticsUtm']> = {
  campaign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']> = {
  analytics?: Resolver<Maybe<ResolversTypes['ArticleAnalytics']>, ParentType, ContextType, RequireFields<ArticleAnalyticsArgs, 'aggregation' | 'endDate' | 'limit' | 'metric' | 'page' | 'startDate'>>;
  authors?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expirationTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locale?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  publishedTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ArticleAnalyticsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ArticleAnalytics'] = ResolversParentTypes['ArticleAnalytics']> = {
  analytics?: Resolver<Maybe<Array<ResolversTypes['Analytics']>>, ParentType, ContextType>;
  analyticsAge?: Resolver<Maybe<Array<ResolversTypes['AnalyticsAge']>>, ParentType, ContextType>;
  analyticsApp?: Resolver<Maybe<Array<ResolversTypes['AnalyticsApp']>>, ParentType, ContextType>;
  analyticsDevice?: Resolver<Maybe<Array<ResolversTypes['AnalyticsDevice']>>, ParentType, ContextType>;
  analyticsGender?: Resolver<Maybe<Array<ResolversTypes['AnalyticsGender']>>, ParentType, ContextType>;
  analyticsGeo?: Resolver<Maybe<Array<ResolversTypes['AnalyticsGeo']>>, ParentType, ContextType>;
  analyticsReferrer?: Resolver<Maybe<Array<ResolversTypes['AnalyticsReferrer']>>, ParentType, ContextType>;
  analyticsUtm?: Resolver<Maybe<Array<ResolversTypes['AnalyticsUtm']>>, ParentType, ContextType>;
  parameters?: Resolver<ResolversTypes['ArticleAnalyticsParameters'], ParentType, ContextType>;
};

export type ArticleAnalyticsParametersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ArticleAnalyticsParameters'] = ResolversParentTypes['ArticleAnalyticsParameters']> = {
  aggregation?: Resolver<ResolversTypes['Aggregation'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  metric?: Resolver<ResolversTypes['Metric'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  siteName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ArticleFilterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ArticleFilter'] = ResolversParentTypes['ArticleFilter']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  excludeAuthors?: Resolver<Maybe<Array<Maybe<Array<ResolversTypes['String']>>>>, ParentType, ContextType>;
  excludeLocales?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  excludeSections?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  excludeSiteNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  excludeTags?: Resolver<Maybe<Array<Maybe<Array<ResolversTypes['String']>>>>, ParentType, ContextType>;
  excludeTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  excludeUrls?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  expirationTimeAfter?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  expirationTimeBefore?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  includeAuthors?: Resolver<Maybe<Array<Maybe<Array<ResolversTypes['String']>>>>, ParentType, ContextType>;
  includeLocales?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  includeSections?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  includeSiteNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  includeTags?: Resolver<Maybe<Array<Maybe<Array<ResolversTypes['String']>>>>, ParentType, ContextType>;
  includeTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  includeUrls?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  modifiedTimeAfter?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  modifiedTimeBefore?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  publishedTimeAfter?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  publishedTimeBefore?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  name?: Resolver<ResolversTypes['CategoryName'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createToken?: Resolver<Array<Maybe<ResolversTypes['Token']>>, ParentType, ContextType, RequireFields<MutationCreateTokenArgs, 'origin'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType, RequireFields<QueryArticleArgs, 'url'>>;
  rank?: Resolver<Maybe<ResolversTypes['Rank']>, ParentType, ContextType, RequireFields<QueryRankArgs, 'endDate' | 'limit' | 'metric' | 'order' | 'page' | 'startDate'>>;
  trend?: Resolver<Maybe<ResolversTypes['Trend']>, ParentType, ContextType, RequireFields<QueryTrendArgs, 'aggregation' | 'endDate' | 'limit' | 'metric' | 'page' | 'startDate'>>;
};

export type RankResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rank'] = ResolversParentTypes['Rank']> = {
  articles?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType>;
  categoryAge?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryAgeArgs>>;
  categoryApp?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryAppArgs>>;
  categoryDevice?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryDeviceArgs>>;
  categoryGender?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryGenderArgs>>;
  categoryGeo?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryGeoArgs>>;
  categoryReferrer?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryReferrerArgs>>;
  categoryUtm?: Resolver<Maybe<Array<ResolversTypes['RankAnalytics']>>, ParentType, ContextType, Partial<RankCategoryUtmArgs>>;
  parameters?: Resolver<ResolversTypes['RankParameters'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type RankAnalyticsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RankAnalytics'] = ResolversParentTypes['RankAnalytics']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RankAnalyticsBaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RankAnalyticsBase'] = ResolversParentTypes['RankAnalyticsBase']> = {
  __resolveType: TypeResolveFn<'RankAnalytics', ParentType, ContextType>;
};

export type RankParametersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RankParameters'] = ResolversParentTypes['RankParameters']> = {
  articleFilter?: Resolver<Maybe<ResolversTypes['ArticleFilter']>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  metric?: Resolver<ResolversTypes['Metric'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Order'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type SortResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Sort'] = ResolversParentTypes['Sort']> = {
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Order'], ParentType, ContextType>;
};

export type TokenResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  expirationTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  origin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type TrendResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Trend'] = ResolversParentTypes['Trend']> = {
  articles?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsArticle']>>, ParentType, ContextType, RequireFields<TrendArticlesArgs, 'top'>>;
  categoryAge?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsAge']>>, ParentType, ContextType, RequireFields<TrendCategoryAgeArgs, 'top'>>;
  categoryApp?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsApp']>>, ParentType, ContextType, RequireFields<TrendCategoryAppArgs, 'top'>>;
  categoryDevice?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsDevice']>>, ParentType, ContextType, RequireFields<TrendCategoryDeviceArgs, 'top'>>;
  categoryGender?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsGender']>>, ParentType, ContextType, RequireFields<TrendCategoryGenderArgs, 'top'>>;
  categoryGeo?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsGeo']>>, ParentType, ContextType, RequireFields<TrendCategoryGeoArgs, 'top'>>;
  categoryReferrer?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsReferrer']>>, ParentType, ContextType, RequireFields<TrendCategoryReferrerArgs, 'top'>>;
  categoryUtm?: Resolver<Maybe<Array<ResolversTypes['TrendAnalyticsUtm']>>, ParentType, ContextType, RequireFields<TrendCategoryUtmArgs, 'top'>>;
  parameters?: Resolver<ResolversTypes['TrendParameters'], ParentType, ContextType>;
  total?: Resolver<Array<ResolversTypes['TrendAnalytics']>, ParentType, ContextType>;
};

export type TrendAnalyticsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalytics'] = ResolversParentTypes['TrendAnalytics']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsAgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsAge'] = ResolversParentTypes['TrendAnalyticsAge']> = {
  age?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsAppResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsApp'] = ResolversParentTypes['TrendAnalyticsApp']> = {
  app?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  appType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsArticleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsArticle'] = ResolversParentTypes['TrendAnalyticsArticle']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsBaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsBase'] = ResolversParentTypes['TrendAnalyticsBase']> = {
  __resolveType: TypeResolveFn<'TrendAnalytics' | 'TrendAnalyticsAge' | 'TrendAnalyticsApp' | 'TrendAnalyticsArticle' | 'TrendAnalyticsDevice' | 'TrendAnalyticsGender' | 'TrendAnalyticsGeo' | 'TrendAnalyticsReferrer' | 'TrendAnalyticsUtm', ParentType, ContextType>;
};

export type TrendAnalyticsDeviceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsDevice'] = ResolversParentTypes['TrendAnalyticsDevice']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  device?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceVendor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsGenderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsGender'] = ResolversParentTypes['TrendAnalyticsGender']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsGeoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsGeo'] = ResolversParentTypes['TrendAnalyticsGeo']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  continent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  subdivision?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsReferrerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsReferrer'] = ResolversParentTypes['TrendAnalyticsReferrer']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  domain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referrer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendAnalyticsUtmResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendAnalyticsUtm'] = ResolversParentTypes['TrendAnalyticsUtm']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  campaign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrendParametersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TrendParameters'] = ResolversParentTypes['TrendParameters']> = {
  aggregation?: Resolver<ResolversTypes['Aggregation'], ParentType, ContextType>;
  articleFilter?: Resolver<Maybe<ResolversTypes['ArticleFilter']>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  metric?: Resolver<ResolversTypes['Metric'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Aggregation?: AggregationResolvers<ContextType>;
  Analytics?: AnalyticsResolvers<ContextType>;
  AnalyticsAge?: AnalyticsAgeResolvers<ContextType>;
  AnalyticsApp?: AnalyticsAppResolvers<ContextType>;
  AnalyticsBase?: AnalyticsBaseResolvers<ContextType>;
  AnalyticsDevice?: AnalyticsDeviceResolvers<ContextType>;
  AnalyticsGender?: AnalyticsGenderResolvers<ContextType>;
  AnalyticsGeo?: AnalyticsGeoResolvers<ContextType>;
  AnalyticsReferrer?: AnalyticsReferrerResolvers<ContextType>;
  AnalyticsUtm?: AnalyticsUtmResolvers<ContextType>;
  Article?: ArticleResolvers<ContextType>;
  ArticleAnalytics?: ArticleAnalyticsResolvers<ContextType>;
  ArticleAnalyticsParameters?: ArticleAnalyticsParametersResolvers<ContextType>;
  ArticleFilter?: ArticleFilterResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Rank?: RankResolvers<ContextType>;
  RankAnalytics?: RankAnalyticsResolvers<ContextType>;
  RankAnalyticsBase?: RankAnalyticsBaseResolvers<ContextType>;
  RankParameters?: RankParametersResolvers<ContextType>;
  Sort?: SortResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  Trend?: TrendResolvers<ContextType>;
  TrendAnalytics?: TrendAnalyticsResolvers<ContextType>;
  TrendAnalyticsAge?: TrendAnalyticsAgeResolvers<ContextType>;
  TrendAnalyticsApp?: TrendAnalyticsAppResolvers<ContextType>;
  TrendAnalyticsArticle?: TrendAnalyticsArticleResolvers<ContextType>;
  TrendAnalyticsBase?: TrendAnalyticsBaseResolvers<ContextType>;
  TrendAnalyticsDevice?: TrendAnalyticsDeviceResolvers<ContextType>;
  TrendAnalyticsGender?: TrendAnalyticsGenderResolvers<ContextType>;
  TrendAnalyticsGeo?: TrendAnalyticsGeoResolvers<ContextType>;
  TrendAnalyticsReferrer?: TrendAnalyticsReferrerResolvers<ContextType>;
  TrendAnalyticsUtm?: TrendAnalyticsUtmResolvers<ContextType>;
  TrendParameters?: TrendParametersResolvers<ContextType>;
};

