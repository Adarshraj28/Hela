import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { borderRadius, fontSize, fontFamily } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useTheme } from '../hooks/useTheme';
import { Track } from '../types';
import { PlayIcon, SkipForwardIcon, HeartIcon, PlusIcon, UserIcon, DiscIcon, MusicNoteIcon, ArrowLeftIcon, ShareIcon } from './Icons';
import { Linking } from 'react-native';

interface Props { track: Track | null; visible: boolean; onClose: () => void; }

export default function SongActionSheet({ track, visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const colors = useTheme();
  const { playTrack, next } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylistStore();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  if (!track) return null;
  const isLiked = isFavorite(track.id);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    addTrackToPlaylist(pl.id, track);
    setNewPlaylistName('');
    setShowCreateInput(false);
    setShowPlaylists(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[st.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[st.sheet, { backgroundColor: colors.sheetBg }]} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={st.header}>
            <View style={[st.artwork, { backgroundColor: colors.bgSurface }]}>
              {track.artwork ? <Image source={{ uri: track.artwork }} style={st.artworkImage} /> : <MusicNoteIcon size={22} color={colors.white} />}
            </View>
            <View style={st.trackInfo}>
              <Text style={[st.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
              <Text style={[st.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
            </View>
          </View>
          <View style={[st.divider, { backgroundColor: colors.borderSubtle }]} />

          {!showPlaylists ? (
            <ScrollView style={st.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={st.actionRow} onPress={() => { playTrack(track); onClose(); }}>
                <PlayIcon size={18} color={colors.textPrimary} />
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => { next(); onClose(); }}>
                <SkipForwardIcon size={18} color={colors.textPrimary} />
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Play Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => { isLiked ? removeFavorite(track.id) : addFavorite(track); onClose(); }}>
                <HeartIcon size={18} color={isLiked ? colors.accentPink : colors.textPrimary} filled={isLiked} />
                <Text style={[st.actionText, { color: isLiked ? colors.accentPink : colors.textPrimary }]}>{isLiked ? 'Unlike' : 'Like'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => setShowPlaylists(true)}>
                <PlusIcon size={18} color={colors.textPrimary} />
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Add to Playlist</Text>
              </TouchableOpacity>
              {track.artistId && (
                <TouchableOpacity style={st.actionRow} onPress={() => { onClose(); navigation.navigate('Artist', { id: track.artistId }); }}>
                  <UserIcon size={18} color={colors.textPrimary} />
                  <Text style={[st.actionText, { color: colors.textPrimary }]}>Go to Artist</Text>
                </TouchableOpacity>
              )}
              {track.albumId && (
                <TouchableOpacity style={st.actionRow} onPress={() => { onClose(); navigation.navigate('Album', { id: track.albumId }); }}>
                  <DiscIcon size={18} color={colors.textPrimary} />
                  <Text style={[st.actionText, { color: colors.textPrimary }]}>Go to Album</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={st.actionRow} onPress={() => {
                onClose();
                const url = track.appleMusicEmbedUrl || `https://music.apple.com/search?term=${encodeURIComponent(track.title + ' ' + track.artist)}`;
                Linking.openURL(url).catch(() => {});
              }}>
                <ShareIcon size={18} color={colors.textPrimary} />
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Share Song</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView style={st.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={st.actionRow} onPress={() => setShowCreateInput(true)}>
                <PlusIcon size={18} color={colors.accent} />
                <Text style={[st.actionText, { color: colors.accent }]}>Create New Playlist</Text>
              </TouchableOpacity>
              {showCreateInput && (
                <View style={st.createInput}>
                  <TextInput style={[st.textInput, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                    placeholder="Playlist name" placeholderTextColor={colors.textTertiary}
                    value={newPlaylistName} onChangeText={setNewPlaylistName} autoFocus returnKeyType="done" onSubmitEditing={handleCreatePlaylist} />
                  <TouchableOpacity style={[st.createBtn, { backgroundColor: colors.accent }, !newPlaylistName.trim() && { opacity: 0.5 }]} onPress={handleCreatePlaylist}>
                    <Text style={[st.createBtnText, { color: colors.white }]}>Create & Add</Text>
                  </TouchableOpacity>
                </View>
              )}
              {playlists.map(p => (
                <TouchableOpacity key={p.id} style={st.actionRow} onPress={() => { addTrackToPlaylist(p.id, track); onClose(); }}>
                  <MusicNoteIcon size={18} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[st.actionText, { color: colors.textPrimary }]}>{p.name}</Text>
                    <Text style={[st.actionSubtext, { color: colors.textTertiary }]}>{p.tracks.length} tracks</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={st.actionRow} onPress={() => setShowPlaylists(false)}>
                <ArrowLeftIcon size={18} color={colors.textTertiary} />
                <Text style={[st.actionText, { color: colors.textTertiary }]}>Back</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={[st.cancelBtn, { backgroundColor: colors.controlBg }]} onPress={onClose}>
            <Text style={[st.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 34 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  artwork: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  actions: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  actionText: { fontSize: fontSize.md, fontFamily: fontFamily.medium },
  actionSubtext: { fontSize: fontSize.xs, marginTop: 1 },
  createInput: { paddingHorizontal: 16, paddingBottom: 8 },
  textInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: fontSize.md, fontFamily: fontFamily.regular, marginBottom: 8 },
  createBtn: { borderRadius: borderRadius.full, paddingVertical: 10, alignItems: 'center' },
  createBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  cancelBtn: { marginTop: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: borderRadius.full, alignItems: 'center' },
  cancelText: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
});
