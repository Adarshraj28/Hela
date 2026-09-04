import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { ArrowLeftIcon, PlayIcon, TrashIcon, MusicNoteIcon } from '../components/Icons';

export default function PlaylistScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { playTrack } = usePlayerStore();
  const { getPlaylist, deletePlaylist } = usePlaylistStore();
  const playlist = getPlaylist(route.params?.id);

  if (!playlist) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>Playlist not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontFamily: fontFamily.medium }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.playlistArt}>
          <MusicNoteIcon size={48} color={colors.white} />
        </View>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.playlistCount}>{playlist.tracks.length} tracks</Text>
      </View>

      <View style={styles.actions}>
        {playlist.tracks.length > 0 && (
          <TouchableOpacity style={styles.playBtn}
            onPress={() => playTrack(playlist.tracks[0], playlist.tracks, 0)}
            activeOpacity={0.8}>
            <PlayIcon size={22} color={colors.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn}
          onPress={() => { deletePlaylist(playlist.id); navigation.goBack(); }}
          activeOpacity={0.7}>
          <TrashIcon size={16} color={colors.accentRed} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        {playlist.tracks.length === 0 ? (
          <View style={styles.emptyState}>
            <MusicNoteIcon size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>This playlist is empty</Text>
            <Text style={styles.emptyDesc}>Search for songs and add them to this playlist.</Text>
          </View>
        ) : playlist.tracks.map((track, i) => (
          <TouchableOpacity key={`${track.id}-${i}`} style={styles.trackRow} activeOpacity={0.7}
            onPress={() => playTrack(track, playlist.tracks, i)}>
            <Text style={styles.trackIndex}>{i + 1}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loading: { flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  header: { alignItems: 'center', paddingTop: 80, paddingHorizontal: layout.screenPadding },
  playlistArt: {
    width: 200, height: 200, borderRadius: borderRadius.lg,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16,
  },
  playlistName: {
    fontSize: fontSize.xxl, fontFamily: fontFamily.bold,
    color: colors.textPrimary, letterSpacing: -0.5, textAlign: 'center',
  },
  playlistCount: {
    fontSize: fontSize.sm, fontFamily: fontFamily.regular,
    color: colors.textSecondary, marginTop: 4,
  },
  actions: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 16, marginTop: 20, marginBottom: 20, paddingHorizontal: layout.screenPadding,
  },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: borderRadius.full, borderWidth: 1,
    borderColor: colors.borderMedium, alignItems: 'center', gap: 6,
  },
  deleteText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.accentRed },

  trackRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted, fontFamily: fontFamily.medium },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  emptyDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, textAlign: 'center' },
});
