import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import SongActionSheet from '../components/SongActionSheet';
import { TextInput } from 'react-native';
import { Track } from '../types';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { favorites, favoriteAlbums, favoriteArtists, recentlyPlayed } = useLibraryStore();
  const { playlists } = usePlaylistStore();
  const { playTrack } = usePlayerStore();

  const [showCreate, setShowCreate] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const { createPlaylist } = usePlaylistStore();
  const [actionTrack, setActionTrack] = React.useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = React.useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Library</Text>
          <Text style={styles.subtitle}>please choose the album you like</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={{ paddingHorizontal: layout.screenPadding, marginBottom: 16 }}>
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              placeholder="New playlist name..."
              placeholderTextColor={colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity style={[styles.createBtn, !newName.trim() && { opacity: 0.5 }]} onPress={handleCreate}>
              <Text style={styles.createBtnText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          {playlists.map(p => (
            <TouchableOpacity key={p.id} style={styles.listRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('Playlist', { id: p.id })}>
              <View style={styles.listArt}>
                <Text style={styles.listArtText}>♫</Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{p.name}</Text>
                <Text style={styles.listSubtitle}>{p.tracks.length} tracks</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Liked Songs */}
      {favorites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liked Songs</Text>
          {favorites.slice(0, 5).map((track, i) => (
            <TouchableOpacity key={track.id} style={styles.listRow} activeOpacity={0.7}
              onPress={() => playTrack(track, favorites, i)}
              onLongPress={() => { setActionTrack(track); setShowActionSheet(true); }}>
              <Image source={{ uri: track.artwork }} style={styles.listArt} />
              <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.listSubtitle} numberOfLines={1}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Saved Albums */}
      {favoriteAlbums.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {favoriteAlbums.map(album => (
              <TouchableOpacity key={album.id} style={styles.albumCard} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={styles.albumArt} />
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Saved Artists */}
      {favoriteArtists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Followed Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
            {favoriteArtists.map(artist => (
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

      {favorites.length === 0 && favoriteAlbums.length === 0 && favoriteArtists.length === 0 && playlists.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>♫</Text>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptyDesc}>Start saving songs and they'll appear here.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('SearchTab')}>
            <Text style={styles.emptyBtnText}>Explore Music</Text>
          </TouchableOpacity>
        </View>
      )}

      <SongActionSheet track={actionTrack} visible={showActionSheet} onClose={() => setShowActionSheet(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: layout.screenPadding, marginBottom: 24 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 20, color: colors.textSecondary },
  createRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  createInput: { flex: 1, backgroundColor: colors.bgSurface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.borderMedium, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontSize.md, color: colors.textPrimary },
  createBtn: { backgroundColor: colors.accent, borderRadius: borderRadius.full, paddingHorizontal: 16, paddingVertical: 10 },
  createBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.white },

  section: { marginBottom: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 },

  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listArt: { width: 50, height: 50, borderRadius: borderRadius.sm, backgroundColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  listArtText: { fontSize: 20, color: colors.accent },
  listInfo: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  listSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  albumCard: { width: 160 },
  albumArt: { width: 160, height: 160, borderRadius: borderRadius.md, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  albumArtist: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  artistItem: { alignItems: 'center', width: 76 },
  artistCircle: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textPrimary, width: 76, textAlign: 'center' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, color: colors.textMuted, marginBottom: 16 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.accent, borderRadius: borderRadius.full },
  emptyBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.white },
});
