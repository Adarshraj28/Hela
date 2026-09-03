import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Pressable, Dimensions, Modal, Animated, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, fontFamily } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getTrackLyrics, LyricLine } from '../services/musicApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.38);

export default function FullPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack, isPlaying, progress, duration, shuffle, repeat,
    showFullPlayer, toggleFullPlayer, togglePlay, next, previous, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite, addToRecentlyPlayed } = useLibraryStore();

  const [view, setView] = useState<'highlight' | 'lyrics' | 'embed'>('highlight');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  // Animated values for artwork transition
  const artworkAnim = useRef(new Animated.Value(0)).current;
  const prevTrackId = useRef<string | undefined>(undefined);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Ambient background color derived from artwork dominant color
  const [ambientColor, setAmbientColor] = useState('rgba(139, 92, 246, 0.08)');

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  // Animate artwork on track change
  useEffect(() => {
    if (prevTrackId.current && prevTrackId.current !== currentTrack?.id) {
      // Crossfade: fade out old, fade in new
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 0.92, friction: 8, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]),
      ]).start();
    }
    prevTrackId.current = currentTrack?.id;

    // Subtle ambient color shift based on artwork index
    const hues = [
      'rgba(139, 92, 246, 0.08)',  // purple
      'rgba(236, 72, 153, 0.06)',  // pink
      'rgba(59, 130, 246, 0.06)',  // blue
      'rgba(34, 197, 94, 0.05)',   // green
      'rgba(249, 115, 22, 0.05)',  // orange
    ];
    const idx = currentTrack ? Math.abs(hashCode(currentTrack.id)) % hues.length : 0;
    setAmbientColor(hues[idx]);
  }, [currentTrack?.id]);

  // Breathing animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.015, duration: 2000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isPlaying]);

  // Fetch lyrics
  useEffect(() => {
    if (view !== 'lyrics' || !currentTrack?.appleMusicTrackId) return;
    setLyricsLoading(true);
    getTrackLyrics(String(currentTrack.appleMusicTrackId))
      .then(setLyrics)
      .catch(() => setLyrics([]))
      .finally(() => setLyricsLoading(false));
  }, [view, currentTrack?.id, currentTrack?.appleMusicTrackId]);

  useEffect(() => {
    if (currentTrack && isPlaying) addToRecentlyPlayed(currentTrack);
  }, [currentTrack?.id]);

  if (!showFullPlayer || !currentTrack) return null;

  const handleSeek = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const barWidth = SCREEN_WIDTH - 48;
    const p = Math.max(0, Math.min(1, x / barWidth));
    seek(p * duration);
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={showFullPlayer} animationType="slide" presentationStyle="fullScreen" onRequestClose={toggleFullPlayer}>
      <View style={styles.container}>
        {/* Ambient artwork background */}
        <Animated.View style={[styles.ambientBg, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.ambientImage}
            blurRadius={60}
          />
          <View style={styles.ambientOverlay} />
        </Animated.View>

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.topBtn} onPress={toggleFullPlayer} activeOpacity={0.7}>
            <View style={styles.chevronDown}>
              <View style={styles.chevronLine} />
            </View>
          </TouchableOpacity>

          <View style={styles.tabBar}>
            {(['highlight', 'lyrics', 'embed'] as const).map(v => (
              <TouchableOpacity key={v} style={[styles.tab, view === v && styles.tabActive]}
                onPress={() => setView(v)} activeOpacity={0.7}>
                <Text style={[styles.tabText, view === v && styles.tabTextActive]}>
                  {v === 'highlight' ? 'Highlight' : v === 'lyrics' ? 'Lyrics' : 'Video'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.topBtn} activeOpacity={0.7}>
            <Text style={styles.moreDots}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {view === 'highlight' && (
            <>
              {/* Artwork with ambient glow */}
              <View style={styles.artworkGlowContainer}>
                <View style={[styles.artworkGlow, { backgroundColor: ambientColor.replace('0.08', '0.3').replace('0.06', '0.25').replace('0.05', '0.2') }]} />
                <Animated.View style={[
                  styles.artworkContainer,
                  { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}>
                  <Image
                    source={{ uri: currentTrack.artwork }}
                    style={styles.artwork}
                  />
                </Animated.View>
              </View>

              {/* Track info */}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>

              {/* Seek bar */}
              <View style={styles.seekContainer}>
                <Pressable style={styles.seekBar} onPress={handleSeek}>
                  <View style={[styles.seekFill, { width: `${pct}%` }]}>
                    <View style={styles.seekThumb} />
                  </View>
                </Pressable>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatTime(progress)}</Text>
                  <Text style={styles.timeText}>{formatTime(Math.max(0, duration - progress))}</Text>
                </View>
              </View>

              {/* Transport controls */}
              <View style={styles.transport}>
                <TouchableOpacity style={styles.transportBtn} onPress={toggleShuffle} activeOpacity={0.7}>
                  <Text style={[styles.transportIcon, shuffle && { color: colors.accent }]}>⇌</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.transportBtn} onPress={previous} activeOpacity={0.7}>
                  <View style={styles.prevNextBtn}>
                    <Text style={styles.skipIcon}>◀◀</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay} activeOpacity={0.8}>
                  <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.transportBtn} onPress={next} activeOpacity={0.7}>
                  <View style={styles.prevNextBtn}>
                    <Text style={styles.skipIcon}>▶▶</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.transportBtn} onPress={cycleRepeat} activeOpacity={0.7}>
                  <Text style={[styles.transportIcon, repeat !== 'off' && { color: colors.accent }]}>
                    {repeat === 'one' ? '↻¹' : '↻'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Secondary actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack)}
                  activeOpacity={0.7}>
                  <Text style={[styles.secondaryIcon, isLiked && styles.heartActive]}>♥</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
                  <Text style={styles.secondaryIcon}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
                  <Text style={styles.secondaryIcon}>⋯</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom buttons */}
              <View style={styles.bottomBtns}>
                <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
                  <Text style={styles.bottomBtnText}>⚙ Equalizer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
                  <Text style={styles.bottomBtnText}>☰ Queue List</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {view === 'lyrics' && (
            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricsTrackTitle}>{currentTrack.title}</Text>
              <Text style={styles.lyricsTrackArtist}>{currentTrack.artist}</Text>
              {lyricsLoading ? (
                <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 40 }} />
              ) : lyrics.length > 0 ? (
                <ScrollView
                  style={styles.lyricsScroll}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                >
                  {lyrics.map((line, i) => {
                    const lineStart = line.startTimeMs / 1000;
                    const lineEnd = i < lyrics.length - 1 ? lyrics[i + 1].startTimeMs / 1000 : duration;
                    const isActive = progress >= lineStart && progress < lineEnd;
                    return (
                      <Text
                        key={i}
                        style={[styles.lyricLine, isActive && styles.lyricLineActive]}
                      >
                        {line.words}
                      </Text>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.lyricsPlaceholder}>No lyrics available for this track</Text>
              )}
            </View>
          )}

          {view === 'embed' && (
            <View style={styles.embedContainer}>
              <Text style={styles.embedTitle}>{currentTrack.title}</Text>
              <Text style={styles.embedArtist}>{currentTrack.artist}</Text>
              <View style={styles.embedPlaceholder}>
                <Text style={styles.embedPlaceholderIcon}>♪</Text>
                <Text style={styles.embedText}>Apple Music</Text>
                <Text style={styles.embedSubtext}>Full song playback</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Simple string hash for deterministic color selection
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },

  // Ambient background
  ambientBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  ambientImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.5 }],
  },
  ambientOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(6, 6, 11, 0.75)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 10,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronDown: {
    width: 18,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine: {
    width: 18,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '0deg' }],
  },
  moreDots: {
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: -2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  // Artwork with ambient glow
  artworkGlowContainer: {
    width: ARTWORK_SIZE + 40,
    height: ARTWORK_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  artworkGlow: {
    position: 'absolute',
    width: ARTWORK_SIZE + 40,
    height: ARTWORK_SIZE + 40,
    borderRadius: (ARTWORK_SIZE + 40) / 2,
    opacity: 0.6,
  },
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.7,
    shadowRadius: 48,
    elevation: 20,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },

  // Track info
  trackInfo: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    maxWidth: 360,
  },
  trackTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  trackArtist: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Seek bar
  seekContainer: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 6,
  },
  seekBar: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2.5,
    overflow: 'visible',
  },
  seekFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2.5,
    position: 'relative',
  },
  seekThumb: {
    position: 'absolute',
    right: -7,
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  // Transport controls
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  transportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  prevNextBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipIcon: {
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: -2,
    marginLeft: 1,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  playPauseIcon: {
    fontSize: 30,
    marginLeft: 3,
    color: colors.bgBase,
  },

  // Secondary actions
  secondaryActions: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIcon: {
    fontSize: 22,
    color: colors.textTertiary,
  },
  heartActive: {
    color: colors.accentPink,
    transform: [{ scale: 1.15 }],
  },

  // Bottom buttons
  bottomBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 360,
  },
  bottomBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  bottomBtnText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  // Lyrics
  lyricsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  lyricsTrackTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  lyricsTrackArtist: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  lyricsScroll: {
    flex: 1,
    width: '100%',
  },
  lyricLine: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 8,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  lyricLineActive: {
    fontFamily: fontFamily.bold,
    color: colors.white,
    fontSize: fontSize.xl + 2,
    fontWeight: fontWeight.bold,
  },
  lyricsPlaceholder: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    marginTop: 40,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Embed
  embedContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  embedTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  embedArtist: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  embedPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  embedPlaceholderIcon: {
    fontSize: 48,
    color: colors.accent,
    marginBottom: 12,
  },
  embedText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  embedSubtext: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 6,
    letterSpacing: 0.2,
  },
});
