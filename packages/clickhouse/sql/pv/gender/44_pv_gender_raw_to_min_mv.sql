CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_gender_raw_to_min_mv
TO lightscope.pv_gender_min AS
SELECT
    tenant_id_hash,
    toStartOfFiveMinutes(event_time) AS date,
    site_name,
    any(url) as url,
    url_hash,
    gender,
    uniqCombined64State(visit_id) AS visits_views,
    uniqCombined64State(visitor_id) AS visitors_views,
    uniqCombined64State(user_id) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() AS created_at,
    now() AS updated_at
FROM lightscope.pv_raw
WHERE gender != ''
GROUP BY tenant_id_hash, date, site_name, url_hash, gender;
