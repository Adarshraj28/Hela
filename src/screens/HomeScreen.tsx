import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fontWeight, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getGreeting } from '../utils/formatTime';
import * as api from '../services/musicApi';
import { Track, Artist, Album } from '../types';
import SongActionSheet from '../components/SongActionSheet';
import { BellIcon } from '../components/Icons';

const CARD_SIZE = 160;
const ARTIST_SIZE = 76;

function HorizontalScroll({ children, contentContainerStyle }: { children: React.ReactNode; contentContainerStyle?: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={contentContainerStyle}>
      {children}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { playTrack } = usePlayerStore();
  const { recentlyPlayed, favorites } = useLibraryStore();
  const [trending, setTrending] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionTrack, setActionTrack] = useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [t, a] = await Promise.all([api.getChartTracks(), api.getChartArtists()]);
      setTrending(t);
      setArtists(a);
      api.getChartAlbums().then(setAlbums).catch(() => {});
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = getGreeting();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Wanna feel spirit today ?</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <BellIcon size={20} color={colors.textSecondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}
            onPress={() => navigation.navigate('SettingsTab')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>H</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Artist Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Artist Recommendation</Text>
        <HorizontalScroll contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 18 }}>
          {loading ? [1,2,3,4].map(i => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={[styles.artistCircle, styles.skeleton]} />
              <View style={[styles.skeletonText, styles.skeleton]} />
            </View>
          )) : artists.map(artist => (
            <TouchableOpacity key={artist.id} style={styles.artistItem} activeOpacity={0.7}
              onPress={() => navigation.navigate('Artist', { id: artist.id })}>
              <View style={styles.artistCircle}>
                <Image source={{ uri: artist.artwork }} style={styles.artistImage} />
              </View>
              <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
            </TouchableOpacity>
          ))}
        </HorizontalScroll>
      </View>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LibraryTab')} activeOpacity={0.7}>
              <Text style={styles.seeMore}>See More</Text>
            </TouchableOpacity>
          </View>
          <HorizontalScroll contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 12 }}>
            {recentlyPlayed.slice(0, 8).map((entry, i) => (
              <TouchableOpacity key={`${entry.track.id}-${i}`} style={styles.cardItem} activeOpacity={0.8}
                onPress={() => playTrack(entry.track, recentlyPlayed.map(e => e.track))}>
                <Image source={{ uri: entry.track.artwork }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>{entry.track.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{entry.track.artist}</Text>
              </TouchableOpacity>
            ))}
          </HorizontalScroll>
        </View>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LibraryTab')} activeOpacity={0.7}>
              <Text style={styles.seeMore}>See More</Text>
            </TouchableOpacity>
          </View>
          <HorizontalScroll contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 12 }}>
            {favorites.slice(0, 8).map(track => (
              <TouchableOpacity key={track.id} style={styles.cardItem} activeOpacity={0.8}
                onPress={() => playTrack(track, favorites, favorites.indexOf(track))}>
                <Image source={{ uri: track.artwork }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{track.artist}</Text>
              </TouchableOpacity>
            ))}
          </HorizontalScroll>
        </View>
      )}

      {/* Trending Now */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <View style={{ paddingHorizontal: layout.screenPadding }}>
          {loading ? [1,2,3,4,5].map(i => (
            <View key={i} style={styles.songRow}>
              <View style={[styles.songArt, styles.skeleton]} />
              <View style={{ flex: 1 }}>
                <View style={[styles.skeletonTitle, styles.skeleton]} />
                <View style={[styles.skeletonSub, styles.skeleton]} />
              </View>
            </View>
          )) : trending.slice(0, 10).map((track, i) => (
            <TouchableOpacity key={track.id} style={styles.songRow} activeOpacity={0.7}
              onPress={() => playTrack(trending[i], trending, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Text style={styles.songIndex}>{i + 1}</Text>
              <Image source={{ uri: track.artwork }} style={styles.songArt} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* New Releases */}
      {albums.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Releases</Text>
          <HorizontalScroll contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 14 }}>
            {albums.slice(0, 10).map(album => (
              <TouchableOpacity key={album.id} style={styles.cardItem} activeOpacity={0.8}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </HorizontalScroll>
        </View>
      )}

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: layout.screenPadding,
    marginBottom: 24,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accentPink,
    borderWidth: 2,
    borderColor: colors.bgBase,
  },
  avatarBtn: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },

  section: { marginTop: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingHorizontal: layout.screenPadding,
    marginBottom: 12,
  },
  seeMore: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
  },

  artistItem: { alignItems: 'center', width: ARTIST_SIZE },
  artistCircle: {
    width: ARTIST_SIZE,
    height: ARTIST_SIZE,
    borderRadius: ARTIST_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  artistImage: { width: '100%', height: '100%' },
  artistName: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    width: ARTIST_SIZE,
  },

  cardItem: { width: CARD_SIZE },
  cardImage: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: borderRadius.md, marginBottom: 8 },
  cardTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  cardSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 2 },

  songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  songIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted, fontFamily: fontFamily.medium },
  songArt: { width: 46, height: 46, borderRadius: borderRadius.sm },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  songArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 2 },

  skeleton: { backgroundColor: colors.bgSurface, overflow: 'hidden' },
  skeletonText: { width: 50, height: 10, borderRadius: 4, marginTop: 8 },
  skeletonTitle: { width: '60%', height: 14, borderRadius: 4, marginBottom: 6 },
  skeletonSub: { width: '40%', height: 12, borderRadius: 4 },
});
