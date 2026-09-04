import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { getGreeting } from '../utils/formatTime';
import * as api from '../services/musicApi';
import { Track, Artist, Album } from '../types';
import SongActionSheet from '../components/SongActionSheet';
import MoodGenreCards from '../components/MoodGenreCards';
import SectionHeader from '../components/SectionHeader';
import { BellIcon, UserIcon } from '../components/Icons';

const CARD_SIZE = 155;
const ARTIST_SIZE = 76;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const colors = useTheme();
  const { playTrack } = usePlayerStore();
  const { recentlyPlayed, favorites } = useLibraryStore();
  const user = useAuthStore(s => s.user);
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
  const displayName = user?.isGuest ? 'there' : user?.username || 'there';
  const initials = user ? user.username.charAt(0).toUpperCase() : '?';

  const handleMoodSelect = (query: string) => {
    navigation.navigate('SearchTab');
    // Pass query via navigation params — SearchScreen can pick it up
  };

  return (
    <ScrollView
      style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* ── Header ── */}
      <View style={st.header}>
        <View style={st.headerLeft}>
          <Text style={[st.greeting, { color: colors.textPrimary }]}>{greeting}</Text>
          <Text style={[st.displayName, { color: colors.textPrimary }]}>{displayName} 👋</Text>
        </View>
        <View style={st.headerActions}>
          <TouchableOpacity style={[st.iconBtn, { backgroundColor: colors.controlBg }]} activeOpacity={0.7}>
            <BellIcon size={19} color={colors.textSecondary} />
            <View style={[st.notifDot, { backgroundColor: colors.accentPink, borderColor: colors.bgBase }]} />
          </TouchableOpacity>
          <TouchableOpacity style={st.avatarBtn} activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile')}>
            <View style={[st.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[st.avatarText, { color: colors.white }]}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Quick Picks (if user has data) ── */}
      {(favorites.length > 0 || recentlyPlayed.length > 0) && (
        <View style={st.section}>
          <SectionHeader title="Quick Picks" subtitle="Jump back in" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 10 }}>
            {[...recentlyPlayed.slice(0, 4).map(e => e.track), ...favorites.slice(0, 4)].slice(0, 8).map((track, i) => (
              <TouchableOpacity key={`${track.id}-${i}`} style={[st.quickPick, { backgroundColor: colors.bgSurface }]} activeOpacity={0.8}
                onPress={() => playTrack(track, [track])} onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
                <Image source={{ uri: track.artwork }} style={[st.quickPickArt, { borderRadius: borderRadius.sm }]} />
                <Text style={[st.quickPickTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Mood / Genre Discovery ── */}
      <View style={st.section}>
        <SectionHeader title="Browse by Mood" subtitle="What's your vibe?" />
        <MoodGenreCards onSelect={handleMoodSelect} />
      </View>

      {/* ── Artist Recommendations ── */}
      <View style={st.section}>
        <SectionHeader title="Popular Artists" subtitle="Trending right now" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 18 }}>
          {loading ? [1, 2, 3, 4, 5].map(i => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={[st.artistCircle, { backgroundColor: colors.skeletonBg }]} />
              <View style={[st.skeletonText, { backgroundColor: colors.skeletonBg }]} />
            </View>
          )) : artists.map(artist => (
            <TouchableOpacity key={artist.id} style={st.artistItem} activeOpacity={0.7}
              onPress={() => navigation.navigate('Artist', { id: artist.id })}>
              <View style={[st.artistCircle, { borderColor: 'rgba(139,92,246,0.15)' }]}>
                <Image source={{ uri: artist.artwork }} style={st.artistImage} />
              </View>
              <Text style={[st.artistName, { color: colors.textPrimary }]} numberOfLines={1}>{artist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Recently Played ── */}
      {recentlyPlayed.length > 0 && (
        <View style={st.section}>
          <SectionHeader title="Jump Back In" subtitle="Recently played" onSeeAll={() => navigation.navigate('LibraryTab')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 12 }}>
            {recentlyPlayed.slice(0, 8).map((entry, i) => (
              <TouchableOpacity key={`${entry.track.id}-${i}`} style={st.cardItem} activeOpacity={0.8}
                onPress={() => playTrack(entry.track, recentlyPlayed.map(e => e.track))}>
                <View style={[st.cardImageWrap, { borderRadius: borderRadius.md, backgroundColor: colors.skeletonBg }]}>
                  <Image source={{ uri: entry.track.artwork }} style={[st.cardImage, { borderRadius: borderRadius.md }]} />
                </View>
                <Text style={[st.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{entry.track.title}</Text>
                <Text style={[st.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{entry.track.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Your Favorites ── */}
      {favorites.length > 0 && (
        <View style={st.section}>
          <SectionHeader title="Your Favorites" subtitle="Liked songs" onSeeAll={() => navigation.navigate('LibraryTab')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 12 }}>
            {favorites.slice(0, 8).map(track => (
              <TouchableOpacity key={track.id} style={st.cardItem} activeOpacity={0.8}
                onPress={() => playTrack(track, favorites, favorites.indexOf(track))}>
                <View style={[st.cardImageWrap, { borderRadius: borderRadius.md, backgroundColor: colors.skeletonBg }]}>
                  <Image source={{ uri: track.artwork }} style={[st.cardImage, { borderRadius: borderRadius.md }]} />
                </View>
                <Text style={[st.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
                <Text style={[st.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Trending Now ── */}
      <View style={st.section}>
        <SectionHeader title="Trending Now" subtitle="Hot right now 🔥" />
        <View style={{ paddingHorizontal: layout.screenPadding }}>
          {loading ? [1, 2, 3, 4, 5].map(i => (
            <View key={i} style={st.songRow}>
              <View style={[st.songArt, { backgroundColor: colors.skeletonBg, borderRadius: borderRadius.sm }]} />
              <View style={{ flex: 1 }}>
                <View style={[st.skeletonTitle, { backgroundColor: colors.skeletonBg }]} />
                <View style={[st.skeletonSub, { backgroundColor: colors.skeletonBg }]} />
              </View>
            </View>
          )) : trending.slice(0, 10).map((track, i) => (
            <TouchableOpacity key={track.id} style={st.songRow} activeOpacity={0.7}
              onPress={() => playTrack(trending[i], trending, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Text style={[st.songIndex, { color: colors.textMuted }]}>{i + 1}</Text>
              <Image source={{ uri: track.artwork }} style={[st.songArt, { borderRadius: borderRadius.sm }]} />
              <View style={st.songInfo}>
                <Text style={[st.songTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
                <Text style={[st.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── New Releases / Albums ── */}
      {albums.length > 0 && (
        <View style={st.section}>
          <SectionHeader title="New Releases" subtitle="Fresh albums" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: layout.screenPadding, gap: 14 }}>
            {albums.slice(0, 10).map(album => (
              <TouchableOpacity key={album.id} style={st.cardItem} activeOpacity={0.8}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <View style={[st.cardImageWrap, { borderRadius: borderRadius.md, backgroundColor: colors.skeletonBg }]}>
                  <Image source={{ uri: album.artwork }} style={[st.cardImage, { borderRadius: borderRadius.md }]} />
                </View>
                <Text style={[st.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{album.title}</Text>
                <Text style={[st.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Stats Teaser ── */}
      <View style={st.section}>
        <TouchableOpacity style={[st.statsTeaser, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}
          activeOpacity={0.8} onPress={() => navigation.navigate('Stats')}>
          <Text style={{ fontSize: 28, marginRight: 14 }}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.md, fontFamily: fontFamily.semibold, letterSpacing: -0.2, color: colors.textPrimary }}>Your Listening Stats</Text>
            <Text style={{ fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2, color: colors.textSecondary }}>See your top artists, songs, and genres</Text>
          </View>
          <Text style={{ fontSize: 28, fontFamily: fontFamily.regular, color: colors.accent }}>›</Text>
        </TouchableOpacity>
      </View>

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, letterSpacing: 0.3 },
  displayName: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 10, width: 7, height: 7, borderRadius: 4, borderWidth: 2 },
  avatarBtn: {},
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.md, fontFamily: fontFamily.bold },

  section: { marginTop: 28 },

  quickPick: { width: 130, borderRadius: borderRadius.md, overflow: 'hidden', padding: 8 },
  quickPickArt: { width: 114, height: 114, marginBottom: 6 },
  quickPickTitle: { fontSize: fontSize.xs, fontFamily: fontFamily.semibold, letterSpacing: -0.1 },

  artistItem: { alignItems: 'center', width: ARTIST_SIZE },
  artistCircle: { width: ARTIST_SIZE, height: ARTIST_SIZE, borderRadius: ARTIST_SIZE / 2, overflow: 'hidden', borderWidth: 2.5, marginBottom: 8 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, textAlign: 'center', width: ARTIST_SIZE },

  cardItem: { width: CARD_SIZE },
  cardImageWrap: { marginBottom: 8 },
  cardImage: { width: CARD_SIZE, height: CARD_SIZE },
  cardTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold, letterSpacing: -0.2 },
  cardSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2, letterSpacing: 0.2 },

  songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  songIndex: { width: 22, textAlign: 'center', fontSize: fontSize.sm, fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] },
  songArt: { width: 48, height: 48 },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, letterSpacing: -0.2 },
  songArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2, letterSpacing: 0.2 },

  skeletonText: { width: 50, height: 10, borderRadius: 4, marginTop: 8 },
  skeletonTitle: { width: '60%', height: 14, borderRadius: 4, marginBottom: 6 },
  skeletonSub: { width: '40%', height: 12, borderRadius: 4 },

  statsTeaser: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: 16, borderWidth: 1 },
});
