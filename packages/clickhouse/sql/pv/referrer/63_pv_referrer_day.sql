CREATE TABLE IF NOT EXISTS lightscope.pv_referrer_day (
    organization_id_hash UInt64,
    date DateTime CODEC(Delta(4), LZ4),
    site_name LowCardinality(String),
    url SimpleAggregateFunction(any, String),
    url_hash UInt64,
    domain SimpleAggregateFunction(any, String),
    domain_hash UInt64,
    referrer SimpleAggregateFunction(any, String),
    referrer_hash UInt64,
    visits_views AggregateFunction(uniqCombined64, String),
    visitors_views AggregateFunction(uniqCombined64, String),
    users_views AggregateFunction(uniqCombined64, String),
    engagement_time SimpleAggregateFunction(sum, UInt64),
    created_at SimpleAggregateFunction(min, DateTime),
    updated_at SimpleAggregateFunction(max, DateTime)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
PRIMARY KEY (organization_id_hash, date, site_name, url_hash, domain_hash, referrer_hash)
ORDER BY (organization_id_hash, date, site_name, url_hash, domain_hash, referrer_hash)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';

