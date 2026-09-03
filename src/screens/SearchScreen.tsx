import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { searchAll } from '../services/musicApi';
import { Track, Artist, Album } from '../types';
import SongActionSheet from '../components/SongActionSheet';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { playTrack } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [actionTrack, setActionTrack] = useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setTracks([]); setArtists([]); setAlbums([]); setSearched(false); return; }
    try {
      setLoading(true);
      const res = await searchAll(q);
      setTracks(res.tracks);
      setArtists(res.artists);
      setAlbums(res.albums);
      setSearched(true);
    } catch {} finally { setLoading(false); }
  }, []);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.length >= 2) {
      timerRef.current = setTimeout(() => doSearch(text), 350);
    } else {
      setTracks([]); setArtists([]); setAlbums([]); setSearched(false);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const noResults = searched && !loading && tracks.length === 0 && artists.length === 0 && albums.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* Search Bar */}
      <View style={{ paddingHorizontal: layout.screenPadding, marginBottom: 20 }}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput style={styles.searchInput} value={query} onChangeText={handleChange}
            placeholder="What do you want to play?" placeholderTextColor={colors.textTertiary}
            returnKeyType="search" autoCorrect={false} />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setTracks([]); setArtists([]); setAlbums([]); setSearched(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 40 }} />}

      {noResults && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyDesc}>Try searching for something else</Text>
        </View>
      )}

      {!loading && tracks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Songs</Text>
          {tracks.slice(0, 10).map((track, i) => (
            <TouchableOpacity key={track.id} style={styles.songRow} activeOpacity={0.7}
              onPress={() => playTrack(track, tracks, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Image source={{ uri: track.artwork }} style={styles.songArt} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && artists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingLeft: layout.screenPadding }}>
            {artists.slice(0, 10).map(artist => (
              <TouchableOpacity key={artist.id} style={styles.artistItem} activeOpacity={0.7}
                onPress={() => navigation.navigate('Artist', { id: artist.id })}>
                <View style={styles.artistCircle}>
                  <Image source={{ uri: artist.artwork }} style={styles.artistImage} />
                </View>
                <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!loading && albums.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingLeft: layout.screenPadding }}>
            {albums.slice(0, 10).map(album => (
              <TouchableOpacity key={album.id} style={styles.albumItem} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={styles.albumArt} />
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!searched && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Search for music</Text>
          <Text style={styles.emptyDesc}>Find your favorite songs, artists, and albums</Text>
        </View>
      )}

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: borderRadius.full, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: colors.borderMedium },
  searchIcon: { fontSize: 18, color: colors.textTertiary, marginRight: 10 },
  searchInput: { flex: 1, fontSize: fontSize.base, color: colors.textPrimary, padding: 0 },
  clearBtn: { fontSize: 14, color: colors.textSecondary, padding: 4 },

  section: { marginTop: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 },

  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  songArt: { width: 48, height: 48, borderRadius: borderRadius.sm },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  songArtist: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  artistItem: { alignItems: 'center', width: 76 },
  artistCircle: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textPrimary, width: 76, textAlign: 'center' },

  albumItem: { width: 160 },
  albumArt: { width: 160, height: 160, borderRadius: borderRadius.md, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  albumArtist: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});
