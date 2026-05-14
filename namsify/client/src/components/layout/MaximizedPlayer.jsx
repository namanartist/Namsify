import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronDown, Heart, MoreHorizontal,
  SkipBack, Play, Pause,
  SkipForward, Repeat, Shuffle, ChevronUp
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function parseSyncedLyrics(lrc) {
  if (!lrc) return null;
  const lines = lrc.split('\n').filter(l => l.trim());
  const parsed = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = mins * 60 + secs + ms / (match[3].length === 3 ? 1000 : 100);
      const text = match[4].trim();
      if (text) parsed.push({ time, text });
    }
  }
  return parsed.length > 0 ? parsed : null;
}

function parsePlainLyrics(plain) {
  if (!plain) return null;
  const lines = plain.split('\n');
  return lines.map(l => l.trim());
}

export function MaximizedPlayer() {
  const {
    currentSong, isPlaying, progress, duration,
    isShuffled, repeatMode, isMaximized, setIsMaximized,
    togglePlay, nextSong, prevSong,
    toggleShuffle, setRepeatMode, setProgress,
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLyricRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    if (!currentSong) return;
    setLyrics(null);
    setLyricsLoading(true);

    const controller = new AbortController();
    async function fetchLyrics() {
      try {
        const res = await fetch(
          `/api/lyrics?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.found) {
          const synced = parseSyncedLyrics(data.syncedLyrics);
          const plain = parsePlainLyrics(data.plainLyrics);
          setLyrics({ synced, plain });
        } else setLyrics(null);
      } catch (e) {
      } finally {
        setLyricsLoading(false);
      }
    }
    fetchLyrics();
    return () => controller.abort();
  }, [currentSong?.id]);

  const activeSyncedIndex = useMemo(() => {
    if (!lyrics?.synced) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.synced.length; i++) {
      if (progress >= lyrics.synced[i].time) idx = i;
      else break;
    }
    return idx;
  }, [lyrics?.synced, progress]);

  useEffect(() => {
    if (showLyrics && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSyncedIndex, showLyrics]);

  if (!currentSong || !isMaximized) return null;

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const activePlainIndex = lyrics?.plain ? Math.floor((progress / (duration || 1)) * lyrics.plain.length) : -1;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(ratio * duration));
  };

  const premiumEase = [0.25, 1, 0.5, 1];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#040404',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Soft Ambient Red Glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '120%', height: '60%',
        background: 'radial-gradient(ellipse at top, rgba(140, 20, 20, 0.3) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Top Bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px', paddingTop: 'max(24px, env(safe-area-inset-top))',
      }}>
        <button
          onClick={() => setIsMaximized(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
        >
          <ChevronDown size={28} />
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {/* Album Art (Hides when Lyrics are shown) */}
        <AnimatePresence>
          {!showLyrics && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, ease: premiumEase }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 32px', paddingBottom: 20
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                {/* Image animation for the requested Pinterest effect */}
                <AnimatePresence>
                  <motion.img
                    key={currentSong.id}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: [1, 1.03, 1] }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      opacity: { duration: 0.6, ease: premiumEase },
                      scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }
                    }}
                    src={currentSong.cover}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info & Controls Section */}
        <motion.div
          layout
          style={{ padding: '0 32px 40px', paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}
        >
          {/* Header Row (Title & Actions) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: showLyrics ? 'center' : 'flex-end', marginBottom: showLyrics ? 16 : 32 }}>
            
            <div style={{ flex: 1, paddingRight: 20, display: 'grid', gridTemplateAreas: '"stack"' }}>
              <AnimatePresence>
                <motion.div
                  key={currentSong.id}
                  style={{ gridArea: 'stack' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: premiumEase }}
                >
                  <h1 style={{
                    fontSize: showLyrics ? '1.2rem' : '1.75rem', fontWeight: 700, color: '#FFFFFF',
                    lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.02em',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {currentSong.title}
                  </h1>
                  <p style={{
                    fontSize: showLyrics ? '0.85rem' : '1.1rem', color: 'rgba(255,255,255,0.6)', fontWeight: 400,
                  }}>
                    {currentSong.artist}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right actions */}
            {!showLyrics ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <button onClick={() => setLiked(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Heart size={28} fill={liked ? '#1DB954' : 'none'} color={liked ? '#1DB954' : '#FFFFFF'} />
                </button>
              </div>
            ) : (
              <button onClick={togglePlay} style={{
                width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isPlaying ? <Pause size={20} fill="#FFFFFF" color="#FFFFFF" /> : <Play size={20} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: 2 }} />}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <motion.div layout style={{ marginBottom: 32 }}>
            <div onClick={handleProgressClick} style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#FFFFFF', borderRadius: 2, transition: 'width 0.1s linear' }} />
              <div style={{
                position: 'absolute', left: `calc(${pct}% - 6px)`, top: -4, width: 12, height: 12,
                background: '#FFFFFF', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                transition: 'left 0.1s linear'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </motion.div>

          {/* Full Playback Controls (Hides in Lyrics view) */}
          <AnimatePresence>
            {!showLyrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => toggleShuffle()} style={{ background: 'none', border: 'none', color: isShuffled ? '#1DB954' : 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                    <Shuffle size={22} />
                  </button>
                  <button onClick={prevSong} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}>
                    <SkipBack size={36} fill="#FFFFFF" />
                  </button>
                  <button onClick={togglePlay} style={{
                    width: 72, height: 72, borderRadius: '50%', background: '#FFFFFF',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(255,255,255,0.2)'
                  }}>
                    {isPlaying ? <Pause size={32} fill="#000000" color="#000000" /> : <Play size={32} fill="#000000" color="#000000" style={{ marginLeft: 4 }} />}
                  </button>
                  <button onClick={nextSong} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}>
                    <SkipForward size={36} fill="#FFFFFF" />
                  </button>
                  <button onClick={() => setRepeatMode(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')} style={{ background: 'none', border: 'none', color: repeatMode !== 'none' ? '#1DB954' : 'rgba(255,255,255,0.4)', cursor: 'pointer', position: 'relative', padding: 0 }}>
                    <Repeat size={22} />
                    {repeatMode === 'one' && <span style={{ position: 'absolute', top: -6, right: -8, fontSize: 10, fontWeight: '700' }}>1</span>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>



          {/* Lyrics Container (Animated Bottom Sheet) */}
          <AnimatePresence>
            {showLyrics ? (
              <motion.div
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 300, opacity: 0 }}
                transition={{ duration: 0.5, ease: premiumEase }}
                style={{
                  height: '60vh', background: '#1A1A1A', borderRadius: 32,
                  display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}
              >
                <button onClick={() => setShowLyrics(false)} style={{
                  width: '100%', padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600
                }}>
                  Lyrics <ChevronDown size={14} />
                </button>
                
                <div ref={lyricsContainerRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 60px' }}>
                  {lyricsLoading ? (
                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 40 }}>Loading...</div>
                  ) : lyrics?.synced ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {lyrics.synced.map((line, i) => {
                        const isActive = i === activeSyncedIndex;
                        const isPast = i < activeSyncedIndex;
                        return (
                          <p key={i} ref={isActive ? activeLyricRef : null} onClick={() => setProgress(Math.floor(line.time))} style={{
                            fontSize: isActive ? '1.6rem' : '1.4rem', fontWeight: 700, lineHeight: 1.3, cursor: 'pointer',
                            color: isActive ? 'white' : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.3s ease', transform: isActive ? 'scale(1.02)' : 'scale(1)', transformOrigin: 'left center',
                          }}>
                            {line.text}
                          </p>
                        );
                      })}
                    </div>
                  ) : lyrics?.plain ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {lyrics.plain.map((line, i) => (
                        <p key={i} style={{ fontSize: '1.2rem', fontWeight: 600, color: i === activePlainIndex ? 'white' : 'rgba(255,255,255,0.4)' }}>
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 40 }}>No lyrics available</div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLyrics(true)}
                style={{
                  width: '100%', padding: '16px', background: '#1A1A1A', borderRadius: 999,
                  border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                  fontSize: '0.85rem', fontWeight: 600
                }}
              >
                Lyrics <ChevronUp size={16} />
              </motion.button>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
