// --- ID Management Logic ---
export function getOrCreateVisitorId(): string {
  const key = 'analytics_visitor_id';
  const dateKey = 'analytics_visitor_date';
  const today = new Date().toISOString().split('T')[0];
  let vid = localStorage.getItem(key);
  const lastDate = localStorage.getItem(dateKey);

  if (!vid || lastDate !== today) {
    vid = crypto.randomUUID();
    localStorage.setItem(key, vid);
    localStorage.setItem(dateKey, today);
  }
  return vid;
}

type visitIdOptions = {
  visitTimeoutMinutes?: number;
};

export function getOrCreateVisitId(options: visitIdOptions = {}): string {
  const key = 'analytics_visit_id';
  const tsKey = 'analytics_visit_last_ts';
  const now = Date.now();
  const timeoutMs = (options.visitTimeoutMinutes || 30) * 60 * 1000;

  let sid = localStorage.getItem(key);
  const lastTs = Number(localStorage.getItem(tsKey) || 0);

  if (!sid || now - lastTs > timeoutMs) {
    sid = crypto.randomUUID();
    localStorage.setItem(key, sid);
  }
  localStorage.setItem(tsKey, now.toString());
  return sid;
}
