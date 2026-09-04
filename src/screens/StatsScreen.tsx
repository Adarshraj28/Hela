import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useLibraryStore } from '../store/libraryStore';
import { ArrowLeftIcon } from '../components/Icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

export default function StatsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { favorites, recentlyPlayed } = useLibraryStore();

  const stats = useMemo(() => {
    // Top artists by play count
    const artistCounts: Record<string, { name: string; count: number; artwork: string }> = {};
    recentlyPlayed.forEach(entry => {
      const key = entry.track.artist;
      if (!artistCounts[key]) {
        artistCounts[key] = { name: key, count: 0, artwork: entry.track.artwork };
      }
      artistCounts[key].count++;
    });
    const topArtists = Object.values(artistCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top genres (using primaryGenreName or fallback)
    const genreCounts: Record<string, number> = {};
    recentlyPlayed.forEach(entry => {
      const genre = entry.track.genre || 'Pop';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Listening stats
    const totalSongs = recentlyPlayed.length;
    const uniqueArtists = Object.keys(artistCounts).length;
    const uniqueAlbums = new Set(recentlyPlayed.map(e => e.track.album)).size;

    // Most played song
    const trackCounts: Record<string, { track: any; count: number }> = {};
    recentlyPlayed.forEach(entry => {
      const key = entry.track.id;
      if (!trackCounts[key]) trackCounts[key] = { track: entry.track, count: 0 };
      trackCounts[key].count++;
    });
    const topTrack = Object.values(trackCounts).sort((a, b) => b.count - a.count)[0];

    return { topArtists, topGenres, totalSongs, uniqueArtists, uniqueAlbums, topTrack };
  }, [recentlyPlayed]);

  // Animated values for staggered entrance
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(20);
  const topTrackOpacity = useSharedValue(0);
  const artistsOpacity = useSharedValue(0);
  const genresOpacity = useSharedValue(0);

  useEffect(() => {
    heroOpacity.value = withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    heroTranslateY.value = withDelay(100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    statsOpacity.value = withDelay(250, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    statsTranslateY.value = withDelay(250, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    topTrackOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    artistsOpacity.value = withDelay(550, withTiming(1, { duration: 500 }));
    genresOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));
  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));
  const topTrackStyle = useAnimatedStyle(() => ({ opacity: topTrackOpacity.value }));
  const artistsStyle = useAnimatedStyle(() => ({ opacity: artistsOpacity.value }));
  const genresStyle = useAnimatedStyle(() => ({ opacity: genresOpacity.value }));

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}>

      {/* Back */}
      <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.controlBg }]}
        onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Hero */}
      <Animated.View style={[s.hero, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }, heroStyle]}>
        <Text style={s.heroEmoji}>🎵</Text>
        <Text style={[s.heroTitle, { color: colors.textPrimary }]}>Your Listening Stats</Text>
        <Text style={[s.heroSubtitle, { color: colors.textSecondary }]}>A look at your music journey</Text>
      </Animated.View>

      {/* Big Numbers */}
      <Animated.View style={[s.statsGrid, statsStyle]}>
        <View style={[s.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[s.statBig, { color: colors.accent }]}>{stats.totalSongs}</Text>
          <Text style={[s.statLabel, { color: colors.textTertiary }]}>Songs Played</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[s.statBig, { color: colors.accentPink }]}>{stats.uniqueArtists}</Text>
          <Text style={[s.statLabel, { color: colors.textTertiary }]}>Artists</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[s.statBig, { color: colors.accentGreen }]}>{stats.uniqueAlbums}</Text>
          <Text style={[s.statLabel, { color: colors.textTertiary }]}>Albums</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[s.statBig, { color: colors.accent }]}>{favorites.length}</Text>
          <Text style={[s.statLabel, { color: colors.textTertiary }]}>Liked</Text>
        </View>
      </Animated.View>

      {/* Most Played */}
      {stats.topTrack && (
        <Animated.View style={[s.section, topTrackStyle]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Most Played</Text>
          <View style={[s.topTrackCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
            <Image source={{ uri: stats.topTrack.track.artwork }} style={s.topTrackArt} />
            <View style={s.topTrackInfo}>
              <Text style={[s.topTrackTitle, { color: colors.textPrimary }]} numberOfLines={1}>{stats.topTrack.track.title}</Text>
              <Text style={[s.topTrackArtist, { color: colors.textSecondary }]} numberOfLines={1}>{stats.topTrack.track.artist}</Text>
              <Text style={[s.topTrackCount, { color: colors.accent }]}>{stats.topTrack.count}x played</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <Animated.View style={[s.section, artistsStyle]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Top Artists</Text>
          {stats.topArtists.map((artist, i) => (
            <View key={artist.name} style={[s.rankRow, { borderBottomColor: colors.borderSubtle }]}>
              <Text style={[s.rank, { color: colors.textMuted }]}>{i + 1}</Text>
              <Image source={{ uri: artist.artwork }} style={s.rankArt} />
              <View style={s.rankInfo}>
                <Text style={[s.rankName, { color: colors.textPrimary }]} numberOfLines={1}>{artist.name}</Text>
                <Text style={[s.rankCount, { color: colors.textTertiary }]}>{artist.count} plays</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <Animated.View style={[s.section, genresStyle]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Top Genres</Text>
          {stats.topGenres.map(([genre, count], i) => (
            <View key={genre} style={s.genreRow}>
              <Text style={[s.rank, { color: colors.textMuted }]}>{i + 1}</Text>
              <View style={[s.genreBar, { backgroundColor: colors.glassActive, width: `${Math.min((count / (stats.topGenres[0]?.[1] || 1)) * 100, 100)}%` }]} />
              <Text style={[s.genreName, { color: colors.textPrimary }]}>{genre}</Text>
              <Text style={[s.genreCount, { color: colors.textTertiary }]}>{count}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {stats.totalSongs === 0 && (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>🎧</Text>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>No listening data yet</Text>
          <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>Start playing music to see your stats here</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginHorizontal: layout.screenPadding, marginBottom: 16 },

  hero: { marginHorizontal: layout.screenPadding, borderRadius: borderRadius.xl, paddingVertical: 32, alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 40, marginBottom: 12 },
  heroTitle: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  statCard: { width: '48%', flexGrow: 1, borderRadius: borderRadius.md, paddingVertical: 20, alignItems: 'center', borderWidth: 1 },
  statBig: { fontSize: 32, fontFamily: fontFamily.bold, letterSpacing: -1 },
  statLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, marginTop: 4, letterSpacing: 0.3 },

  section: { marginBottom: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, letterSpacing: -0.3, marginBottom: 12 },

  topTrackCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: borderRadius.md, borderWidth: 1 },
  topTrackArt: { width: 64, height: 64, borderRadius: borderRadius.sm },
  topTrackInfo: { flex: 1, minWidth: 0 },
  topTrackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, letterSpacing: -0.2 },
  topTrackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  topTrackCount: { fontSize: fontSize.xs, fontFamily: fontFamily.semibold, marginTop: 6 },

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  rank: { width: 24, fontSize: fontSize.md, fontFamily: fontFamily.bold, textAlign: 'center' },
  rankArt: { width: 44, height: 44, borderRadius: 22 },
  rankInfo: { flex: 1, minWidth: 0 },
  rankName: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
  rankCount: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2 },

  genreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  genreBar: { position: 'absolute', left: 36, top: 0, bottom: 0, borderRadius: 4, opacity: 0.15 },
  genreName: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.semibold, marginLeft: 24 },
  genreCount: { fontSize: fontSize.sm, fontFamily: fontFamily.regular },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold },
  emptyDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular },
});
