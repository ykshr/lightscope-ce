CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_device_min_to_hour_mv
TO lightscope.pv_device_hour AS
SELECT
    organization_id_hash,
    toStartOfHour(date) as date,
    site_name,
    any(url) as url,
    url_hash,
    device_type,
    device_vendor,
    device,
    uniqCombined64MergeState(visits_views) AS visits_views,
    uniqCombined64MergeState(visitors_views) AS visitors_views,
    uniqCombined64MergeState(users_views) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() as created_at,
    now() as updated_at
FROM lightscope.pv_device_min
GROUP BY organization_id_hash, date, site_name, url_hash, device_type, device_vendor, device;