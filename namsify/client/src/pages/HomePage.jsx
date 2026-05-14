import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function HomePage() {
  const { queue, playSong, currentSong } = usePlayer();

  const recommendedPills = [
    { title: 'Daily Mix', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #8A0000 100%)', song: queue[0] },
    { title: 'Party', gradient: 'linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)', song: queue[1] },
    { title: 'Relax', gradient: 'linear-gradient(135deg, #4682B4 0%, #000080 100%)', song: queue[2] },
  ].filter(p => p.song);

  const newReleases = queue.slice(3, 8);
  
  // Extract unique artists for the 'Artists For You' section
  const artists = [];
  const artistNames = new Set();
  queue.forEach(song => {
    if (!artistNames.has(song.artist)) {
      artistNames.add(song.artist);
      artists.push(song);
    }
  });

  return (
    <div style={{ padding: '40px 24px', minHeight: '100%', paddingBottom: 120 }}>
      {/* Recommended For You Today */}
      <section style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: 4 }}>
          Recommended
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: 20 }}>
          For You Today
        </h2>
        
        <div className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingRight: 24, margin: '0 -24px', paddingLeft: 24 }}>
          {recommendedPills.map((pill, idx) => (
            <div
              key={idx}
              onClick={() => playSong(pill.song)}
              style={{
                width: 130, height: 70, flexShrink: 0,
                background: pill.gradient,
                borderRadius: 20,
                position: 'relative',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: '0 16px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}
            >
              <span style={{ position: 'relative', zIndex: 2, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                {pill.title}
              </span>
              <div style={{
                position: 'absolute', right: 10, bottom: 10, zIndex: 2,
                width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Play size={10} fill="white" color="white" style={{ marginLeft: 2 }} />
              </div>
              <div style={{
                position: 'absolute', right: -20, top: -20,
                width: 70, height: 70, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>New releases</h2>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 999, padding: '4px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>
            See all
          </button>
        </div>
        
        <div className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingRight: 24, margin: '0 -24px', paddingLeft: 24 }}>
          {newReleases.map(song => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              style={{
                width: 240, height: 90, flexShrink: 0,
                background: 'var(--pt-surface2)',
                borderRadius: 24,
                display: 'flex', alignItems: 'center', padding: 12,
                cursor: 'pointer',
                border: currentSong?.id === song.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
            >
              <div style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                <img src={song.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Play size={16} fill="white" color="white" />
                </div>
              </div>
              <div style={{ marginLeft: 16, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4 }}>
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Artists For You */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>Artists For You</h2>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 999, padding: '4px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>
            See all
          </button>
        </div>
        
        <div className="no-scrollbar" style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingRight: 24, margin: '0 -24px', paddingLeft: 24 }}>
          {artists.slice(0, 6).map((artist, idx) => (
            <Link key={idx} to={`/artist/${encodeURIComponent(artist.artist)}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 70, flexShrink: 0, cursor: 'pointer' }}>
              <img
                src={artist.cover}
                alt={artist.artist}
                style={{ width: 70, height: 70, borderRadius: '35%', objectFit: 'cover' }} // 'squircle' approximation
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {artist.artist}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section>
        <div style={{
          width: '100%', height: 120,
          background: 'linear-gradient(180deg, #3A0000 0%, #1A0000 100%)',
          borderRadius: 24,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 20,
          boxShadow: '0 20px 40px rgba(255, 0, 0, 0.1)',
          cursor: 'pointer'
        }}>
          {/* Glowing orb effect behind text */}
          <div style={{
            position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 100, background: '#FF3B30', filter: 'blur(40px)', opacity: 0.5
          }} />
          <h2 style={{ position: 'relative', zIndex: 2, fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
            Collections
          </h2>
        </div>
      </section>
    </div>
  );
}
