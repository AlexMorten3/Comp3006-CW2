import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Registration';
import Profile from './components/Profile';
import Movies from './components/Movies';
import { AuthProvider, useAuth } from './components/useAuth';
import './components/styles/styles.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/" element={<Profile useAuth={useAuth} />} />
          <Route path="/movies/" element={<Movies useAuth={useAuth} />} />
          <Route path="/tickets/" element={<Tickets useAuth={useAuth} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;