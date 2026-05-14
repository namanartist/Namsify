import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const PlayerContext = createContext(undefined);

// ─── Fallback songs (if API fails) ───
const MOCK_SONGS = [
  { id: 'bM7SZ5SBzyY', title: 'Fade', artist: 'Alan Walker', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300' },
  { id: 'TW9d8vYrVFQ', title: 'Sky High', artist: 'Elektronomia', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=300' },
  { id: 'K4DyBUG242c', title: 'On & On', artist: 'Cartoon ft. Daniel Levi', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300' },
];

// ─── Singleton YT Player reference ───
let ytPlayer = null;
let ytApiReady = false;
const ytCallbacks = [];

window.onYouTubeIframeAPIReady = () => {
  ytApiReady = true;
  ytCallbacks.forEach(cb => cb());
  ytCallbacks.length = 0;
};

function whenYTReady(cb) {
  if (ytApiReady) cb();
  else ytCallbacks.push(cb);
}

// ═══════════════════════════════════════════════
//  AUTOPLAY ALGORITHM (Spotify-style)
//
//  Strategy: When we're within the last 2 songs
//  of the queue, auto-fetch related tracks from
//  YouTube based on the current song's title/artist.
//  Dedup against queue to avoid repeats. Seeds the
//  search with "{title} {artist} similar songs".
// ═══════════════════════════════════════════════
async function fetchRelatedSongs(song, existingIds) {
  if (!song) return [];
  try {
    // Use the current song info to find related tracks
    const q = `${song.title} ${song.artist} similar songs mix`;
    const res = await fetch(`/api/youtube/suggestions?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`);
    const data = await res.json();
    
    // If API quota exceeded or error, fallback to mock songs
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('✦ Autoplay: YouTube API unavailable (likely quota exceeded), falling back to mock suggestions');
      return MOCK_SONGS.filter(s => !existingIds.has(s.id) && s.id !== song.id);
    }
    
    // Filter out duplicates and the current song
    return data.filter(s => !existingIds.has(s.id) && s.id !== song.id);
  } catch {
    console.warn('✦ Autoplay: Fetch failed, falling back to mock suggestions');
    return MOCK_SONGS.filter(s => !existingIds.has(s.id) && s.id !== song.id);
  }
}

// ─── Provider ───
export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [volume, setVolumeState] = useState(70);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isMaximized, setIsMaximized] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Refs
  const currentSongRef = useRef(null);
  const isPlayingRef = useRef(false);
  const queueRef = useRef([]);
  const suggestionsRef = useRef([]);
  const repeatModeRef = useRef('none');
  const progressIntervalRef = useRef(null);
  const autoplayFetchingRef = useRef(false);
  const autoplayEnabledRef = useRef(true);

  currentSongRef.current = currentSong;
  isPlayingRef.current = isPlaying;
  queueRef.current = queue;
  suggestionsRef.current = suggestions;
  repeatModeRef.current = repeatMode;
  autoplayEnabledRef.current = autoplayEnabled;

  // ════════════════════════════════════════════
  //  AUTOPLAY ENGINE
  //  Runs whenever currentSong or queue changes.
  //  If the current song is near the end of the
  //  queue (within last 2), auto-fetch and append
  //  related tracks.
  // ════════════════════════════════════════════
  useEffect(() => {
    if (!autoplayEnabled || !currentSong) return;

    const currentIdx = queue.findIndex(s => s.id === currentSong.id);
    const remaining = queue.length - currentIdx - 1;

    // Trigger when ≤2 songs remaining in queue
    if (remaining > 2 || autoplayFetchingRef.current) return;

    autoplayFetchingRef.current = true;

    const existingIds = new Set(queue.map(s => s.id));

    fetchRelatedSongs(currentSong, existingIds).then(related => {
      if (related.length > 0) {
        // Add up to 5 new songs at a time
        const toAdd = related.slice(0, 5);
        setQueue(prev => {
          const prevIds = new Set(prev.map(s => s.id));
          const fresh = toAdd.filter(s => !prevIds.has(s.id));
          if (fresh.length === 0) return prev;
          console.info(`✦ Autoplay: added ${fresh.length} songs to queue`);
          return [...prev, ...fresh];
        });
        setSuggestions(related.slice(5));
      }
      autoplayFetchingRef.current = false;
    }).catch(() => {
      autoplayFetchingRef.current = false;
    });
  }, [currentSong?.id, queue.length, autoplayEnabled]); // eslint-disable-line

  const ytContainerRef = useRef(null);

  // ── Initialize YT IFrame Player ──
  useEffect(() => {
    let localPlayer = null;
    whenYTReady(() => {
      if (!ytContainerRef.current) return;
      localPlayer = new window.YT.Player(ytContainerRef.current, {
        width: '200',
        height: '200',
        playerVars: {
          autoplay: 0, controls: 0, rel: 0, showinfo: 0,
          modestbranding: 1, playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            ytPlayer = localPlayer;
            event.target.setVolume(70);
            console.info('✦ Namsify: YT Player ready');
            const curr = currentSongRef.current;
            if (curr) {
              if (isPlayingRef.current) {
                event.target.loadVideoById({ videoId: curr.id, startSeconds: 0 });
              } else {
                event.target.cueVideoById({ videoId: curr.id, startSeconds: 0 });
              }
            }
          },
          onStateChange: (event) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const d = event.target.getDuration();
              if (d > 0) setDuration(Math.floor(d));
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              handleEnded();
            }
          },
          onError: (e) => console.error('YT Player error code:', e.data),
        },
      });
    });

    return () => {
      if (localPlayer && typeof localPlayer.destroy === 'function') {
        localPlayer.destroy();
      }
      if (ytPlayer === localPlayer) {
        ytPlayer = null;
      }
    };
  }, []); // eslint-disable-line

  // ── Song ended → advance queue ──
  const handleEnded = useCallback(() => {
    const mode = repeatModeRef.current;
    if (mode === 'one') {
      ytPlayer?.seekTo(0, true);
      ytPlayer?.playVideo();
      return;
    }
    const q = queueRef.current;
    const sugg = suggestionsRef.current;
    const curr = currentSongRef.current;
    const idx = q.findIndex(s => s.id === curr?.id);

    let next = null;
    if (mode === 'all') {
      next = q[(idx + 1) % q.length] || q[0];
    } else {
      // Autoplay: always pick next in queue (autoplay engine keeps queue populated)
      next = q[idx + 1] || sugg[0] || null;
    }
    if (next) {
      setCurrentSong(next);
      setProgress(0);
      ytPlayer?.loadVideoById({ videoId: next.id, startSeconds: 0 });
    } else {
      setIsPlaying(false);
    }
  }, []);

  // ── Progress tracking ──
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          const t = ytPlayer.getCurrentTime() || 0;
          const d = ytPlayer.getDuration() || 0;
          setProgress(Math.floor(t));
          if (d > 0) setDuration(Math.floor(d));
        }
      }, 500);
    } else {
      clearInterval(progressIntervalRef.current);
    }
    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying]);

  // ── Load initial queue ──
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/youtube/search?q=trending+pop+music+2024');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQueue(data);
          setCurrentSong(data[0]);
        } else {
          setQueue(MOCK_SONGS);
          setCurrentSong(MOCK_SONGS[0]);
        }
      } catch {
        setQueue(MOCK_SONGS);
        setCurrentSong(MOCK_SONGS[0]);
      }
    }
    loadInitial();
  }, []);

  // ── Cue song when changed ──
  useEffect(() => {
    if (!currentSong) return;
    if (ytPlayer && typeof ytPlayer.cueVideoById === 'function' && !isPlayingRef.current) {
      ytPlayer.cueVideoById({ videoId: currentSong.id, startSeconds: 0 });
    }
  }, [currentSong?.id]); // eslint-disable-line

  // ─── Actions ───
  const playSong = useCallback((song) => {
    setCurrentSong(song);
    setProgress(0);
    setIsPlaying(true);
    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      ytPlayer.loadVideoById({ videoId: song.id, startSeconds: 0 });
      ytPlayer.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!ytPlayer) return;
    if (isPlayingRef.current) {
      ytPlayer.pauseVideo();
    } else {
      const curr = currentSongRef.current;
      if (!curr) return;
      const state = ytPlayer.getPlayerState?.();
      const YT = window.YT;
      if (state === -1 || state === YT?.PlayerState?.UNSTARTED ||
          state === YT?.PlayerState?.ENDED || state === 5) {
        ytPlayer.loadVideoById({ videoId: curr.id, startSeconds: 0 });
      } else {
        ytPlayer.playVideo();
      }
      setIsPlaying(true);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    ytPlayer?.setVolume(v);
  }, []);

  const seekTo = useCallback((seconds) => {
    ytPlayer?.seekTo(seconds, true);
    setProgress(seconds);
  }, []);

  const nextSong = useCallback(() => {
    const q = queueRef.current;
    const sugg = suggestionsRef.current;
    const curr = currentSongRef.current;
    const mode = repeatModeRef.current;

    if (mode === 'one') {
      seekTo(0);
      ytPlayer?.playVideo();
      return;
    }
    const idx = q.findIndex(s => s.id === curr?.id);
    const next = q[idx + 1] || sugg[0] || MOCK_SONGS[0];
    playSong(next);
  }, [playSong, seekTo]);

  const prevSong = useCallback(() => {
    if (progress > 3) { seekTo(0); return; }
    const q = queueRef.current;
    const curr = currentSongRef.current;
    const idx = q.findIndex(s => s.id === curr?.id);
    if (idx > 0) playSong(q[idx - 1]);
  }, [progress, playSong, seekTo]);

  const addToQueue = useCallback((song) => {
    setQueue(prev => {
      if (prev.find(s => s.id === song.id)) return prev;
      return [...prev, song];
    });
  }, []);

  const removeFromQueue = useCallback((songId) => {
    setQueue(prev => prev.filter(s => s.id !== songId));
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffled(v => !v), []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, progress, duration,
        queue, suggestions, volume,
        isShuffled, repeatMode, isMaximized,
        autoplayEnabled,
        playSong, addToQueue, removeFromQueue,
        togglePlay, nextSong, prevSong,
        setProgress: seekTo, setVolume,
        toggleShuffle,
        setRepeatMode: (m) => setRepeatMode(m),
        setIsMaximized,
        setAutoplayEnabled,
      }}
    >
      {children}
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: 200, height: 200, zIndex: -9999, opacity: 0.01, pointerEvents: 'none' }}>
        <div ref={ytContainerRef} />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
