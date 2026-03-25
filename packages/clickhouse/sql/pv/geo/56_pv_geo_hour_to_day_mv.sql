CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_geo_hour_to_day_mv
TO lightscope.pv_geo_day AS
SELECT
    organization_id_hash,
    toStartOfDay(date) as date,
    site_name,
    any(url) as url,
    url_hash,
    geo_continent,
    geo_country,
    geo_subdivision,
    geo_city,
    uniqCombined64MergeState(visits_views) as visits_views,
    uniqCombined64MergeState(visitors_views) as visitors_views,
    uniqCombined64MergeState(users_views) as users_views,
    sum(engagement_time) AS engagement_time,
    now() as created_at,
    now() as updated_at
FROM lightscope.pv_geo_hour
GROUP BY organization_id_hash, date, site_name, url_hash, geo_continent, geo_country, geo_subdivision, geo_city;