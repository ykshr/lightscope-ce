CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_device_hour_to_day_mv
TO lightscope.pv_device_day AS
SELECT
    tenant_id_hash,
    toStartOfDay(date) as date,
    site_name,
    any(url) as url,
    url_hash,
    device_type,
    device_vendor,
    device,
    uniqCombined64MergeState(visits_views) as visits_views,
    uniqCombined64MergeState(visitors_views) as visitors_views,
    uniqCombined64MergeState(users_views) as users_views,
    sum(engagement_time) AS engagement_time,
    now() as created_at,
    now() as updated_at
FROM lightscope.pv_device_hour
GROUP BY tenant_id_hash, date, site_name, url_hash, device_type, device_vendor, device;