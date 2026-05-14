import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User, Radio, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar() {
  const { queue, playSong, currentSong, autoplayEnabled, setAutoplayEnabled } = usePlayer();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const NAV = [
    { to: '/home',   icon: Home,   label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: Heart,  label: 'Library' },
    { to: '/profile', icon: () => user ? <img src={user.avatar} alt="Profile" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} /> : <User size={22} />, label: 'Profile' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 230,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '24px 8px' : '24px 12px',
        borderRight: '1px solid var(--pt-border)',
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        zIndex: 10,
        transition: 'width 0.25s ease',
        overflowX: 'hidden',
      }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '4px 0 20px' : '4px 10px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <img
            src="/logo.png"
            alt="namsify"
            style={{
              height: collapsed ? 32 : 38,
              width: 'auto',
              filter: 'drop-shadow(0 0 12px rgba(255,59,48,0.3))',
              transition: 'height 0.25s',
            }}
          />
          {!collapsed && (
            <div>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: '1.15rem',
                color: 'white', letterSpacing: '-0.02em',
              }}>
                namsify
              </span>
              <div style={{
                fontSize: '0.6rem', color: 'var(--pt-accent)',
                fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', marginTop: 1,
              }}>
                platinum
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={collapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Queue preview */}
        {!collapsed && queue.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{
              fontSize: '0.65rem', color: 'var(--pt-muted)',
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '0 14px', marginBottom: 8,
            }}>
              Up Next
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {queue.slice(
                Math.max(0, queue.findIndex(s => s.id === currentSong?.id) + 1),
                Math.max(0, queue.findIndex(s => s.id === currentSong?.id) + 1) + 5
              ).map((song) => (
                <button
                  key={song.id}
                  onClick={() => playSong(song)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 14px', borderRadius: 8,
                    background: 'transparent',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--pt-surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={song.cover} alt="" width={26} height={26}
                    style={{ borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.73rem', fontWeight: 500, color: 'var(--pt-text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{song.title}</p>
                    <p style={{
                      fontSize: '0.64rem', color: 'var(--pt-muted)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{song.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            margin: '0 auto', width: 28, height: 28, borderRadius: '50%',
            background: 'var(--pt-surface2)', border: '1px solid var(--pt-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--pt-muted2)', transition: 'color 0.15s',
          }}
          className="sidebar-desktop"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Platinum badge */}
        {!collapsed && (
          <div style={{
            margin: '12px 4px 0',
            padding: '10px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255,59,48,0.1), rgba(138,0,0,0.1))',
            border: '1px solid rgba(255,59,48,0.2)',
          }}>
            <p style={{
              fontSize: '0.68rem', fontWeight: 700,
              background: 'var(--pt-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>✦ Platinum</p>
            <p style={{ fontSize: '0.63rem', color: 'var(--pt-muted)', marginTop: 2 }}>
              Unlimited streaming
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        height: 64, width: 'calc(100% - 32px)', maxWidth: 400,
        background: 'rgba(30,30,40,0.95)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 32,
        display: 'none', // shown via CSS
        alignItems: 'center', justifyContent: 'space-around',
        zIndex: 200, padding: '0 8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }} className="mobile-tab-bar">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              textDecoration: 'none',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              padding: isActive ? '10px 16px' : '10px',
              borderRadius: 999,
              color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} color="currentColor" />
                {isActive && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
