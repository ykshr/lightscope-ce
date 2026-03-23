CREATE MATERIALIZED VIEW IF NOT EXISTS lightscope.pv_referrer_min_to_hour_mv
TO lightscope.pv_referrer_hour AS
SELECT
    tenant_id_hash,
    toStartOfHour(date) AS date,
    site_name,
    any(url) as url,
    url_hash,
    any(domain) as domain,
    domain_hash,
    any(referrer) as referrer,
    referrer_hash,
    uniqCombined64MergeState(visits_views) AS visits_views,
    uniqCombined64MergeState(visitors_views) AS visitors_views,
    uniqCombined64MergeState(users_views) AS users_views,
    sum(engagement_time) AS engagement_time,
    now() AS created_at,
    now() AS updated_at
FROM lightscope.pv_referrer_min
GROUP BY tenant_id_hash, date, site_name, url_hash, domain_hash, referrer_hash;
