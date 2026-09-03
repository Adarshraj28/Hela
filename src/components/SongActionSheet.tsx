import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  Pressable, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { Track } from '../types';

interface Props {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
}

export default function SongActionSheet({ track, visible, onClose }: Props) {
  const navigation = useNavigation<any>();
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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Track info header */}
          <View style={styles.header}>
            <View style={styles.artwork}>
              <Text style={styles.artworkIcon}>♫</Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {!showPlaylists ? (
            <ScrollView style={styles.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionRow} onPress={() => {
                playTrack(track);
                onClose();
              }}>
                <Text style={styles.actionIcon}>▶</Text>
                <Text style={styles.actionText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => {
                next();
                onClose();
              }}>
                <Text style={styles.actionIcon}>⏭</Text>
                <Text style={styles.actionText}>Play Next</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => {
                isLiked ? removeFavorite(track.id) : addFavorite(track);
                onClose();
              }}>
                <Text style={[styles.actionIcon, isLiked && { color: colors.accentPink }]}>♥</Text>
                <Text style={[styles.actionText, isLiked && { color: colors.accentPink }]}>
                  {isLiked ? 'Unlike' : 'Like'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => setShowPlaylists(true)}>
                <Text style={styles.actionIcon}>+♫</Text>
                <Text style={styles.actionText}>Add to Playlist</Text>
              </TouchableOpacity>

              {track.artistId && (
                <TouchableOpacity style={styles.actionRow} onPress={() => {
                  onClose();
                  navigation.navigate('Artist', { id: track.artistId });
                }}>
                  <Text style={styles.actionIcon}>👤</Text>
                  <Text style={styles.actionText}>Go to Artist</Text>
                </TouchableOpacity>
              )}

              {track.albumId && (
                <TouchableOpacity style={styles.actionRow} onPress={() => {
                  onClose();
                  navigation.navigate('Album', { id: track.albumId });
                }}>
                  <Text style={styles.actionIcon}>💿</Text>
                  <Text style={styles.actionText}>Go to Album</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <ScrollView style={styles.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionRow} onPress={() => setShowCreateInput(true)}>
                <Text style={[styles.actionIcon, { color: colors.accent }]}>+</Text>
                <Text style={[styles.actionText, { color: colors.accent }]}>Create New Playlist</Text>
              </TouchableOpacity>

              {showCreateInput && (
                <View style={styles.createInput}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Playlist name"
                    placeholderTextColor={colors.textTertiary}
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreatePlaylist}
                  />
                  <TouchableOpacity style={[styles.createBtn, !newPlaylistName.trim() && { opacity: 0.5 }]} onPress={handleCreatePlaylist}>
                    <Text style={styles.createBtnText}>Create & Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {playlists.map(p => (
                <TouchableOpacity key={p.id} style={styles.actionRow} onPress={() => {
                  addTrackToPlaylist(p.id, track);
                  onClose();
                }}>
                  <Text style={styles.actionIcon}>♫</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionText}>{p.name}</Text>
                    <Text style={styles.actionSubtext}>{p.tracks.length} tracks</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.actionRow} onPress={() => setShowPlaylists(false)}>
                <Text style={[styles.actionIcon, { color: colors.textTertiary }]}>←</Text>
                <Text style={[styles.actionText, { color: colors.textTertiary }]}>Back</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkIcon: {
    fontSize: 20,
    color: colors.white,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 16,
  },
  actions: {
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionIcon: {
    fontSize: 18,
    color: colors.textPrimary,
    width: 24,
    textAlign: 'center',
  },
  actionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  actionSubtext: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  createInput: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  textInput: {
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  createBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingVertical: 10,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  cancelBtn: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
