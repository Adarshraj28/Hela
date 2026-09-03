import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, favoriteAlbums, favoriteArtists, recentlyPlayed, clearRecentlyPlayed } = useLibraryStore();
  const { playlists } = usePlaylistStore();

  const stats = [
    { label: 'Liked', value: favorites.length },
    { label: 'Albums', value: favoriteAlbums.length },
    { label: 'Artists', value: favoriteArtists.length },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>♪</Text>
        </View>
        <Text style={styles.appName}>Hela</Text>
        <Text style={styles.appDesc}>Your personal music experience</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Theme</Text>
            <Text style={styles.cardValue}>Dark</Text>
          </View>
        </View>
      </View>

      {/* Playback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PLAYBACK</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Shuffle</Text>
            <Text style={styles.cardValue}>Off</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Repeat</Text>
            <Text style={styles.cardValue}>Off</Text>
          </View>
        </View>
      </View>

      {/* Library */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LIBRARY</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Liked Songs</Text>
            <Text style={styles.cardValue}>{favorites.length}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Playlists</Text>
            <Text style={styles.cardValue}>{playlists.length}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Recently Played</Text>
            <Text style={styles.cardValue}>{recentlyPlayed.length}</Text>
          </View>
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardRow} onPress={clearRecentlyPlayed}>
            <Text style={[styles.cardLabel, { color: colors.accentRed }]}>Clear Listening History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <View style={[styles.logo, { width: 48, height: 48, marginBottom: 12 }]}>
            <Text style={[styles.logoText, { fontSize: 20 }]}>♪</Text>
          </View>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Hela</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 4 }}>Version 1.0 · Personal Music App</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
            React Native · Expo · TypeScript{'\n'}Music data powered by iTunes API{'\n'}Lyrics powered by Spotify23
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: { alignItems: 'center', marginBottom: 24, paddingHorizontal: layout.screenPadding },
  logo: { width: 80, height: 80, borderRadius: borderRadius.lg, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 32, color: colors.white },
  appName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  appDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: borderRadius.md, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.borderSubtle },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  statLabel: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 4 },

  section: { marginBottom: 20, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 1, color: colors.textTertiary, marginBottom: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.borderSubtle, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cardLabel: { fontSize: fontSize.md, color: colors.textPrimary },
  cardValue: { fontSize: fontSize.sm, color: colors.textTertiary },
  cardDivider: { height: 1, backgroundColor: colors.borderSubtle },
});
