import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';

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
        <Text style={{ color: colors.textSecondary }}>Playlist not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.playlistArt}>
          <Text style={styles.playlistIcon}>♫</Text>
        </View>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.playlistCount}>{playlist.tracks.length} tracks</Text>
      </View>

      <View style={styles.actions}>
        {playlist.tracks.length > 0 && (
          <TouchableOpacity style={styles.playBtn}
            onPress={() => playTrack(playlist.tracks[0], playlist.tracks, 0)}>
            <Text style={styles.playBtnText}>▶</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn}
          onPress={() => { deletePlaylist(playlist.id); navigation.goBack(); }}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        {playlist.tracks.length === 0 ? (
          <View style={styles.emptyState}>
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
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: colors.white },
  header: { alignItems: 'center', paddingTop: 80, paddingHorizontal: layout.screenPadding },
  playlistArt: { width: 200, height: 200, borderRadius: borderRadius.lg, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  playlistIcon: { fontSize: 48, color: colors.white },
  playlistName: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.5, textAlign: 'center' },
  playlistCount: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20, marginBottom: 20, paddingHorizontal: layout.screenPadding },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 20, color: colors.white, marginLeft: 2 },
  deleteBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderMedium },
  deleteText: { fontSize: fontSize.sm, color: colors.accentRed, fontWeight: fontWeight.medium },

  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  trackArtist: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});
