import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { Play, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArtistPage() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const { queue, playSong, currentSong, isPlaying } = usePlayer();

  // Find all songs by this artist
  const artistSongs = useMemo(() => {
    return queue.filter(s => s.artist.toLowerCase() === decodeURIComponent(artistName).toLowerCase());
  }, [queue, artistName]);

  const artistCover = artistSongs.length > 0 ? artistSongs[0].cover : '';
  const displayArtist = artistSongs.length > 0 ? artistSongs[0].artist : decodeURIComponent(artistName);

  if (artistSongs.length === 0) {
    return <div style={{ padding: 40, color: 'white' }}>Artist not found.</div>;
  }

  const handlePlayArtist = () => {
    if (artistSongs.length > 0) playSong(artistSongs[0]);
  };

  return (
    <div style={{ minHeight: '100%', paddingBottom: 120, background: '#000000' }}>
      {/* Top Header / Image Area */}
      <div style={{ position: 'relative', width: '100%', height: 380, marginBottom: 40 }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: Math.max(24, 24 /* env inset */), left: 24, zIndex: 10,
            width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ChevronLeft color="white" size={24} style={{ marginRight: 2 }} />
        </button>

        {/* Huge Curved Image */}
        <div style={{
          position: 'absolute', inset: 0,
          borderBottomLeftRadius: 60, borderBottomRightRadius: 60, overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <img src={artistCover} alt={displayArtist} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Subtle gradient overlay to darken the bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }} />
        </div>

        {/* Floating Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayArtist}
          style={{
            position: 'absolute', bottom: -28, right: 32, zIndex: 10,
            width: 56, height: 56, borderRadius: '50%', background: 'var(--pt-accent)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 20px var(--pt-glow)'
          }}
        >
          <Play fill="white" color="white" size={24} style={{ marginLeft: 3 }} />
        </motion.button>
      </div>

      <div style={{ padding: '0 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 32, textAlign: 'center' }}>
          {displayArtist}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>Top songs</h2>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 999, padding: '4px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>
            See all
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {artistSongs.map((song) => {
            const isPlayingThis = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                  padding: 8, borderRadius: 16, transition: 'background 0.2s',
                  background: isPlayingThis ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={song.cover} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isPlayingThis && isPlaying && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Simple equalizer visual using CSS or just a Play icon */}
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--pt-accent)', boxShadow: '0 0 10px var(--pt-accent)' }} />
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: isPlayingThis ? 'var(--pt-accent)' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.title}
                  </h3>
                </div>

                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 8 }}>
                  <MoreHorizontal size={20} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
