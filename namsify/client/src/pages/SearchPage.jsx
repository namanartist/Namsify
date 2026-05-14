import React, { useState, useRef } from 'react';
import { Search, Loader2, Play, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

const QUICK_SEARCHES = [
  'lofi hip hop', 'synthwave', 'chill beats', 'pop hits 2024',
  'r&b vibes', 'indie rock', 'jazz classics', 'ambient focus',
];

export default function SearchPage() {
  const { playSong, addToQueue, currentSong, isPlaying, queue } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        // Fallback to local queue if API fails (e.g. quota exceeded)
        const fallbackResults = queue.filter(s => 
          s.title.toLowerCase().includes(q.toLowerCase()) || 
          s.artist.toLowerCase().includes(q.toLowerCase())
        );
        setResults(fallbackResults);
      } else {
        setResults(data);
      }
    } catch {
      // Complete fallback on network error
      const fallbackResults = queue.filter(s => 
        s.title.toLowerCase().includes(q.toLowerCase()) || 
        s.artist.toLowerCase().includes(q.toLowerCase())
      );
      setResults(fallbackResults);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleQuick = (q) => {
    setQuery(q);
    doSearch(q);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ padding: '32px 28px', minHeight: '100%' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: '1.8rem', fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: 6,
        }}>
          <span style={{
            background: 'var(--pt-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Search
          </span>
        </h1>
        <p style={{ color: 'var(--pt-muted2)', fontSize: '0.85rem' }}>
          Find any song, artist, or vibe
        </p>
      </div>

      {/* Search Input */}
      <div className="fade-up2" style={{ position: 'relative', marginBottom: 28, maxWidth: 600 }}>
        <Search
          size={18}
          color="var(--pt-muted)"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          id="search-input"
          className="pt-search-input"
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)}
          placeholder="Search songs, artists..."
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSearch}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--pt-muted)', transition: 'color 0.15s',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quick search chips */}
      {!searched && (
        <div className="fade-up3" style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--pt-muted)',
            marginBottom: 12,
          }}>
            Quick Search
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_SEARCHES.map(q => (
              <button
                key={q}
                onClick={() => handleQuick(q)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: 'var(--pt-surface2)',
                  border: '1px solid var(--pt-border)',
                  color: 'var(--pt-muted2)',
                  fontSize: '0.78rem', fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--pt-surface3)';
                  e.currentTarget.style.borderColor = 'var(--pt-border2)';
                  e.currentTarget.style.color = 'var(--pt-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--pt-surface2)';
                  e.currentTarget.style.borderColor = 'var(--pt-border)';
                  e.currentTarget.style.color = 'var(--pt-muted2)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--pt-muted2)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.85rem' }}>Searching...</span>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <p style={{
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--pt-muted)',
            marginBottom: 12,
          }}>
            {results.length} Results
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((song, i) => {
              const active = currentSong?.id === song.id;
              const inQueue = queue.some(s => s.id === song.id);
              return (
                <SearchResultRow
                  key={song.id + i}
                  song={song}
                  index={i + 1}
                  active={active}
                  isPlayingNow={isPlaying && active}
                  inQueue={inQueue}
                  onPlay={() => playSong(song)}
                  onAddQueue={() => addToQueue(song)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--pt-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎵</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--pt-muted2)', marginBottom: 6 }}>
            No results found
          </p>
          <p style={{ fontSize: '0.8rem' }}>Try a different search term</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SearchResultRow({ song, index, active, isPlayingNow, inQueue, onPlay, onAddQueue }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 12px', borderRadius: 10,
        background: active
          ? 'rgba(200,200,232,0.07)'
          : hovered ? 'var(--pt-surface2)' : 'transparent',
        transition: 'background 0.15s',
        cursor: 'pointer',
      }}
      onClick={onPlay}
    >
      {/* Index / Play indicator */}
      <div style={{ width: 24, textAlign: 'center', flexShrink: 0 }}>
        {isPlayingNow ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} className="audio-bar" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : hovered ? (
          <Play size={14} color="var(--pt-accent)" fill="var(--pt-accent)" />
        ) : (
          <span style={{ fontSize: '0.75rem', color: active ? 'var(--pt-accent)' : 'var(--pt-muted)' }}>
            {index}
          </span>
        )}
      </div>

      {/* Cover */}
      <img
        src={song.cover}
        alt=""
        width={42} height={42}
        style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0,
          border: active ? '1px solid var(--pt-border2)' : '1px solid transparent' }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.88rem', fontWeight: 600,
          color: active ? 'var(--pt-accent)' : 'var(--pt-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {song.title}
        </p>
        <p style={{
          fontSize: '0.75rem', color: 'var(--pt-muted2)', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {song.artist}
        </p>
      </div>

      {/* Add to queue btn */}
      {hovered && !active && (
        <button
          onClick={e => { e.stopPropagation(); onAddQueue(); }}
          style={{
            padding: '5px 12px', borderRadius: 999,
            background: inQueue ? 'rgba(200,200,232,0.1)' : 'var(--pt-surface3)',
            border: '1px solid var(--pt-border)',
            color: inQueue ? 'var(--pt-accent)' : 'var(--pt-muted2)',
            fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          {inQueue ? '✓ Queued' : '+ Queue'}
        </button>
      )}
    </div>
  );
}
