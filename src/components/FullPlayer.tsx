import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Pressable, Dimensions, Modal, Animated, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getTrackLyrics, LyricLine } from '../services/musicApi';
import { useTheme } from '../hooks/useTheme';
import {
  ChevronDownIcon, MoreHorizontalIcon, HeartIcon, ShareIcon,
  PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon,
  ShuffleIcon, RepeatIcon, RepeatOneIcon, QueueIcon,
  MusicNoteIcon, LyricsIcon,
} from './Icons';
import AppleMusicEmbed from './AppleMusicEmbed';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.38);

export default function FullPlayer() {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const {
    currentTrack, isPlaying, progress, duration, shuffle, repeat,
    showFullPlayer, toggleFullPlayer, togglePlay, next, previous, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite, addToRecentlyPlayed } = useLibraryStore();

  const [view, setView] = useState<'highlight' | 'lyrics' | 'fullSong'>('highlight');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const prevTrackId = useRef<string | undefined>(undefined);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [ambientColor, setAmbientColor] = useState('rgba(139, 92, 246, 0.08)');

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  useEffect(() => {
    if (prevTrackId.current && prevTrackId.current !== currentTrack?.id) {
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

    const hues = [
      'rgba(139, 92, 246, 0.08)',
      'rgba(236, 72, 153, 0.06)',
      'rgba(59, 130, 246, 0.06)',
      'rgba(34, 197, 94, 0.05)',
      'rgba(249, 115, 22, 0.05)',
    ];
    const idx = currentTrack ? Math.abs(hashCode(currentTrack.id)) % hues.length : 0;
    setAmbientColor(hues[idx]);
  }, [currentTrack?.id]);

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

  const formatTime = (sec: number) => {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={showFullPlayer} animationType="slide" presentationStyle="fullScreen" onRequestClose={toggleFullPlayer}>
      <View style={[st.container, { backgroundColor: colors.bgBase }]}>
        {/* Ambient background */}
        <Animated.View style={[st.ambientBg, { opacity: fadeAnim }]}>
          <Image source={{ uri: currentTrack.artwork }} style={st.ambientImage} blurRadius={60} />
          <View style={[st.ambientOverlay, { backgroundColor: colors.overlay.replace('0.5', '0.75').replace('0.3', '0.75') }]} />
        </Animated.View>

        {/* Top bar */}
        <View style={[st.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={[st.topBtn, { backgroundColor: colors.controlBg }]} onPress={toggleFullPlayer} activeOpacity={0.7}>
            <ChevronDownIcon size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[st.tabBar, { backgroundColor: colors.controlBg }]}>
            {(['highlight', 'lyrics', 'fullSong'] as const).map(v => (
              <TouchableOpacity key={v} style={[st.tab, view === v && { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                onPress={() => setView(v)} activeOpacity={0.7}>
                <Text style={[st.tabText, { color: view === v ? colors.textPrimary : colors.textTertiary }]}>
                  {v === 'highlight' ? 'Highlight' : v === 'lyrics' ? 'Lyrics' : 'Full Song'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[st.topBtn, { backgroundColor: colors.controlBg }]} activeOpacity={0.7}>
            <MoreHorizontalIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={st.content}>
          {view === 'highlight' && (
            <>
              <View style={st.artworkGlowContainer}>
                <View style={[st.artworkGlow, { backgroundColor: ambientColor.replace('0.08', '0.3').replace('0.06', '0.25').replace('0.05', '0.2') }]} />
                <Animated.View style={[st.artworkContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                  <Image source={{ uri: currentTrack.artwork }} style={st.artwork} />
                </Animated.View>
              </View>

              <View style={st.trackInfo}>
                <Text style={[st.trackTitle, { color: colors.white }]} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={[st.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>

              {/* Seek */}
              <View style={st.seekContainer}>
                <Pressable style={[st.seekBar, { backgroundColor: colors.seekBar }]} onPress={handleSeek}>
                  <View style={[st.seekFill, { width: `${pct}%`, backgroundColor: colors.white }]}>
                    <View style={[st.seekThumb, { backgroundColor: colors.white }]} />
                  </View>
                </Pressable>
                <View style={st.timeRow}>
                  <Text style={[st.timeText, { color: colors.textTertiary }]}>{formatTime(progress)}</Text>
                  <Text style={[st.timeText, { color: colors.textTertiary }]}>{formatTime(Math.max(0, duration - progress))}</Text>
                </View>
              </View>

              {/* Transport */}
              <View style={st.transport}>
                <TouchableOpacity style={st.transportBtn} onPress={toggleShuffle} activeOpacity={0.7}>
                  <ShuffleIcon size={22} color={shuffle ? colors.accent : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={st.transportBtn} onPress={previous} activeOpacity={0.7}>
                  <View style={[st.prevNextBtn, { backgroundColor: colors.controlBg }]}>
                    <SkipBackIcon size={20} color={colors.textPrimary} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[st.playPauseBtn, { backgroundColor: colors.white }]} onPress={togglePlay} activeOpacity={0.8}>
                  {isPlaying ? <PauseIcon size={30} color={colors.bgBase} /> : <PlayIcon size={30} color={colors.bgBase} />}
                </TouchableOpacity>
                <TouchableOpacity style={st.transportBtn} onPress={next} activeOpacity={0.7}>
                  <View style={[st.prevNextBtn, { backgroundColor: colors.controlBg }]}>
                    <SkipForwardIcon size={20} color={colors.textPrimary} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={st.transportBtn} onPress={cycleRepeat} activeOpacity={0.7}>
                  {repeat === 'one'
                    ? <RepeatOneIcon size={22} color={colors.accent} />
                    : <RepeatIcon size={22} color={repeat === 'all' ? colors.accent : colors.textSecondary} />
                  }
                </TouchableOpacity>
              </View>

              {/* Secondary */}
              <View style={st.secondaryActions}>
                <TouchableOpacity style={st.secondaryBtn}
                  onPress={() => isLiked ? removeFavorite(currentTrack.id) : addFavorite(currentTrack)} activeOpacity={0.7}>
                  <HeartIcon size={22} color={isLiked ? colors.accentPink : colors.textTertiary} filled={isLiked} />
                </TouchableOpacity>
                <TouchableOpacity style={st.secondaryBtn} activeOpacity={0.7}>
                  <ShareIcon size={22} color={colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity style={st.secondaryBtn} activeOpacity={0.7}>
                  <QueueIcon size={22} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Bottom buttons */}
              <View style={st.bottomBtns}>
                <TouchableOpacity style={[st.bottomBtn, { backgroundColor: colors.controlBg, borderColor: colors.borderMedium }]} activeOpacity={0.7}>
                  <MusicNoteIcon size={16} color={colors.textSecondary} />
                  <Text style={[st.bottomBtnText, { color: colors.textSecondary }]}>Equalizer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.bottomBtn, { backgroundColor: colors.controlBg, borderColor: colors.borderMedium }]} activeOpacity={0.7}>
                  <QueueIcon size={16} color={colors.textSecondary} />
                  <Text style={[st.bottomBtnText, { color: colors.textSecondary }]}>Queue List</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {view === 'lyrics' && (
            <View style={st.lyricsContainer}>
              <Text style={[st.lyricsTrackTitle, { color: colors.textPrimary }]}>{currentTrack.title}</Text>
              <Text style={[st.lyricsTrackArtist, { color: colors.textSecondary }]}>{currentTrack.artist}</Text>
              {lyricsLoading ? (
                <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 40 }} />
              ) : lyrics.length > 0 ? (
                <ScrollView style={st.lyricsScroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                  {lyrics.map((line, i) => {
                    const lineStart = line.startTimeMs / 1000;
                    const lineEnd = i < lyrics.length - 1 ? lyrics[i + 1].startTimeMs / 1000 : duration;
                    const isActive = progress >= lineStart && progress < lineEnd;
                    return (
                      <Text key={i} style={[st.lyricLine, { color: isActive ? colors.white : colors.textTertiary }, isActive && st.lyricLineActive]}>
                        {line.words}
                      </Text>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={st.noLyricsContainer}>
                  <LyricsIcon size={48} color={colors.textMuted} />
                  <Text style={[st.lyricsPlaceholder, { color: colors.textTertiary }]}>No lyrics available for this track</Text>
                </View>
              )}
            </View>
          )}

          {view === 'fullSong' && (
            <View style={st.embedContainer}>
              <AppleMusicEmbed
                embedUrl={currentTrack.appleMusicEmbedUrl || ''}
                artwork={currentTrack.artwork}
                trackTitle={currentTrack.title}
                artistName={currentTrack.artist}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const st = StyleSheet.create({
  container: { flex: 1 },
  ambientBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ambientImage: { width: '100%', height: '100%', transform: [{ scale: 1.5 }] },
  ambientOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8, zIndex: 10 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', borderRadius: borderRadius.full, padding: 3 },
  tab: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: borderRadius.full },
  tabText: { fontFamily: fontFamily.semibold, fontSize: fontSize.sm, letterSpacing: 0.3 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, zIndex: 10 },

  artworkGlowContainer: { width: ARTWORK_SIZE + 40, height: ARTWORK_SIZE + 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  artworkGlow: { position: 'absolute', width: ARTWORK_SIZE + 40, height: ARTWORK_SIZE + 40, borderRadius: (ARTWORK_SIZE + 40) / 2, opacity: 0.6 },
  artworkContainer: { width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: borderRadius.xl, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 32 }, shadowOpacity: 0.7, shadowRadius: 48, elevation: 20 },
  artwork: { width: '100%', height: '100%' },

  trackInfo: { alignItems: 'center', marginBottom: 16, width: '100%', maxWidth: 360 },
  trackTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.xl, letterSpacing: -0.4, textAlign: 'center' },
  trackArtist: { fontFamily: fontFamily.medium, fontSize: fontSize.md, marginTop: 6, textAlign: 'center', letterSpacing: 0.2 },

  seekContainer: { width: '100%', maxWidth: 360, marginBottom: 6 },
  seekBar: { height: 5, borderRadius: 2.5, overflow: 'visible' },
  seekFill: { height: '100%', borderRadius: 2.5, position: 'relative' },
  seekThumb: { position: 'absolute', right: -7, top: -5, width: 14, height: 14, borderRadius: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, fontVariant: ['tabular-nums'], letterSpacing: 0.5 },

  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
  transportBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  prevNextBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  playPauseBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },

  secondaryActions: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  secondaryBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  bottomBtns: { flexDirection: 'row', gap: 12, width: '100%', maxWidth: 360 },
  bottomBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: borderRadius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  bottomBtnText: { fontFamily: fontFamily.semibold, fontSize: fontSize.sm, letterSpacing: 0.3 },

  lyricsContainer: { flex: 1, alignItems: 'center', paddingTop: 20, width: '100%' },
  lyricsTrackTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.lg, marginBottom: 4, letterSpacing: -0.3 },
  lyricsTrackArtist: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, marginBottom: 32, letterSpacing: 0.2 },
  lyricsScroll: { flex: 1, width: '100%' },
  lyricLine: { fontFamily: fontFamily.semibold, fontSize: fontSize.xl, textAlign: 'center', paddingVertical: 8, letterSpacing: -0.3, lineHeight: 34 },
  lyricLineActive: { fontFamily: fontFamily.bold, fontSize: fontSize.xl + 2 },
  noLyricsContainer: { alignItems: 'center', paddingTop: 40, gap: 16 },
  lyricsPlaceholder: { fontSize: fontSize.md, textAlign: 'center', letterSpacing: 0.2 },

  embedContainer: { flex: 1, width: '100%' },
});
