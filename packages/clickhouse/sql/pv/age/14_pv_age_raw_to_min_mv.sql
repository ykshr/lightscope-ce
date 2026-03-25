CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_age_raw_to_min_mv
TO lightscope.pv_age_min AS
SELECT
    organization_id_hash,
    toStartOfFiveMinutes(event_time) AS date,
    site_name,
    any(url) as url,
    url_hash,
    age,
    uniqCombined64State(visit_id) AS visits_views,
    uniqCombined64State(visitor_id) AS visitors_views,
    uniqCombined64State(user_id) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() AS created_at,
    now() AS updated_at
FROM lightscope.pv_raw
WHERE age != ''
GROUP BY organization_id_hash, date, site_name, url_hash, age;
