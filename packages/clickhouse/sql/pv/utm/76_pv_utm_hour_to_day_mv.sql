CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_utm_hour_to_day_mv
TO lightscope.pv_utm_day AS
SELECT
    organization_id_hash,
    toStartOfDay(date) AS date,
    site_name,
    any(url) as url,
    url_hash,
    utm_source,
    utm_medium,
    utm_campaign,
    uniqCombined64MergeState(visits_views) AS visits_views,
    uniqCombined64MergeState(visitors_views) AS visitors_views,
    uniqCombined64MergeState(users_views) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() AS created_at,
    now() AS updated_at
FROM lightscope.pv_utm_hour
GROUP BY organization_id_hash, date, site_name, url_hash, utm_source, utm_medium, utm_campaign;
