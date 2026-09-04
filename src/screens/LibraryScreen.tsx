import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import SongActionSheet from '../components/SongActionSheet';
import { Track } from '../types';
import { PlusIcon, MusicNoteIcon } from '../components/Icons';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const colors = useTheme();
  const { favorites, favoriteAlbums, favoriteArtists, recentlyPlayed } = useLibraryStore();
  const { playlists, createPlaylist } = usePlaylistStore();
  const { playTrack } = usePlayerStore();

  const [showCreate, setShowCreate] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [actionTrack, setActionTrack] = React.useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = React.useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      <View style={st.header}>
        <View>
          <Text style={[st.title, { color: colors.textPrimary }]}>Your Library</Text>
          <Text style={[st.subtitle, { color: colors.textSecondary }]}>please choose the album you like</Text>
        </View>
        <TouchableOpacity style={[st.addBtn, { backgroundColor: colors.controlBg }]} activeOpacity={0.7} onPress={() => setShowCreate(!showCreate)}>
          <PlusIcon size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={{ paddingHorizontal: layout.screenPadding, marginBottom: 16 }}>
          <View style={st.createRow}>
            <TextInput style={[st.createInput, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
              placeholder="New playlist name..." placeholderTextColor={colors.textTertiary}
              value={newName} onChangeText={setNewName} autoFocus returnKeyType="done" onSubmitEditing={handleCreate} />
            <TouchableOpacity style={[st.createBtn, { backgroundColor: colors.accent }, !newName.trim() && { opacity: 0.5 }]} onPress={handleCreate}>
              <Text style={[st.createBtnText, { color: colors.white }]}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {playlists.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Playlists</Text>
          {playlists.map(p => (
            <TouchableOpacity key={p.id} style={st.listRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('Playlist', { id: p.id })}>
              <View style={[st.listArt, { backgroundColor: colors.bgSurface }]}>
                <MusicNoteIcon size={20} color={colors.accent} />
              </View>
              <View style={st.listInfo}>
                <Text style={[st.listTitle, { color: colors.textPrimary }]}>{p.name}</Text>
                <Text style={[st.listSubtitle, { color: colors.textSecondary }]}>{p.tracks.length} tracks</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {favorites.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Liked Songs</Text>
          {favorites.slice(0, 5).map((track, i) => (
            <TouchableOpacity key={track.id} style={st.listRow} activeOpacity={0.7}
              onPress={() => playTrack(track, favorites, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Image source={{ uri: track.artwork }} style={[st.listArt, { borderRadius: borderRadius.sm }]} />
              <View style={st.listInfo}>
                <Text style={[st.listTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
                <Text style={[st.listSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {favoriteAlbums.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Saved Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {favoriteAlbums.map(album => (
              <TouchableOpacity key={album.id} style={st.albumCard} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={[st.albumArt, { borderRadius: borderRadius.md }]} />
                <Text style={[st.albumTitle, { color: colors.textPrimary }]} numberOfLines={1}>{album.title}</Text>
                <Text style={[st.albumArtist, { color: colors.textSecondary }]} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {favoriteArtists.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Followed Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
            {favoriteArtists.map(artist => (
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

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Recently Played</Text>
          {recentlyPlayed.slice(0, 5).map((entry, i) => (
            <TouchableOpacity key={`${entry.track.id}-${i}`} style={st.listRow} activeOpacity={0.7}
              onPress={() => playTrack(entry.track, recentlyPlayed.map(e => e.track))}>
              <Image source={{ uri: entry.track.artwork }} style={[st.listArt, { borderRadius: borderRadius.sm }]} />
              <View style={st.listInfo}>
                <Text style={[st.listTitle, { color: colors.textPrimary }]} numberOfLines={1}>{entry.track.title}</Text>
                <Text style={[st.listSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{entry.track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {favorites.length === 0 && favoriteAlbums.length === 0 && favoriteArtists.length === 0 && playlists.length === 0 && recentlyPlayed.length === 0 && (
        <View style={st.emptyState}>
          <MusicNoteIcon size={48} color={colors.textMuted} />
          <Text style={[st.emptyTitle, { color: colors.textPrimary }]}>Your library is empty</Text>
          <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>Start saving songs and they'll appear here.</Text>
          <TouchableOpacity style={[st.emptyBtn, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('SearchTab')} activeOpacity={0.8}>
            <Text style={[st.emptyBtnText, { color: colors.white }]}>Explore Music</Text>
          </TouchableOpacity>
        </View>
      )}

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  createRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  createInput: { flex: 1, borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontSize.md, fontFamily: fontFamily.regular },
  createBtn: { borderRadius: borderRadius.full, paddingHorizontal: 16, paddingVertical: 10 },
  createBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  section: { marginBottom: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listArt: { width: 50, height: 50, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  listInfo: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
  listSubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  albumCard: { width: 160 },
  albumArt: { width: 160, height: 160, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  albumArtist: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2 },
  artistItem: { alignItems: 'center', width: 76 },
  artistCircle: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', borderWidth: 2, marginBottom: 8 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, width: 76, textAlign: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold },
  emptyDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, textAlign: 'center' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.full, marginTop: 8 },
  emptyBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
});
