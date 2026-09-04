import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../hooks/useTheme';
import { MusicNoteIcon, TrashIcon } from '../components/Icons';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { favorites, favoriteAlbums, favoriteArtists, recentlyPlayed, clearRecentlyPlayed } = useLibraryStore();
  const { playlists } = usePlaylistStore();
  const { mode, setMode } = useThemeStore();
  const isDark = mode === 'dark';

  const stats = [
    { label: 'Liked', value: favorites.length },
    { label: 'Albums', value: favoriteAlbums.length },
    { label: 'Artists', value: favoriteArtists.length },
  ];

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={st.header}>
        <Image source={require('../../assets/hela-logo.png')} style={[st.logo, { borderRadius: borderRadius.lg }]} />
        <Text style={[st.appName, { color: colors.textPrimary }]}>Hela</Text>
        <Text style={[st.appDesc, { color: colors.textSecondary }]}>Your personal music experience</Text>
      </View>

      {/* Stats */}
      <View style={st.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={[st.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
            <Text style={[st.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
            <Text style={[st.statLabel, { color: colors.textTertiary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Appearance — THE TOGGLE */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>APPEARANCE</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <View style={st.cardRow}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>Theme</Text>
            <View style={st.themeToggle}>
              <TouchableOpacity
                style={[st.themeOption, !isDark && { backgroundColor: colors.accent }]}
                onPress={() => setMode('light')}
                activeOpacity={0.7}>
                <Text style={[st.themeOptionText, { color: !isDark ? colors.white : colors.textSecondary }]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.themeOption, isDark && { backgroundColor: colors.accent }]}
                onPress={() => setMode('dark')}
                activeOpacity={0.7}>
                <Text style={[st.themeOptionText, { color: isDark ? colors.white : colors.textSecondary }]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Library */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>LIBRARY</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <View style={st.cardRow}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>Liked Songs</Text>
            <Text style={[st.cardValue, { color: colors.textTertiary }]}>{favorites.length}</Text>
          </View>
          <View style={[st.cardDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={st.cardRow}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>Playlists</Text>
            <Text style={[st.cardValue, { color: colors.textTertiary }]}>{playlists.length}</Text>
          </View>
          <View style={[st.cardDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={st.cardRow}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>Recently Played</Text>
            <Text style={[st.cardValue, { color: colors.textTertiary }]}>{recentlyPlayed.length}</Text>
          </View>
        </View>
      </View>

      {/* Data */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>DATA</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity style={st.cardRow} onPress={clearRecentlyPlayed} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TrashIcon size={18} color={colors.accentRed} />
              <Text style={[st.cardLabel, { color: colors.accentRed }]}>Clear Listening History</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>ABOUT</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle, alignItems: 'center', paddingVertical: 24 }]}>
          <Image source={require('../../assets/hela-logo.png')} style={[st.logo, { width: 48, height: 48, marginBottom: 12, borderRadius: borderRadius.lg }]} />
          <Text style={{ fontSize: fontSize.lg, fontFamily: fontFamily.semibold, color: colors.textPrimary }}>Hela</Text>
          <Text style={{ fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: 4 }}>Version 1.0 · Personal Music App</Text>
          <Text style={{ fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
            React Native · Expo · TypeScript{'\n'}Music data powered by iTunes API{'\n'}Lyrics powered by Spotify23
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 24, paddingHorizontal: layout.screenPadding },
  logo: { width: 80, height: 80, marginBottom: 12 },
  appName: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, letterSpacing: -0.3 },
  appDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: borderRadius.md, paddingVertical: 16, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: fontSize.xl, fontFamily: fontFamily.bold },
  statLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 4 },

  section: { marginBottom: 20, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.xs, fontFamily: fontFamily.bold, letterSpacing: 1, marginBottom: 10 },
  card: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cardLabel: { fontSize: fontSize.md, fontFamily: fontFamily.regular },
  cardValue: { fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  cardDivider: { height: 1 },

  themeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: borderRadius.full,
    padding: 2,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  themeOptionText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
  },
});
