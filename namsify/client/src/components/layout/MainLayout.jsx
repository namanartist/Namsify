import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { NowPlayingBar } from './NowPlayingBar.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';

export function MainLayout() {
  const { currentSong } = usePlayer();

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      overflow: 'hidden',
      background: 'var(--pt-bg)',
    }}>
      {/* Sidebar (hidden on mobile via CSS) */}
      <Sidebar />

      {/* Main content area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Scrollable page area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: currentSong ? 100 : 0, // space for now-playing bar
        }} className="no-scrollbar">
          <Outlet />
        </div>

        {/* Now Playing Bar */}
        {currentSong && <NowPlayingBar />}
      </main>
    </div>
  );
}
