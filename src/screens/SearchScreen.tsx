import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { useSearchStore } from '../store/searchStore';
import { searchAll } from '../services/musicApi';
import { Track, Artist, Album } from '../types';
import SongActionSheet from '../components/SongActionSheet';
import { SearchIcon, XIcon, TrashIcon } from '../components/Icons';

const GENRES = ['Pop', 'Hip-Hop', 'Rock', 'R&B', 'Country', 'Latin', 'K-Pop', 'Indie', 'Jazz', 'Classical'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const colors = useTheme();
  const { playTrack } = usePlayerStore();
  const { history, addSearch, removeSearch, clearHistory, loadHistory } = useSearchStore();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [actionTrack, setActionTrack] = useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setTracks([]); setArtists([]); setAlbums([]); setSearched(false); return; }
    try {
      setLoading(true);
      addSearch(q.trim());
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

  const handleHistoryTap = (q: string) => {
    setQuery(q);
    doSearch(q);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const noResults = searched && !loading && tracks.length === 0 && artists.length === 0 && albums.length === 0;
  const showBrowse = !searched && !loading;

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* Search Bar */}
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

      {/* Search Results */}
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

      {/* Browse Section (when not searching) */}
      {showBrowse && (
        <>
          {/* Search History */}
          {history.length > 0 && (
            <View style={st.section}>
              <View style={st.sectionHeader}>
                <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearHistory} activeOpacity={0.7}>
                  <Text style={[st.clearBtn, { color: colors.accentRed }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              {history.slice(0, 8).map((q, i) => (
                <TouchableOpacity key={`${q}-${i}`} style={st.historyRow} activeOpacity={0.7}
                  onPress={() => handleHistoryTap(q)}>
                  <SearchIcon size={16} color={colors.textTertiary} />
                  <Text style={[st.historyText, { color: colors.textPrimary }]} numberOfLines={1}>{q}</Text>
                  <TouchableOpacity onPress={() => removeSearch(q)} activeOpacity={0.7}>
                    <XIcon size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Browse by Genre */}
          <View style={st.section}>
            <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Browse by Genre</Text>
            <View style={st.genreGrid}>
              {GENRES.map(genre => (
                <TouchableOpacity key={genre} style={[st.genreChip, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium }]}
                  activeOpacity={0.7} onPress={() => { setQuery(genre); doSearch(genre); }}>
                  <Text style={[st.genreText, { color: colors.textPrimary }]}>{genre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Empty State */}
          {history.length === 0 && (
            <View style={st.emptyState}>
              <SearchIcon size={48} color={colors.textMuted} />
              <Text style={[st.emptyTitle, { color: colors.textPrimary }]}>Search for music</Text>
              <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>Find your favorite songs, artists, and albums</Text>
            </View>
          )}
        </>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, marginBottom: 12 },
  clearBtn: { fontSize: fontSize.sm, fontFamily: fontFamily.medium },

  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  historyText: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.regular },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.full, borderWidth: 1 },
  genreText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },

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
