export default `
type Aggregation {
  """If unit is not AUTO or Total, specifies the interval for aggregation."""
  interval: Int
  unit: AggregationUnit!
}

input AggregationInput {
  """If unit is not AUTO or Total, specifies the interval for aggregation."""
  interval: Int
  unit: AggregationUnit!
}

enum AggregationUnit {
  AUTO
  DAY
  HOUR
  MINUTE
  MONTH
  TOTAL
  WEEK
  YEAR
}

type Analytics implements AnalyticsBase {
  date: DateTime!
  value: Int!
}

type AnalyticsAge implements AnalyticsBase {
  age: String
  date: DateTime!
  value: Int!
}

type AnalyticsApp implements AnalyticsBase {
  app: String
  appType: String
  date: DateTime!
  value: Int!
}

interface AnalyticsBase {
  date: DateTime!
  value: Int!
}

type AnalyticsDevice implements AnalyticsBase {
  date: DateTime!
  device: String
  deviceType: String
  deviceVendor: String
  value: Int!
}

type AnalyticsGender implements AnalyticsBase {
  date: DateTime!
  gender: String
  value: Int!
}

type AnalyticsGeo implements AnalyticsBase {
  city: String
  continent: String
  country: String
  date: DateTime!
  subdivision: String
  value: Int!
}

type AnalyticsReferrer implements AnalyticsBase {
  date: DateTime!
  domain: String
  referrer: String
  value: Int!
}

type AnalyticsUtm implements AnalyticsBase {
  campaign: String
  date: DateTime!
  medium: String
  source: String
  value: Int!
}

type Article {
  analytics(aggregation: AggregationInput = {unit: AUTO}, endDate: DateTime!, limit: Int = 100, metric: Metric = VISITS_VIEWS, page: Int = 1, startDate: DateTime!): ArticleAnalytics
  authors: [String!]!
  description: String
  expirationTime: DateTime
  image: String
  locale: String
  modifiedTime: DateTime
  publishedTime: DateTime
  section: String
  siteName: String!
  tags: [String!]!
  title: String
  type: String
  url: String!
}

type ArticleAnalytics {
  analytics: [Analytics!]
  analyticsAge: [AnalyticsAge!]
  analyticsApp: [AnalyticsApp!]
  analyticsDevice: [AnalyticsDevice!]
  analyticsGender: [AnalyticsGender!]
  analyticsGeo: [AnalyticsGeo!]
  analyticsReferrer: [AnalyticsReferrer!]
  analyticsUtm: [AnalyticsUtm!]
  parameters: ArticleAnalyticsParameters!
}

type ArticleAnalyticsParameters {
  aggregation: Aggregation!
  endDate: DateTime!
  limit: Int!
  metric: Metric!
  page: Int!
  siteName: String!
  startDate: DateTime!
  url: String!
}

type ArticleFilter {
  description: String
  excludeAuthors: [[String!]]
  excludeLocales: [String!]
  excludeSections: [String!]
  excludeSiteNames: [String!]
  excludeTags: [[String!]]
  excludeTypes: [String!]
  excludeUrls: [String!]
  expirationTimeAfter: DateTime
  expirationTimeBefore: DateTime
  includeAuthors: [[String!]]
  includeLocales: [String!]
  includeSections: [String!]
  includeSiteNames: [String!]
  includeTags: [[String!]]
  includeTypes: [String!]
  includeUrls: [String!]
  modifiedTimeAfter: DateTime
  modifiedTimeBefore: DateTime
  publishedTimeAfter: DateTime
  publishedTimeBefore: DateTime
  title: String
}

input ArticleFilterInput {
  description: String
  excludeAuthors: [[String!]]
  excludeLocales: [String!]
  excludeSections: [String!]
  excludeSiteNames: [String!]
  excludeTags: [[String!]]
  excludeTypes: [String!]
  excludeUrls: [String!]
  expirationTimeAfter: DateTime
  expirationTimeBefore: DateTime
  includeAuthors: [[String!]]
  includeLocales: [String!]
  includeSections: [String!]
  includeSiteNames: [String!]
  includeTags: [[String!]]
  includeTypes: [String!]
  includeUrls: [String!]
  modifiedTimeAfter: DateTime
  modifiedTimeBefore: DateTime
  publishedTimeAfter: DateTime
  publishedTimeBefore: DateTime
  title: String
}

type Category {
  name: CategoryName!
  value: String!
}

input CategoryInput {
  name: CategoryName!
  value: String!
}

enum CategoryName {
  AGE
  APP
  APP_TYPE
  DEVICE
  DEVICE_TYPE
  DEVICE_VENDOR
  GENDER
  GEO_CITY
  GEO_CONTINENT
  GEO_COUNTRY
  GEO_SUBDIVISION
  REFERRER
}

scalar DateTime

enum Metric {
  ENGAGEMENT_TIME
  USERS_VIEWS
  VISITORS_VIEWS
  VISITS_VIEWS
}

type Mutation {
  createToken(availableMinutes: Int, origin: String!): [Token]!
}

enum Order {
  ASC
  DESC
}

type Query {
  article(url: String!): Article
  rank(articleFilter: ArticleFilterInput, endDate: DateTime!, limit: Int = 100, metric: Metric = VISITS_VIEWS, order: Order = DESC, page: Int = 1, startDate: DateTime!): Rank
  trend(aggregation: AggregationInput = {unit: AUTO}, articleFilter: ArticleFilterInput, endDate: DateTime!, limit: Int = 100, metric: Metric = VISITS_VIEWS, page: Int = 1, startDate: DateTime!): Trend
}

type Rank {
  articles: [RankAnalytics!]
  categoryAge(excludeAges: [String!], includeAges: [String!]): [RankAnalytics!]
  categoryApp(excludeAppTypes: [String!], excludeApps: [String!], includeAppTypes: [String!], includeApps: [String!]): [RankAnalytics!]
  categoryDevice(excludeDeviceTypes: [String!], excludeDeviceVendors: [String!], excludeDevices: [String!], includeDeviceTypes: [String!], includeDeviceVendors: [String!], includeDevices: [String!]): [RankAnalytics!]
  categoryGender(excludeGenders: [String!], includeGenders: [String!]): [RankAnalytics!]
  categoryGeo(excludeCities: [String!], excludeContinents: [String!], excludeCountries: [String!], excludeSubdivisions: [String!], includeCities: [String!], includeContinents: [String!], includeCountries: [String!], includeSubdivisions: [String!]): [RankAnalytics!]
  categoryReferrer(excludeDomains: [String!], excludeReferrers: [String!], includeDomains: [String!], includeReferrers: [String!]): [RankAnalytics!]
  categoryUtm(excludeCampaigns: [String!], excludeMediums: [String!], excludeSources: [String!], includeCampaigns: [String!], includeMediums: [String!], includeSources: [String!]): [RankAnalytics!]
  parameters: RankParameters!
  total: Int!
}

type RankAnalytics implements RankAnalyticsBase {
  article: Article
  index: Int!
  url: String!
  value: Int!
}

interface RankAnalyticsBase {
  article: Article
  index: Int!
  url: String!
  value: Int!
}

type RankParameters {
  articleFilter: ArticleFilter
  endDate: DateTime!
  limit: Int!
  metric: Metric!
  order: Order!
  page: Int!
  startDate: DateTime!
}

type Sort {
  category: Category
  order: Order!
}

input SortInput {
  category: CategoryInput
  order: Order!
}

type Token {
  expirationTime: DateTime
  origin: String!
  token: String!
}

type Trend {
  articles(top: Int = 10): [TrendAnalyticsArticle!]
  categoryAge(excludeAges: [String!], includeAges: [String!], top: Int = 10): [TrendAnalyticsAge!]
  categoryApp(excludeAppTypes: [String!], excludeApps: [String!], includeAppTypes: [String!], includeApps: [String!], top: Int = 10): [TrendAnalyticsApp!]
  categoryDevice(excludeDeviceTypes: [String!], excludeDeviceVendors: [String!], excludeDevices: [String!], includeDeviceTypes: [String!], includeDeviceVendors: [String!], includeDevices: [String!], top: Int = 10): [TrendAnalyticsDevice!]
  categoryGender(excludeGenders: [String!], includeGenders: [String!], top: Int = 10): [TrendAnalyticsGender!]
  categoryGeo(excludeCities: [String!], excludeContinents: [String!], excludeCountries: [String!], excludeSubdivisions: [String!], includeCities: [String!], includeContinents: [String!], includeCountries: [String!], includeSubdivisions: [String!], top: Int = 10): [TrendAnalyticsGeo!]
  categoryReferrer(excludeDomains: [String!], excludeReferrers: [String!], includeDomains: [String!], includeReferrers: [String!], top: Int = 10): [TrendAnalyticsReferrer!]
  categoryUtm(excludeCampaigns: [String!], excludeMediums: [String!], excludeSources: [String!], includeCampaigns: [String!], includeMediums: [String!], includeSources: [String!], top: Int = 10): [TrendAnalyticsUtm!]
  parameters: TrendParameters!
  total: [TrendAnalytics!]!
}

type TrendAnalytics implements TrendAnalyticsBase {
  article: Article
  date: DateTime!
  url: String
  value: Int!
}

type TrendAnalyticsAge implements TrendAnalyticsBase {
  age: String
  article: Article
  date: DateTime!
  url: String!
  value: Int!
}

type TrendAnalyticsApp implements TrendAnalyticsBase {
  app: String
  appType: String
  article: Article
  date: DateTime!
  url: String!
  value: Int!
}

type TrendAnalyticsArticle implements TrendAnalyticsBase {
  article: Article
  date: DateTime!
  url: String!
  value: Int!
}

interface TrendAnalyticsBase {
  article: Article
  date: DateTime!
  url: String
  value: Int!
}

type TrendAnalyticsDevice implements TrendAnalyticsBase {
  article: Article
  date: DateTime!
  device: String
  deviceType: String
  deviceVendor: String
  url: String!
  value: Int!
}

type TrendAnalyticsGender implements TrendAnalyticsBase {
  article: Article
  date: DateTime!
  gender: String
  url: String!
  value: Int!
}

type TrendAnalyticsGeo implements TrendAnalyticsBase {
  article: Article
  city: String
  continent: String
  country: String
  date: DateTime!
  subdivision: String
  url: String!
  value: Int!
}

type TrendAnalyticsReferrer implements TrendAnalyticsBase {
  article: Article
  date: DateTime!
  domain: String
  referrer: String
  url: String!
  value: Int!
}

type TrendAnalyticsUtm implements TrendAnalyticsBase {
  article: Article
  campaign: String
  date: DateTime!
  medium: String
  source: String
  url: String!
  value: Int!
}

type TrendParameters {
  aggregation: Aggregation!
  articleFilter: ArticleFilter
  endDate: DateTime!
  limit: Int!
  metric: Metric!
  page: Int!
  startDate: DateTime!
}
`;