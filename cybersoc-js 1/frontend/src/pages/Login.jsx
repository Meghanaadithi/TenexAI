import React, { useState } from 'react';
import api from '../api';
import { auth } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('analyst@example.com');
  const [password, setPassword] = useState('StrongP@ssw0rd');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      auth.login(data.token);
      nav('/');
    } catch {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="container">
      <div style={{ maxWidth: 420, margin: '4rem auto' }} className="card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gap: 12 }}>
            <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="button">Sign in</button>
            {error && <div style={{ color: 'salmon' }}>{error}</div>}
          </div>
        </form>
        <p style={{ color: '#94a3b8' }}>Tip: Register first via API, or add a small register form.</p>
      </div>
    </div>
  )
}
