CREATE TABLE IF NOT EXISTS lightscope.pv_app_min (
    tenant_id_hash UInt64,
    date DateTime CODEC(Delta(4), LZ4),
    site_name LowCardinality(String),
    url SimpleAggregateFunction(any, String),
    url_hash UInt64,
    app_type LowCardinality(String),
    app LowCardinality(String),
    visits_views AggregateFunction(uniqCombined64, String),
    visitors_views AggregateFunction(uniqCombined64, String),
    users_views AggregateFunction(uniqCombined64, String),
    engagement_time SimpleAggregateFunction(sum, UInt64),
    created_at SimpleAggregateFunction(min, DateTime),
    updated_at SimpleAggregateFunction(max, DateTime),
    INDEX minmax_date date TYPE minmax GRANULARITY 1
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMMDD(date)
PRIMARY KEY (tenant_id_hash, date, site_name, url_hash, app_type, app)
ORDER BY (tenant_id_hash, date, site_name, url_hash, app_type, app)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';

