CREATE TABLE IF NOT EXISTS lightscope.pv_age_min (
    tenant_id UInt64,
    date DateTime CODEC(Delta(4), LZ4),
    site_name LowCardinality(String),
    url SimpleAggregateFunction(any, String),
    url_hash UInt64,
    age LowCardinality(String),
    visits_views AggregateFunction(uniqCombined64, UInt64),
    visitors_views AggregateFunction(uniqCombined64, UInt64),
    users_views AggregateFunction(uniqCombined64, UInt64),
    engagement_time SimpleAggregateFunction(sum, UInt64),
    created_at SimpleAggregateFunction(min, DateTime),
    updated_at SimpleAggregateFunction(max, DateTime),
    INDEX minmax_date date TYPE minmax GRANULARITY 1
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMMDD(date)
PRIMARY KEY (tenant_id, date, site_name, url_hash, age)
ORDER BY (tenant_id, date, site_name, url_hash, age)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';

