import React, { useState } from 'react';
import api from '../api';

export default function UploadForm({ onDone }) {
  const [file, setFile] = useState(null);
  const [logType, setLogType] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMsg('');
    const form = new FormData();
    form.append('file', file);
    form.append('logType', logType);
    try {
      const { data } = await api.post('/logs/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg(`Uploaded. Parsed ${data.counts.events} events, found ${data.counts.anomalies} anomalies.`);
      onDone();
    } catch (e) {
      setMsg('Upload failed.');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="row" style={{ marginBottom: 12 }}>
        <input className="input" type="file" accept=".log,.txt,.csv" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <select className="select" value={logType} onChange={e=>setLogType(e.target.value)}>
          <option value="auto">Auto</option>
          <option value="zscaler">Zscaler CSV-like</option>
          <option value="apache">Apache Combined</option>
        </select>
        <button className="button" disabled={!file || loading}>{loading ? 'Processing...' : 'Upload & Analyze'}</button>
      </div>
      {msg && <div>{msg}</div>}
    </form>
  );
}
