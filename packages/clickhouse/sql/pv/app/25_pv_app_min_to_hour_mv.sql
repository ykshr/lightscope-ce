CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_app_min_to_hour_mv
TO lightscope.pv_app_hour AS
SELECT
    tenant_id_hash,
    toStartOfHour(date) as date,
    site_name,
    any(url) as url,
    url_hash,
    app_type,
    app,
    uniqCombined64MergeState(visits_views) AS visits_views,
    uniqCombined64MergeState(visitors_views) AS visitors_views,
    uniqCombined64MergeState(users_views) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() as created_at,
    now() as updated_at
FROM lightscope.pv_app_min
GROUP BY tenant_id_hash, date, site_name, url_hash, app_type, app;