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
      <Pressable style={[st.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={onClose}>
        <Pressable style={[st.sheet, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={e => e.stopPropagation()}>
          {/* Glass highlight */}
          <View style={[st.glassTop, { backgroundColor: colors.glassHighlight }]} />

          {/* Handle */}
          <View style={st.handleWrap}>
            <View style={[st.handle, { backgroundColor: colors.textMuted }]} />
          </View>

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
          <View style={[st.divider, { backgroundColor: colors.glassBorder }]} />

          {!showPlaylists ? (
            <ScrollView style={st.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={st.actionRow} onPress={() => { playTrack(track); onClose(); }} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.glassActive }]}>
                  <PlayIcon size={16} color={colors.white} />
                </View>
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => { next(); onClose(); }} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                  <SkipForwardIcon size={16} color={colors.textSecondary} />
                </View>
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Play Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => { isLiked ? removeFavorite(track.id) : addFavorite(track); onClose(); }} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: isLiked ? 'rgba(236, 72, 153, 0.15)' : colors.controlBg }]}>
                  <HeartIcon size={16} color={isLiked ? colors.accentPink : colors.textSecondary} filled={isLiked} />
                </View>
                <Text style={[st.actionText, { color: isLiked ? colors.accentPink : colors.textPrimary }]}>{isLiked ? 'Unlike' : 'Like'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.actionRow} onPress={() => setShowPlaylists(true)} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                  <PlusIcon size={16} color={colors.textSecondary} />
                </View>
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Add to Playlist</Text>
              </TouchableOpacity>
              {track.artistId && (
                <TouchableOpacity style={st.actionRow} onPress={() => { onClose(); navigation.navigate('Artist', { id: track.artistId }); }} activeOpacity={0.6}>
                  <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                    <UserIcon size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[st.actionText, { color: colors.textPrimary }]}>Go to Artist</Text>
                </TouchableOpacity>
              )}
              {track.albumId && (
                <TouchableOpacity style={st.actionRow} onPress={() => { onClose(); navigation.navigate('Album', { id: track.albumId }); }} activeOpacity={0.6}>
                  <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                    <DiscIcon size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[st.actionText, { color: colors.textPrimary }]}>Go to Album</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={st.actionRow} onPress={() => {
                onClose();
                const url = track.appleMusicEmbedUrl || `https://music.apple.com/search?term=${encodeURIComponent(track.title + ' ' + track.artist)}`;
                Linking.openURL(url).catch(() => {});
              }} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                  <ShareIcon size={16} color={colors.textSecondary} />
                </View>
                <Text style={[st.actionText, { color: colors.textPrimary }]}>Share Song</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView style={st.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={st.actionRow} onPress={() => setShowCreateInput(true)} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.glassActive }]}>
                  <PlusIcon size={16} color={colors.accent} />
                </View>
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
                <TouchableOpacity key={p.id} style={st.actionRow} onPress={() => { addTrackToPlaylist(p.id, track); onClose(); }} activeOpacity={0.6}>
                  <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                    <MusicNoteIcon size={16} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.actionText, { color: colors.textPrimary }]}>{p.name}</Text>
                    <Text style={[st.actionSubtext, { color: colors.textTertiary }]}>{p.tracks.length} tracks</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={st.actionRow} onPress={() => setShowPlaylists(false)} activeOpacity={0.6}>
                <View style={[st.actionIconWrap, { backgroundColor: colors.controlBg }]}>
                  <ArrowLeftIcon size={16} color={colors.textTertiary} />
                </View>
                <Text style={[st.actionText, { color: colors.textTertiary }]}>Back</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={[st.cancelBtn, { backgroundColor: colors.controlBg }]} onPress={onClose} activeOpacity={0.7}>
            <Text style={[st.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 34,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  glassTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, opacity: 0.2 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  artwork: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artworkImage: { width: '100%', height: '100%' },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, letterSpacing: -0.2 },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2, letterSpacing: 0.2 },
  divider: { height: 1, marginHorizontal: 16 },
  actions: { paddingHorizontal: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 16 },
  actionIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: fontSize.md, fontFamily: fontFamily.medium, letterSpacing: -0.1 },
  actionSubtext: { fontSize: fontSize.xs, marginTop: 1 },
  createInput: { paddingHorizontal: 16, paddingBottom: 8 },
  textInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: fontSize.md, fontFamily: fontFamily.regular, marginBottom: 8 },
  createBtn: { borderRadius: borderRadius.full, paddingVertical: 10, alignItems: 'center' },
  createBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  cancelBtn: { marginTop: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: borderRadius.full, alignItems: 'center' },
  cancelText: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },
});
