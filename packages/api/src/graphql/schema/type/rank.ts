export default /* GraphQL */ `
  type Rank {
    total: Int!
    categoryAge(includeAges: [String!], excludeAges: [String!]): [RankAnalytics!]
    categoryApp(
      includeAppTypes: [String!]
      excludeAppTypes: [String!]
      includeApps: [String!]
      excludeApps: [String!]
    ): [RankAnalytics!]
    categoryDevice(
      includeDeviceTypes: [String!]
      excludeDeviceTypes: [String!]
      includeDeviceVendors: [String!]
      excludeDeviceVendors: [String!]
      includeDevices: [String!]
      excludeDevices: [String!]
    ): [RankAnalytics!]
    categoryGender(includeGenders: [String!], excludeGenders: [String!]): [RankAnalytics!]
    categoryGeo(
      includeContinents: [String!]
      excludeContinents: [String!]
      includeSubdivisions: [String!]
      excludeSubdivisions: [String!]
      includeCountries: [String!]
      excludeCountries: [String!]
      includeCities: [String!]
      excludeCities: [String!]
    ): [RankAnalytics!]
    categoryReferrer(
      includeDomains: [String!]
      excludeDomains: [String!]
      includeReferrers: [String!]
      excludeReferrers: [String!]
    ): [RankAnalytics!]
    categoryUtm(
      includeSources: [String!]
      excludeSources: [String!]
      includeMediums: [String!]
      excludeMediums: [String!]
      includeCampaigns: [String!]
      excludeCampaigns: [String!]
    ): [RankAnalytics!]
    articles: [RankAnalytics!]
    parameters: RankParameters!
  }

  type RankParameters {
    startDate: DateTime!
    endDate: DateTime!
    articleFilter: ArticleFilter
    order: Order!
    limit: Int!
    page: Int!
    metric: Metric!
  }

  interface RankAnalyticsBase {
    index: Int!
    value: Int!
    url: String!
    article: Article
  }

  type RankAnalytics implements RankAnalyticsBase {
    index: Int!
    value: Int!
    url: String!
    article: Article
  }
`;
