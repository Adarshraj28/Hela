import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 60, 340);

export default function FullPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack, isPlaying, progress, duration, shuffle, repeat,
    showFullPlayer, toggleFullPlayer, togglePlay, next, previous, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite, addToRecentlyPlayed } = useLibraryStore();

  const [view, setView] = useState<'highlight' | 'lyrics' | 'embed'>('highlight');
  const [imgLoaded, setImgLoaded] = useState(false);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  useEffect(() => {
    setImgLoaded(false);
    setView('highlight');
  }, [currentTrack?.id]);

  useEffect(() => {
    if (currentTrack && isPlaying) addToRecentlyPlayed(currentTrack);
  }, [currentTrack?.id]);

  if (!showFullPlayer || !currentTrack) return null;

  const handleSeek = (evt: any) => {
    // Simple seek based on tap position
    const x = evt.nativeEvent.locationX;
    const barWidth = SCREEN_WIDTH - 48;
    const pct = Math.max(0, Math.min(1, x / barWidth));
    seek(pct * duration);
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
        {/* Ambient background */}
        <View style={styles.ambientBg} />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.topBtn} onPress={toggleFullPlayer}>
            <Text style={styles.chevronDown}>⌄</Text>
          </TouchableOpacity>

          <View style={styles.tabBar}>
            {(['highlight', 'lyrics', 'embed'] as const).map(v => (
              <TouchableOpacity key={v} style={[styles.tab, view === v && styles.tabActive]}
                onPress={() => setView(v)}>
                <Text style={[styles.tabText, view === v && styles.tabTextActive]}>
                  {v === 'highlight' ? 'Highlight' : v === 'lyrics' ? 'Lyrics' : 'Video'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.topBtn}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {view === 'highlight' && (
            <>
              {/* Artwork */}
              <View style={styles.artworkContainer}>
                <Image source={{ uri: currentTrack.artwork }}
                  style={[styles.artwork, isPlaying && styles.artworkBreathing]}
                  onLoad={() => setImgLoaded(true)} />
              </View>

              {/* Track info */}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
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
                  <Text style={styles.timeText}>-{formatTime(Math.max(0, duration - progress))}</Text>
                </View>
              </View>

              {/* Transport controls */}
              <View style={styles.transport}>
                <TouchableOpacity style={styles.transportBtn} onPress={toggleShuffle}>
                  <Text style={[styles.transportIcon, shuffle && { color: colors.accent }]}>⇌</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportBtn} onPress={previous}>
                  <Text style={styles.transportIconLarge}>⏮</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay}
                  activeOpacity={0.8}>
                  <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportBtn} onPress={next}>
                  <Text style={styles.transportIconLarge}>⏭</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportBtn} onPress={cycleRepeat}>
                  <Text style={[styles.transportIcon, repeat !== 'off' && { color: colors.accent }]}>
                    {repeat === 'one' ? '↻¹' : '↻'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Secondary actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity onPress={() => isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack)}>
                  <Text style={[styles.secondaryIcon, isLiked && { color: colors.accentPink, transform: [{ scale: 1.1 }] }]}>♥</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.secondaryIcon}>⚙</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.secondaryIcon}>☰</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom buttons */}
              <View style={styles.bottomBtns}>
                <TouchableOpacity style={styles.bottomBtn}>
                  <Text style={styles.bottomBtnText}>⚙ Equalizer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomBtn}>
                  <Text style={styles.bottomBtnText}>☰ Queue List</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {view === 'lyrics' && (
            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricsTitle}>{currentTrack.title}</Text>
              <Text style={styles.lyricsArtist}>{currentTrack.artist}</Text>
              <Text style={styles.lyricsPlaceholder}>No lyrics available</Text>
            </View>
          )}

          {view === 'embed' && (
            <View style={styles.embedContainer}>
              <Text style={styles.embedTitle}>{currentTrack.title}</Text>
              <Text style={styles.embedArtist}>{currentTrack.artist}</Text>
              <View style={styles.embedPlaceholder}>
                <Text style={styles.embedText}>Apple Music Embed</Text>
                <Text style={styles.embedSubtext}>Full song playback</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  ambientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    fontSize: 24,
    color: colors.textSecondary,
  },
  moreIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
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
  },

  // Artwork
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 48,
    elevation: 16,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkBreathing: {
    // Subtle animation would go here with Animated API
  },

  // Track info
  trackInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 360,
  },
  trackTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Seek bar
  seekContainer: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 8,
  },
  seekBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'visible',
  },
  seekFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
    position: 'relative',
  },
  seekThumb: {
    position: 'absolute',
    right: -6,
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },

  // Transport
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  transportBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  transportIconLarge: {
    fontSize: 28,
    color: colors.textSecondary,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  playPauseIcon: {
    fontSize: 28,
    marginLeft: 3,
  },

  // Secondary
  secondaryActions: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 20,
  },
  secondaryIcon: {
    fontSize: 24,
    color: colors.textTertiary,
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
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  bottomBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },

  // Lyrics
  lyricsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  lyricsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  lyricsArtist: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  lyricsPlaceholder: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  // Embed
  embedContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  embedTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: 4,
  },
  embedArtist: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  embedPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  embedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  embedSubtext: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
