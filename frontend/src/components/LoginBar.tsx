import { useState } from 'react';
import { api } from '../api/client';

export default function LoginBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await api.auth.login(username, password);
    if (ok) {
      setLoggedIn(true);
      setShowForm(false);
      setPassword('');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    api.auth.logout();
    setLoggedIn(false);
    setUsername('');
  };

  if (loggedIn) {
    return (
      <div className="login-bar">
        <span>Logged in as <strong>{username}</strong></span>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Logout</button>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleLogin} className="login-bar">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={{ padding: '4px 8px', fontSize: '13px', width: '120px', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: '4px 8px', fontSize: '13px', width: '120px', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} disabled={loading}>
          {loading ? '...' : 'Login'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Cancel</button>
        {error && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</span>}
      </form>
    );
  }

  return (
    <div className="login-bar">
      <button onClick={() => setShowForm(true)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Login</button>
    </div>
  );
}
