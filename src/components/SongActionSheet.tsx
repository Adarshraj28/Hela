import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  Pressable, ScrollView, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, fontSize, fontWeight, fontFamily } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { Track } from '../types';
import {
  PlayIcon, SkipForwardIcon, HeartIcon, PlusIcon, UserIcon, DiscIcon, MusicNoteIcon, ArrowLeftIcon,
} from './Icons';

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
              {track.artwork ? (
                <Image source={{ uri: track.artwork }} style={styles.artworkImage} />
              ) : (
                <MusicNoteIcon size={22} color={colors.white} />
              )}
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
                <PlayIcon size={18} color={colors.textPrimary} />
                <Text style={styles.actionText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => {
                next();
                onClose();
              }}>
                <SkipForwardIcon size={18} color={colors.textPrimary} />
                <Text style={styles.actionText}>Play Next</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => {
                isLiked ? removeFavorite(track.id) : addFavorite(track);
                onClose();
              }}>
                <HeartIcon size={18} color={isLiked ? colors.accentPink : colors.textPrimary} filled={isLiked} />
                <Text style={[styles.actionText, isLiked && { color: colors.accentPink }]}>
                  {isLiked ? 'Unlike' : 'Like'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => setShowPlaylists(true)}>
                <PlusIcon size={18} color={colors.textPrimary} />
                <Text style={styles.actionText}>Add to Playlist</Text>
              </TouchableOpacity>

              {track.artistId && (
                <TouchableOpacity style={styles.actionRow} onPress={() => {
                  onClose();
                  navigation.navigate('Artist', { id: track.artistId });
                }}>
                  <UserIcon size={18} color={colors.textPrimary} />
                  <Text style={styles.actionText}>Go to Artist</Text>
                </TouchableOpacity>
              )}

              {track.albumId && (
                <TouchableOpacity style={styles.actionRow} onPress={() => {
                  onClose();
                  navigation.navigate('Album', { id: track.albumId });
                }}>
                  <DiscIcon size={18} color={colors.textPrimary} />
                  <Text style={styles.actionText}>Go to Album</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <ScrollView style={styles.actions} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.actionRow} onPress={() => setShowCreateInput(true)}>
                <PlusIcon size={18} color={colors.accent} />
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
                  <MusicNoteIcon size={18} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionText}>{p.name}</Text>
                    <Text style={styles.actionSubtext}>{p.tracks.length} tracks</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.actionRow} onPress={() => setShowPlaylists(false)}>
                <ArrowLeftIcon size={18} color={colors.textTertiary} />
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
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
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
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
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
  actionText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
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
    fontFamily: fontFamily.semibold,
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
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
});
