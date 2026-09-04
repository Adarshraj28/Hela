import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { searchAll } from '../services/musicApi';
import { Track, Artist, Album } from '../types';
import SongActionSheet from '../components/SongActionSheet';
import { SearchIcon, XIcon } from '../components/Icons';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const colors = useTheme();
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

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const noResults = searched && !loading && tracks.length === 0 && artists.length === 0 && albums.length === 0;

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      <View style={{ paddingHorizontal: layout.screenPadding, marginBottom: 20 }}>
        <View style={[st.searchBar, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium }]}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput style={[st.searchInput, { color: colors.textPrimary }]} value={query} onChangeText={handleChange}
            placeholder="What do you want to play?" placeholderTextColor={colors.textTertiary}
            returnKeyType="search" autoCorrect={false} />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setTracks([]); setArtists([]); setAlbums([]); setSearched(false); }}>
              <XIcon size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 40 }} />}

      {noResults && (
        <View style={st.emptyState}>
          <Text style={[st.emptyTitle, { color: colors.textPrimary }]}>No results found</Text>
          <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>Try searching for something else</Text>
        </View>
      )}

      {!loading && tracks.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Songs</Text>
          {tracks.slice(0, 10).map((track, i) => (
            <TouchableOpacity key={track.id} style={st.songRow} activeOpacity={0.7}
              onPress={() => playTrack(track, tracks, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Image source={{ uri: track.artwork }} style={[st.songArt, { borderRadius: borderRadius.sm }]} />
              <View style={st.songInfo}>
                <Text style={[st.songTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
                <Text style={[st.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && artists.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingLeft: layout.screenPadding }}>
            {artists.slice(0, 10).map(artist => (
              <TouchableOpacity key={artist.id} style={st.artistItem} activeOpacity={0.7}
                onPress={() => navigation.navigate('Artist', { id: artist.id })}>
                <View style={[st.artistCircle, { borderColor: 'rgba(255,255,255,0.05)' }]}>
                  <Image source={{ uri: artist.artwork }} style={st.artistImage} />
                </View>
                <Text style={[st.artistName, { color: colors.textPrimary }]} numberOfLines={1}>{artist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!loading && albums.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingLeft: layout.screenPadding }}>
            {albums.slice(0, 10).map(album => (
              <TouchableOpacity key={album.id} style={st.albumItem} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={[st.albumArt, { borderRadius: borderRadius.md }]} />
                <Text style={[st.albumTitle, { color: colors.textPrimary }]} numberOfLines={1}>{album.title}</Text>
                <Text style={[st.albumArtist, { color: colors.textSecondary }]} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!searched && !loading && (
        <View style={st.emptyState}>
          <SearchIcon size={48} color={colors.textMuted} />
          <Text style={[st.emptyTitle, { color: colors.textPrimary }]}>Search for music</Text>
          <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>Find your favorite songs, artists, and albums</Text>
        </View>
      )}

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.full, paddingHorizontal: 16, height: 48, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: fontSize.base, fontFamily: fontFamily.regular, padding: 0 },
  section: { marginTop: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, marginBottom: 12 },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  songArt: { width: 48, height: 48 },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
  songArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  artistItem: { alignItems: 'center', width: 76 },
  artistCircle: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', borderWidth: 2, marginBottom: 8 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, width: 76, textAlign: 'center' },
  albumItem: { width: 160 },
  albumArt: { width: 160, height: 160, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  albumArtist: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, textAlign: 'center' },
  emptyDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, textAlign: 'center' },
});
