import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { View, ActivityIndicator } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation';
import MiniPlayer from './src/components/MiniPlayer';
import FullPlayer from './src/components/FullPlayer';
import { useLibraryStore } from './src/store/libraryStore';
import { usePlaylistStore } from './src/store/playlistStore';
import { useThemeStore } from './src/store/themeStore';
import { useTheme } from './src/hooks/useTheme';

export default function App() {
  const loadLibrary = useLibraryStore(s => s.loadLibrary);
  const loadPlaylists = usePlaylistStore(s => s.loadPlaylists);
  const loadTheme = useThemeStore(s => s.loadTheme);
  const themeLoaded = useThemeStore(s => s.loaded);
  const colors = useTheme();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    loadLibrary();
    loadPlaylists();
    loadTheme();
  }, []);

  if (!fontsLoaded || !themeLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06060b', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#8b5cf6" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <SafeAreaProvider>
        <StatusBar style={colors.statusBar} />
        <AppNavigation />
        <MiniPlayer />
        <FullPlayer />
      </SafeAreaProvider>
    </View>
  );
}
