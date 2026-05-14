import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { LogOut, Settings, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { autoplayEnabled, setAutoplayEnabled } = usePlayer();

  if (!user) return null;

  return (
    <div style={{ padding: '60px 24px', minHeight: '100%', paddingBottom: 120 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}
      >
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 32, height: 32,
            background: 'var(--pt-accent)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #000'
          }}>
            <Settings size={16} color="white" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {user.name}
        </h1>
        <p style={{ color: 'var(--pt-accent)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Platinum Member
        </p>
      </motion.div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: 16 }}>Settings</h2>
        
        <div style={{ background: 'var(--pt-surface2)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Autoplay Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px', borderBottom: '1px solid var(--pt-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={20} color="var(--pt-accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Autoplay</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Play similar songs automatically</p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              onClick={() => setAutoplayEnabled(v => !v)}
              style={{
                width: 50, height: 28, borderRadius: 14,
                background: autoplayEnabled ? 'var(--pt-accent)' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2, left: autoplayEnabled ? 24 : 2,
                transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Logout */}
          <div
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Log Out</h3>
          </div>
        </div>
      </section>
    </div>
  );
}
