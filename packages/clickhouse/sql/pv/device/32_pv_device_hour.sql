CREATE TABLE IF NOT EXISTS lightscope.pv_device_hour (
    tenant_id UInt64,
    date DateTime CODEC(Delta(4), LZ4),
    site_name LowCardinality(String),
    url SimpleAggregateFunction(any, String),
    url_hash UInt64,
    device_type LowCardinality(String),
    device_vendor LowCardinality(String),
    device LowCardinality(String),
    visits_views AggregateFunction(uniqCombined64, String),
    visitors_views AggregateFunction(uniqCombined64, String),
    users_views AggregateFunction(uniqCombined64, String),
    engagement_time SimpleAggregateFunction(sum, UInt64),
    created_at SimpleAggregateFunction(min, DateTime),
    updated_at SimpleAggregateFunction(max, DateTime),
    INDEX minmax_date date TYPE minmax GRANULARITY 1
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
PRIMARY KEY (tenant_id, date, site_name, url_hash, device_type, device_vendor, device)
ORDER BY (tenant_id, date, site_name, url_hash, device_type, device_vendor, device)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';

