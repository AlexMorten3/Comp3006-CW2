import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles/styles.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json();

        login(result.user);

        navigate('/');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
      <div className="login">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
              <input
                  type="text"
                  name="usr"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />

              <input
                  type={'password'}
                  name="psw"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />

              <br />

              <button type="submit" className="btn">Login</button>

          </form>
      </div>
  );
};