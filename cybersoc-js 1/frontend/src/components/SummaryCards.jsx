import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SummaryCards({ summary }) {
  const statusData = Object.entries(summary.byStatus || {}).map(([k,v])=>({status:k, count:v}));
  const methodData = Object.entries(summary.byMethod || {}).map(([k,v])=>({method:k, count:v}));
  return (
    <div className="grid">
      <div className="col6">
        <div className="card">
          <h3>Total Events</h3>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{summary.totalEvents}</div>
        </div>
      </div>
      <div className="col6">
        <div className="card">
          <h3>Top Domains</h3>
          <ol>
            {summary.topDomains?.map((d)=> <li key={d.domain}>{d.domain} — {d.count}</li>)}
          </ol>
        </div>
      </div>
      <div className="col6">
        <div className="card">
          <h3>Status Codes</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col6">
        <div className="card">
          <h3>HTTP Methods</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
