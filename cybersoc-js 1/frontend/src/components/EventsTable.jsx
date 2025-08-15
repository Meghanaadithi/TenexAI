import React from 'react';

export default function EventsTable({ events }) {
  return (
    <div className="card">
      <h3>Events</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th><th>IP</th><th>User</th><th>Method</th><th>Status</th><th>Domain</th><th>URL</th><th>Bytes</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e)=>(
            <tr key={e.id}>
              <td>{new Date(e.ts).toLocaleString()}</td>
              <td>{e.src_ip||'-'}</td>
              <td>{e.user||'-'}</td>
              <td>{e.method||'-'}</td>
              <td>{e.status_code||'-'}</td>
              <td>{e.domain||'-'}</td>
              <td style={{maxWidth: 360, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={e.url}>{e.url||'-'}</td>
              <td>{(e.bytes_sent||0)+(e.bytes_received||0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
