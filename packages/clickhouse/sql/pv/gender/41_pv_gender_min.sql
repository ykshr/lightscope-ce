CREATE TABLE IF NOT EXISTS lightscope.pv_gender_min (
    organizationorganization_id_hash_id UInt64,
    date DateTime CODEC(Delta(4), LZ4),
    site_name LowCardinality(String),
    url SimpleAggregateFunction(any, String),
    url_hash UInt64,
    gender LowCardinality(String),
    visits_views AggregateFunction(uniqCombined64, String),
    visitors_views AggregateFunction(uniqCombined64, String),
    users_views AggregateFunction(uniqCombined64, String),
    engagement_time SimpleAggregateFunction(sum, UInt64),
    created_at SimpleAggregateFunction(min, DateTime),
    updated_at SimpleAggregateFunction(max, DateTime),
    INDEX minmax_date date TYPE minmax GRANULARITY 1
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMMDD(date)
PRIMARY KEY (organization_id_hash, date, site_name, url_hash, gender)
ORDER BY (organization_id_hash, date, site_name, url_hash, gender)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';

