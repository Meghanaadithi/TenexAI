import React from 'react';

export default function AnomaliesTable({ anomalies }) {
  return (
    <div className="card">
      <h3>Anomalies</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th><th>Confidence</th><th>Reason</th><th>Event ID</th><th>When</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a)=>(
            <tr key={a.id} style={{ background: a.confidence>0.8 ? '#3b0b0b' : 'transparent' }}>
              <td><span className="badge">{a.type}</span></td>
              <td>{(a.confidence*100).toFixed(0)}%</td>
              <td>{a.reason}</td>
              <td>{a.event_id || '-'}</td>
              <td>{new Date(a.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
