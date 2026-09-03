import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { layout } from '../constants/theme';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, progress, duration, isLoading, togglePlay, next, toggleFullPlayer } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

  if (!currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View style={[styles.container, { bottom: layout.navHeight + 6 }]}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      <Pressable style={styles.content} onPress={toggleFullPlayer}>
        {/* Artwork */}
        <View style={[styles.artwork, isPlaying && styles.artworkActive]}>
          <Image source={{ uri: currentTrack.artwork }} style={styles.artworkImage} />
        </View>

        {/* Track info */}
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        {/* Loading */}
        {isLoading && <View style={styles.loadingDot} />}

        {/* Favorite */}
        <TouchableOpacity style={styles.iconBtn}
          onPress={(e) => { e.stopPropagation(); isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack); }}>
          <Text style={[styles.heartIcon, isLiked && { color: colors.accentPink }]}>♥</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity style={styles.playBtn} onPress={(e) => { e.stopPropagation(); togglePlay(); }}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e.stopPropagation(); next(); }}>
          <Text style={styles.skipIcon}>⏭</Text>
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: layout.miniPlayerHeight,
    backgroundColor: 'rgba(18, 18, 30, 0.94)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  artworkActive: {
    borderColor: colors.accent,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  artist: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  loadingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.accent,
    borderTopColor: 'transparent',
    // Note: animate would need Animated API
  },
  iconBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    marginLeft: 2,
  },
  skipIcon: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
