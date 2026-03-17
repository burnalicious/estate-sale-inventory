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
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
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
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Login'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
        {error && <span className="login-error">{error}</span>}
      </form>
    );
  }

  return (
    <div className="login-bar">
      <button onClick={() => setShowForm(true)} className="btn btn-secondary">Login</button>
    </div>
  );
}
