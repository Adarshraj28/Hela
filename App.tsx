import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import AppNavigation from './src/navigation/AppNavigation';
import MiniPlayer from './src/components/MiniPlayer';
import FullPlayer from './src/components/FullPlayer';
import { useLibraryStore } from './src/store/libraryStore';
import { usePlaylistStore } from './src/store/playlistStore';
import { View, ActivityIndicator } from 'react-native';
import { colors } from './src/constants/theme';

export default function App() {
  const loadLibrary = useLibraryStore(s => s.loadLibrary);
  const loadPlaylists = usePlaylistStore(s => s.loadPlaylists);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    loadLibrary();
    loadPlaylists();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigation />
      <MiniPlayer />
      <FullPlayer />
    </SafeAreaProvider>
  );
}
