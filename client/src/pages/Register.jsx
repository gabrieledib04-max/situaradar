import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Preferisco non specificare');
  const [age, setAge] = useState(18);
  const navigate = useNavigate();

  let apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, gender, age })
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
    alert("Simulazione OAuth: Registrazione con Google...");
    // Mock OAuth for MVP
    try {
      const response = await fetch(`${apiUrl}/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'oauth_user@example.com', 
          oauthId: 'mock-google-id',
          gender, // normally asked after oauth if missing
          age
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
          <h1>Registrati</h1>
        </header>
        <form onSubmit={handleRegister} className="controls">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}/>
          
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sesso:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
            <option value="Altro">Altro</option>
            <option value="Preferisco non specificare">Preferisco non specificare</option>
          </select>

          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Età:</label>
          <input type="number" min="13" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'white' }}/>

          <button type="submit" className="standard-btn">Registrati</button>
        </form>
        <div style={{ textAlign: 'center', margin: '15px 0' }}>oppure</div>
        <button onClick={handleOAuth} className="standard-btn" style={{ background: '#db4437' }}>Registrati con Google (OAuth)</button>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          Hai già un account? <Link to="/login" style={{ color: 'var(--accent)' }}>Accedi</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
