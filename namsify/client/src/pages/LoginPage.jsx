import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const [name, setName] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: '#000000', padding: 24,
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300, background: 'radial-gradient(circle, rgba(255, 59, 48, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        style={{ width: '100%', maxWidth: 360, zIndex: 10, textAlign: 'center' }}
      >
        <img src="/logo.png" alt="Namsify" style={{ height: 60, marginBottom: 24, filter: 'drop-shadow(0 0 20px rgba(255,59,48,0.4))' }} />
        
        <h1 style={{
          fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 8,
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em'
        }}>
          namsify
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, fontSize: '0.9rem' }}>
          Music that moves you.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', padding: '16px 20px', borderRadius: 16,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', fontSize: '1rem', outline: 'none',
              transition: 'border-color 0.2s, background 0.2s'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#FF3B30'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              background: name.trim() ? 'linear-gradient(135deg, #FF3B30 0%, #8A0000 100%)' : 'rgba(255,255,255,0.1)',
              color: name.trim() ? 'white' : 'rgba(255,255,255,0.3)',
              border: 'none', fontSize: '1rem', fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s'
            }}
          >
            Start Listening
          </button>
        </form>
      </motion.div>
    </div>
  );
}
