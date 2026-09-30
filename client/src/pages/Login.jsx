import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOAuth = async () => {
    alert("Simulazione OAuth: Accedi con Google...");
    // Mock login for MVP
    try {
      const response = await fetch(`${apiUrl}/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'oauth_user@example.com', 
          oauthId: 'mock-google-id',
          gender: 'Preferisco non specificare',
          age: 25
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
      <div id="ui-container" style={{ position: 'relative', top: 0, left: 0 }}>
        <header>
          <h1>Accedi a SituaRadar</h1>
        </header>
        <form onSubmit={handleLogin} className="controls">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}/>
          <button type="submit" className="standard-btn">Login</button>
        </form>
        <div style={{ textAlign: 'center', margin: '15px 0' }}>oppure</div>
        <button onClick={handleOAuth} className="standard-btn" style={{ background: '#db4437' }}>Accedi con Google (OAuth)</button>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          Non hai un account? <Link to="/register" style={{ color: 'var(--accent)' }}>Registrati</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
