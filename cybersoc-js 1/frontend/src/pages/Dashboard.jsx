import React, { useEffect, useState } from 'react';
import api from '../api';
import UploadForm from '../components/UploadForm.jsx';
import EventsTable from '../components/EventsTable.jsx';
import AnomaliesTable from '../components/AnomaliesTable.jsx';
import Timeline from '../components/Timeline.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Dashboard() {
  const [uploads, setUploads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [summary, setSummary] = useState(null);

  const refresh = async () => {
    const { data } = await api.get('/logs');
    setUploads(data.uploads);
    if (!selected && data.uploads.length) setSelected(data.uploads[0].id);
  };

  useEffect(()=>{ refresh(); },[]);

  useEffect(()=>{
    if (!selected) return;
    (async () => {
      const [e, a, s] = await Promise.all([
        api.get(`/logs/${selected}/events?limit=200`),
        api.get(`/logs/${selected}/anomalies`),
        api.get(`/logs/${selected}/summary`)
      ]);
      setEvents(e.data.events);
      setAnomalies(a.data.anomalies);
      setSummary(s.data.summary);
    })();
  },[selected]);

  return (
    <div className="container">
      <Navbar />
      <UploadForm onDone={refresh} />
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="row">
          <select className="select" value={selected ?? ''} onChange={e=>setSelected(Number(e.target.value))}>
            {uploads.map(u => <option key={u.id} value={u.id}>{u.id} — {u.filename} — {new Date(u.created_at).toLocaleString()}</option>)}
          </select>
          <span className="badge">{uploads.length} uploads</span>
        </div>
      </div>
      {summary && <SummaryCards summary={summary} />}
      {summary && <Timeline data={summary.timeline} />}
      <AnomaliesTable anomalies={anomalies} />
      <EventsTable events={events} />
    </div>
  )
}
