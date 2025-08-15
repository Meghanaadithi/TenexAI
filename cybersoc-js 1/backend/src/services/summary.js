function buildSummary(events) {
  const byStatus = {};
  const byMethod = {};
  const domainCounts = {};
  const timelineCounts = {};

  for (const ev of events) {
    if (ev.status_code != null) byStatus[String(ev.status_code)] = (byStatus[String(ev.status_code)] || 0) + 1;
    if (ev.method) byMethod[ev.method] = (byMethod[ev.method] || 0) + 1;
    if (ev.domain) domainCounts[ev.domain] = (domainCounts[ev.domain] || 0) + 1;
    const minute = new Date(ev.ts).toISOString().slice(0,16);
    timelineCounts[minute] = (timelineCounts[minute] || 0) + 1;
  }

  const topDomains = Object.entries(domainCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10)
    .map(([domain,count]) => ({ domain, count }));

  const timeline = Object.entries(timelineCounts)
    .sort((a,b)=> a[0].localeCompare(b[0]))
    .map(([minute,count]) => ({ minute, count }));

  return {
    totalEvents: events.length,
    byStatus,
    byMethod,
    topDomains,
    timeline
  };
}

module.exports = { buildSummary };
