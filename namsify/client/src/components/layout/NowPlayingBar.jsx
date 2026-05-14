import React, { useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Heart, Repeat, Shuffle,
  ChevronUp, ListMusic, ChevronRight
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function NowPlayingBar() {
  const {
    currentSong, isPlaying, progress, duration,
    volume, isShuffled, repeatMode,
    togglePlay, nextSong, prevSong,
    setVolume, toggleShuffle, setRepeatMode,
    isMaximized, setIsMaximized, setProgress,
    queue, playSong,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const prevVolRef = useRef(volume);
  const progressRef = useRef(null);
  const mobileProgressRef = useRef(null);

  if (!currentSong) return null;

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  const cycleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleProgressClick = (e, ref) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(ratio * duration));
  };

  const handleMute = () => {
    if (muted) {
      setVolume(prevVolRef.current || 70);
      setMuted(false);
    } else {
      prevVolRef.current = volume;
      setVolume(0);
      setMuted(true);
    }
  };

  const accentActive = 'var(--pt-accent)';
  const muted2 = 'var(--pt-muted2)';

  return (
    <>
      {/* ═══════════════════════════════════════════════
          DESKTOP NOW PLAYING BAR (Original Layout)
          ═══════════════════════════════════════════════ */}
      <div className="now-playing-desktop" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 88,
        background: 'rgba(7,7,15,0.92)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid var(--pt-border)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
        zIndex: 100,
      }}>
        {/* Left: song info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '28%', minWidth: 200 }}>
          <button
            onClick={() => setIsMaximized(true)}
            style={{
              position: 'relative', width: 50, height: 50,
              borderRadius: 10, overflow: 'hidden', border: '1px solid var(--pt-border2)',
              background: 'none', cursor: 'pointer', flexShrink: 0,
              boxShadow: isPlaying ? '0 0 20px var(--pt-glow)' : 'none',
              transition: 'box-shadow 0.3s',
            }}
          >
            {currentSong.cover ? (
              <img src={currentSong.cover} alt={currentSong.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                className={isPlaying ? 'spin-slow' : ''}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--pt-surface3)' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s',
            }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <ChevronUp size={14} color="white" />
            </div>
          </button>

          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSong.title}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--pt-muted2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
              {currentSong.artist}
            </p>
          </div>

          <button onClick={() => setLiked(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: liked ? 'var(--pt-gold)' : 'var(--pt-muted)',
            flexShrink: 0, transition: 'color 0.2s, transform 0.2s', transform: liked ? 'scale(1.1)' : 'scale(1)',
          }}>
            <Heart size={16} fill={liked ? 'var(--pt-gold)' : 'none'} />
          </button>
        </div>

        {/* Center: controls + progress */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 580, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <button onClick={toggleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? accentActive : muted2, transition: 'color 0.15s' }}>
              <Shuffle size={16} />
            </button>
            <button onClick={prevSong} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted2, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--pt-text)'} onMouseLeave={e => e.currentTarget.style.color = muted2}>
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button onClick={togglePlay} style={{
              width: 44, height: 44, borderRadius: '50%', background: '#222222', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px var(--pt-glow)',
              transition: 'transform 0.15s, box-shadow 0.15s', color: 'white',
            }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 36px var(--pt-glow)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 24px var(--pt-glow)'; }}>
              {isPlaying ? <Pause size={18} fill="white" color="white" /> : <Play size={18} fill="white" color="white" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={nextSong} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted2, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--pt-text)'} onMouseLeave={e => e.currentTarget.style.color = muted2}>
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeatMode !== 'none' ? accentActive : muted2, position: 'relative', transition: 'color 0.15s' }}>
              <Repeat size={16} />
              {repeatMode === 'one' && <span style={{ position: 'absolute', top: -6, right: -8, fontSize: 9, fontWeight: 700, color: 'var(--pt-accent)' }}>1</span>}
            </button>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--pt-muted)', fontFamily: 'monospace', width: 32, textAlign: 'right' }}>{fmt(progress)}</span>
            <div ref={progressRef} onClick={(e) => handleProgressClick(e, progressRef)} className="pt-progress-track" style={{ flex: 1 }}>
              <div className="pt-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--pt-muted)', fontFamily: 'monospace', width: 32 }}>{fmt(duration)}</span>
          </div>
        </div>

        {/* Right: volume + queue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end', width: '28%', minWidth: 200 }}>
          {isPlaying && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
              {[0,1,2,3].map(i => <div key={i} className="audio-bar" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          )}
          <button onClick={() => setShowQueue(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showQueue ? 'var(--pt-accent)' : 'var(--pt-muted2)', transition: 'color 0.15s' }}>
            <ListMusic size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={handleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pt-muted2)', transition: 'color 0.15s' }}>
              {volume === 0 || muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={100} value={volume} onChange={e => { setVolume(+e.target.value); setMuted(+e.target.value === 0); }} style={{ width: 80 }} />
          </div>
        </div>
      </div>

      {/* Queue Drawer (Desktop) */}
      {showQueue && (
        <div className="now-playing-desktop" style={{
          position: 'fixed', bottom: 96, right: 16, width: 320, maxHeight: 400,
          background: 'rgba(14,14,28,0.95)', backdropFilter: 'blur(32px)', border: '1px solid var(--pt-border2)', borderRadius: 16, overflow: 'hidden', zIndex: 110, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--pt-border)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--pt-accent)' }}>Queue</p>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 340 }} className="no-scrollbar">
            {queue.map((song, i) => {
              const active = song.id === currentSong?.id;
              return (
                <button key={song.id + i} onClick={() => playSong(song)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', textAlign: 'left',
                  background: active ? 'rgba(200,200,232,0.07)' : 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--pt-border)', transition: 'background 0.15s',
                }} onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--pt-surface2)'; }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(200,200,232,0.07)' : 'none'; }}>
                  <img src={song.cover} alt="" width={36} height={36} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: active ? 600 : 500, color: active ? 'var(--pt-accent)' : 'var(--pt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--pt-muted2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MOBILE NOW PLAYING BAR (Sleek Glassmorphism)
          ═══════════════════════════════════════════════ */}
      <div className="now-playing-mobile" style={{
        position: 'fixed', bottom: 80, left: 8, right: 8, zIndex: 100,
        background: 'rgba(20, 20, 24, 0.85)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14, padding: '8px 12px 8px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', gap: 12,
        overflow: 'hidden'
      }}>
        {/* Album Art */}
        <div onClick={() => setIsMaximized(true)} style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
          <img src={currentSong.cover} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', display: 'block' }} />
          {isPlaying && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                 {[0,1,2].map(i => <div key={i} className="audio-bar" style={{ background: 'white', width: 2, animationDelay: `${i * 0.15}s` }} />)}
               </div>
            </div>
          )}
        </div>
        
        {/* Title & Artist */}
        <div onClick={() => setIsMaximized(true)} style={{ flex: 1, minWidth: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em', marginBottom: 2 }}>{currentSong.title}</h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.artist}</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button onClick={() => setLiked(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
             <Heart size={20} fill={liked ? "#1DB954" : "none"} color={liked ? "#1DB954" : "rgba(255,255,255,0.7)"} />
          </button>
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
            {isPlaying ? <Pause size={24} fill="#FFFFFF" color="#FFFFFF" /> : <Play size={24} fill="#FFFFFF" color="#FFFFFF" />}
          </button>
        </div>

        {/* Minimal Progress Line at Absolute Bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)' }}>
           <div style={{ width: `${pct}%`, height: '100%', background: '#FFFFFF', transition: 'width 0.1s linear', borderRadius: '0 2px 2px 0' }} />
        </div>
      </div>
    </>
  );
}
