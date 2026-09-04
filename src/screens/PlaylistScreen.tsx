import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useTheme } from '../hooks/useTheme';
import { ArrowLeftIcon, PlayIcon, TrashIcon, MusicNoteIcon } from '../components/Icons';

export default function PlaylistScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { playTrack } = usePlayerStore();
  const { getPlaylist, deletePlaylist } = usePlaylistStore();
  const playlist = getPlaylist(route.params?.id);

  if (!playlist) {
    return (
      <View style={[st.loading, { backgroundColor: colors.bgBase }]}>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>Playlist not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontFamily: fontFamily.medium }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[st.backBtn, { top: insets.top + 8, backgroundColor: colors.controlBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.white} />
      </TouchableOpacity>

      <View style={st.header}>
        <View style={[st.playlistArt, { backgroundColor: colors.accent }]}>
          <MusicNoteIcon size={48} color={colors.white} />
        </View>
        <Text style={[st.playlistName, { color: colors.textPrimary }]}>{playlist.name}</Text>
        <Text style={[st.playlistCount, { color: colors.textSecondary }]}>{playlist.tracks.length} tracks</Text>
      </View>

      <View style={st.actions}>
        {playlist.tracks.length > 0 && (
          <TouchableOpacity style={[st.playBtn, { backgroundColor: colors.accent }]}
            onPress={() => playTrack(playlist.tracks[0], playlist.tracks, 0)} activeOpacity={0.8}>
            <PlayIcon size={22} color={colors.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[st.deleteBtn, { borderColor: colors.borderMedium }]}
          onPress={() => { deletePlaylist(playlist.id); navigation.goBack(); }} activeOpacity={0.7}>
          <TrashIcon size={16} color={colors.accentRed} />
          <Text style={[st.deleteText, { color: colors.accentRed }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: layout.screenPadding }}>
        {playlist.tracks.length === 0 ? (
          <View style={st.emptyState}>
            <MusicNoteIcon size={40} color={colors.textMuted} />
            <Text style={[st.emptyTitle, { color: colors.textPrimary }]}>This playlist is empty</Text>
            <Text style={[st.emptyDesc, { color: colors.textSecondary }]}>Search for songs and add them to this playlist.</Text>
          </View>
        ) : playlist.tracks.map((track, i) => (
          <TouchableOpacity key={`${track.id}-${i}`} style={[st.trackRow, { borderBottomColor: colors.borderSubtle }]} activeOpacity={0.7}
            onPress={() => playTrack(track, playlist.tracks, i)}>
            <Text style={[st.trackIndex, { color: colors.textMuted }]}>{i + 1}</Text>
            <View style={st.trackInfo}>
              <Text style={[st.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
              <Text style={[st.trackArtist, { color: colors.textTertiary }]} numberOfLines={1}>{track.artist}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingTop: 80, paddingHorizontal: layout.screenPadding },
  playlistArt: { width: 200, height: 200, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  playlistName: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5, textAlign: 'center' },
  playlistCount: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20, marginBottom: 20, paddingHorizontal: layout.screenPadding },
  playBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, borderRadius: borderRadius.full, borderWidth: 1, alignItems: 'center', gap: 6 },
  deleteText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1 },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold },
  emptyDesc: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, textAlign: 'center' },
});
