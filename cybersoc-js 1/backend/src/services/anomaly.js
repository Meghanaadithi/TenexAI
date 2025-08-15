function zScore(x, mean, std) {
  if (std === 0) return 0;
  return (x - mean) / std;
}

function detectAnomalies(uploadId, events) {
  const anomalies = [];
  if (!events.length) return anomalies;

  // 1) IP burst per minute
  const byIpMinute = {};
  for (const ev of events) {
    const minute = new Date(ev.ts).toISOString().slice(0,16);
    const key = `${ev.src_ip || 'unknown'}|${minute}`;
    byIpMinute[key] = (byIpMinute[key] || 0) + 1;
  }
  const vals = Object.values(byIpMinute);
  const mean = vals.reduce((a,b)=>a+b,0) / (vals.length || 1);
  const variance = vals.reduce((a,b)=>a+(b-mean)*(b-mean),0) / (vals.length || 1);
  const std = Math.sqrt(variance);

  for (const [key, count] of Object.entries(byIpMinute)) {
    const score = zScore(count, mean, std);
    if (score >= 3) {
      const [ip, minute] = key.split('|');
      anomalies.push({
        upload_id: uploadId,
        event_id: null,
        type: 'BURST_IP',
        reason: `Unusual request burst from ${ip} during ${minute} (count=${count}, z=${score.toFixed(2)})`,
        confidence: Math.min(1, score / 6)
      });
    }
  }

  // 2) Error spikes
  const errsByKey = {};
  for (const ev of events) {
    const sc = ev.status_code || 0;
    if (sc >= 400) {
      const key = ev.user ? `user:${ev.user}` : `ip:${ev.src_ip || 'unknown'}`;
      errsByKey[key] = (errsByKey[key] || 0) + 1;
    }
  }
  const errVals = Object.values(errsByKey);
  const eMean = errVals.length ? errVals.reduce((a,b)=>a+b,0) / errVals.length : 0;
  const eVar = errVals.length ? errVals.reduce((a,b)=>a+(b-eMean)*(b-eMean),0) / errVals.length : 0;
  const eStd = Math.sqrt(eVar);
  for (const [key, count] of Object.entries(errsByKey)) {
    const score = eStd ? zScore(count, eMean, eStd) : 0;
    if (count >= 10 || score >= 2.5) {
      anomalies.push({
        upload_id: uploadId,
        event_id: null,
        type: 'ERROR_SPIKE',
        reason: `High number of HTTP errors for ${key} (errors=${count}, z=${score.toFixed(2)})`,
        confidence: Math.min(1, (score + (count/20)) / 6)
      });
    }
  }

  // 3) Rare domain + large bytes
  const domainCounts = {};
  for (const ev of events) {
    if (ev.domain) domainCounts[ev.domain] = (domainCounts[ev.domain] || 0) + 1;
  }
  const total = events.length;
  const rareThreshold = Math.max(1, Math.floor(total * 0.01));
  for (const ev of events) {
    const bytes = (ev.bytes_sent || 0) + (ev.bytes_received || 0);
    if (ev.domain && (domainCounts[ev.domain] || 0) <= rareThreshold && bytes > 5000000) {
      anomalies.push({
        upload_id: uploadId,
        event_id: ev.id,
        type: 'RARE_DOMAIN_LARGE_BYTES',
        reason: `Large transfer (${bytes} bytes) to rare domain ${ev.domain} (freq=${domainCounts[ev.domain]})`,
        confidence: 0.75
      });
    }
  }

  // 4) Unusual methods
  const unusual = new Set(['CONNECT', 'TRACE', 'TRACK']);
  for (const ev of events) {
    if (ev.method && unusual.has(String(ev.method).toUpperCase())) {
      anomalies.push({
        upload_id: uploadId,
        event_id: ev.id,
        type: 'UNUSUAL_METHOD',
        reason: `Uncommon HTTP method observed: ${ev.method}`,
        confidence: 0.6
      });
    }
  }

  return anomalies;
}

module.exports = { detectAnomalies };
