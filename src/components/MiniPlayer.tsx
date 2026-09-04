import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useTheme } from '../hooks/useTheme';
import { HeartIcon, PauseIcon, PlayIcon, SkipForwardIcon } from './Icons';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { currentTrack, isPlaying, progress, duration, isLoading, togglePlay, next, toggleFullPlayer } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

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
    <View style={[s.container, { bottom: layout.navHeight + 6, backgroundColor: colors.miniPlayerBg, borderColor: colors.miniPlayerBorder }]}>
      <View style={[s.progressBar, { backgroundColor: colors.controlBg }]}>
        <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: colors.accent }]} />
      </View>

      <Pressable style={s.content} onPress={toggleFullPlayer}>
        <View style={[s.artwork, isPlaying && { borderColor: colors.accent }]}>
          <Image source={{ uri: currentTrack.artwork }} style={s.artworkImage} />
        </View>

        <View style={s.trackInfo}>
          <Text style={[s.title, { color: colors.textPrimary }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[s.artist, { color: colors.textTertiary }]} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        {isLoading ? (
          <View style={s.iconBtn}>
            <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
              <View style={[s.loadingRing, { borderColor: colors.accent, borderTopColor: 'transparent' }]} />
            </Animated.View>
          </View>
        ) : (
          <TouchableOpacity style={s.iconBtn}
            onPress={(e) => { e.stopPropagation(); isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack); }}
            activeOpacity={0.7}>
            <HeartIcon size={18} color={isLiked ? colors.accentPink : colors.textTertiary} filled={isLiked} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[s.playBtn, { backgroundColor: colors.white }]} onPress={(e) => { e.stopPropagation(); togglePlay(); }} activeOpacity={0.8}>
          {isPlaying ? <PauseIcon size={18} color={colors.bgBase} /> : <PlayIcon size={18} color={colors.bgBase} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.iconBtn} onPress={(e) => { e.stopPropagation(); next(); }} activeOpacity={0.7}>
          <SkipForwardIcon size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute', left: 8, right: 8, height: layout.miniPlayerHeight,
    borderRadius: borderRadius.lg, borderWidth: 1, zIndex: 300, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  progressBar: { height: 2 },
  progressFill: { height: '100%', borderRadius: 1 },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  artwork: { width: 46, height: 46, borderRadius: borderRadius.sm, overflow: 'hidden', borderWidth: 1.5, borderColor: 'transparent' },
  artworkImage: { width: '100%', height: '100%' },
  trackInfo: { flex: 1, minWidth: 0 },
  title: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  artist: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 1 },
  iconBtn: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  loadingRing: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
});
