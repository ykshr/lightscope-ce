CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_referrer_raw_to_min_mv
TO lightscope.pv_referrer_min AS
SELECT
    tenant_id,
    toStartOfFiveMinutes(event_time) AS date,
    site_name,
    any(url) as url,
    url_hash,
    any(domain) as domain,
    domain_hash,
    any(referrer) as referrer,
    referrer_hash,
    uniqCombined64State(visit_id) AS visits_views,
    uniqCombined64State(visitor_id) AS visitors_views,
    uniqCombined64State(user_id) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() AS created_at,
    now() AS updated_at
FROM lightscope.pv_raw
WHERE referrer != ''
GROUP BY tenant_id, date, site_name, url_hash, domain_hash, referrer_hash;
