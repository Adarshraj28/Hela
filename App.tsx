import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation/AppNavigation';
import MiniPlayer from './src/components/MiniPlayer';
import FullPlayer from './src/components/FullPlayer';
import { useLibraryStore } from './src/store/libraryStore';
import { usePlaylistStore } from './src/store/playlistStore';

export default function App() {
  const loadLibrary = useLibraryStore(s => s.loadLibrary);
  const loadPlaylists = usePlaylistStore(s => s.loadPlaylists);

  useEffect(() => {
    loadLibrary();
    loadPlaylists();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigation />
      <MiniPlayer />
      <FullPlayer />
    </SafeAreaProvider>
  );
}
