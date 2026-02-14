CREATE TABLE IF NOT EXISTS lightscope.article (
    tenant_id UInt64,
    url String,
    url_hash UInt64 MATERIALIZED cityHash64(url),
    title String,
    type LowCardinality(String),
    image String,
    description String,
    site_name LowCardinality(String),
    locale LowCardinality(String),
    published_time DateTime,
    modified_time DateTime,
    expiration_time DateTime,
    authors Array(String),
    authors_hash Array(UInt64) MATERIALIZED arrayMap(x -> cityHash64(x), authors),
    section LowCardinality(String),
    tags Array(String),
    tags_hash Array(UInt64) MATERIALIZED arrayMap(x -> cityHash64(x), tags),
    created_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(created_at)
PARTITION BY toYYYYMM(created_at)
ORDER BY (tenant_id, url_hash)
SETTINGS
    index_granularity = 8192,
    storage_policy = 'lightscope_storage_policy';
