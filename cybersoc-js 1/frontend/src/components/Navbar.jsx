import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../store';

export default function Navbar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  return (
    <div className="header">
      <div className="row">
        <span style={{ fontWeight: 700, fontSize: 20 }}>🔐 CyberSOC</span>
        <span className="badge">React + Node + MySQL</span>
      </div>
      <div className="nav">
        <Link className={pathname==='/' ? 'active' : ''} to="/">Dashboard</Link>
        <Link className={pathname==='/upload' ? 'active' : ''} to="/upload">Upload</Link>
        <button className="button" onClick={() => { auth.logout(); nav('/login'); }}>Logout</button>
      </div>
    </div>
  )
}
