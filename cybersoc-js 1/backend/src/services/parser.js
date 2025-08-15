const fs = require('fs');
const readline = require('readline');

function parseZscalerCsvHeader(header) {
  const cols = header.split(',').map(h => h.trim().toLowerCase());
  const map = {};
  cols.forEach((c, i) => map[c] = i);
  return map;
}

function safeIdx(arr, idx) {
  if (idx === undefined) return undefined;
  return arr[idx];
}

function fromZscalerCsv(headerMap, line) {
  const parts = line.split(',').map(p => p.trim());
  const time = safeIdx(parts, headerMap['time']) || safeIdx(parts, headerMap['timestamp']);
  const ts = time ? new Date(time) : new Date();
  const method = safeIdx(parts, headerMap['method']) || undefined;
  const url = safeIdx(parts, headerMap['url']) || undefined;
  let domain;
  if (url) {
    try { domain = new URL(url).hostname; } catch { domain = undefined; }
  }
  const src_ip = safeIdx(parts, headerMap['sip']) || safeIdx(parts, headerMap['srcip']) || undefined;
  const action = safeIdx(parts, headerMap['action']) || undefined;
  const status = safeIdx(parts, headerMap['resp_code']) || safeIdx(parts, headerMap['status']) || undefined;
  const user = safeIdx(parts, headerMap['user']) || undefined;
  const ua = safeIdx(parts, headerMap['user_agent']) || undefined;
  const bytes = safeIdx(parts, headerMap['bytes']) || undefined;
  const bytes_recv = safeIdx(parts, headerMap['bytes_received']) || undefined;

  return {
    ts, method, url, domain, src_ip, action,
    status_code: status ? Number(status) : undefined,
    user: user || undefined,
    user_agent: ua || undefined,
    bytes_sent: bytes ? Number(bytes) : undefined,
    bytes_received: bytes_recv ? Number(bytes_recv) : undefined,
    raw_line: line
  };
}

const apacheRegex = /^(\d+\.\d+\.\d+\.\d+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s*(?:HTTP\/\d\.\d)?"\s+(\d{3})\s+(\S+)\s+"([^"]*)"\s+"([^"]*)"$/;

function parseApacheDate(s) {
  const m = s.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})/);
  if (!m) return new Date();
  const [, dd, mon, yyyy, hh, mm, ss] = m;
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const date = new Date(Date.UTC(Number(yyyy), months[mon], Number(dd), Number(hh), Number(mm), Number(ss)));
  return date;
}

function fromApache(line) {
  const m = line.match(apacheRegex);
  if (!m) return null;
  const ip = m[1];
  const method = m[5];
  const url = m[6];
  const status = Number(m[7]);
  const bytes = m[8] === '-' ? undefined : Number(m[8]);
  const referer = m[9];
  const ua = m[10];
  const ts = parseApacheDate(m[4]);
  let domain;
  try { domain = new URL(url).hostname; } catch { domain = undefined; }

  return {
    ts,
    src_ip: ip,
    method,
    url,
    domain,
    status_code: status,
    bytes_sent: bytes,
    user_agent: ua,
    raw_line: line,
    action: referer ? 'referer:' + referer : undefined
  };
}

async function parseLogFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  const events = [];

  let headerMap = null;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (headerMap === null && (trimmed.toLowerCase().includes('timestamp') || trimmed.toLowerCase().includes('time,'))) {
      headerMap = parseZscalerCsvHeader(trimmed);
      continue;
    }

    let ev = null;
    if (headerMap) {
      ev = fromZscalerCsv(headerMap, trimmed);
    } else {
      ev = fromApache(trimmed);
    }
    if (ev) events.push(ev);
  }
  return events;
}

module.exports = { parseLogFile };
