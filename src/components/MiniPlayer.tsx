import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { HeartIcon, PauseIcon, PlayIcon, SkipForwardIcon } from './Icons';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, progress, duration, isLoading, togglePlay, next, toggleFullPlayer } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

  // Loading animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoading]);

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

        {/* Loading indicator */}
        {isLoading ? (
          <View style={styles.iconBtn}>
            <Animated.View style={{
              transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }]
            }}>
              <View style={styles.loadingRing} />
            </Animated.View>
          </View>
        ) : (
          <TouchableOpacity style={styles.iconBtn}
            onPress={(e) => { e.stopPropagation(); isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack); }}
            activeOpacity={0.7}>
            <HeartIcon size={18} color={isLiked ? colors.accentPink : colors.textTertiary} filled={isLiked} />
          </TouchableOpacity>
        )}

        {/* Play/Pause */}
        <TouchableOpacity style={styles.playBtn} onPress={(e) => { e.stopPropagation(); togglePlay(); }} activeOpacity={0.8}>
          {isPlaying ? <PauseIcon size={18} color={colors.bgBase} /> : <PlayIcon size={18} color={colors.bgBase} />}
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e.stopPropagation(); next(); }} activeOpacity={0.7}>
          <SkipForwardIcon size={18} color={colors.textSecondary} />
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
    backgroundColor: 'rgba(18, 18, 30, 0.96)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  artist: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textTertiary,
    marginTop: 1,
  },
  iconBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.accent,
    borderTopColor: 'transparent',
  },
});
