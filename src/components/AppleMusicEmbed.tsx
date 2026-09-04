import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { borderRadius, fontFamily, fontSize } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { MusicNoteIcon } from './Icons';

interface Props {
  embedUrl: string;
  artwork?: string;
  trackTitle?: string;
  artistName?: string;
}

export default function AppleMusicEmbed({ embedUrl, artwork, trackTitle, artistName }: Props) {
  const colors = useTheme();

  const handleOpen = () => {
    if (embedUrl) {
      Linking.openURL(embedUrl).catch(() => {});
    }
  };

  return (
    <View style={s.container}>
      {/* Artwork */}
      {artwork ? (
        <Image source={{ uri: artwork }} style={[s.artwork, { borderRadius: borderRadius.xl }]} />
      ) : (
        <View style={[s.artworkPlaceholder, { backgroundColor: colors.bgSurface, borderRadius: borderRadius.xl }]}>
          <MusicNoteIcon size={48} color={colors.accent} />
        </View>
      )}

      {/* Track info */}
      <Text style={[s.title, { color: colors.textPrimary }]} numberOfLines={1}>{trackTitle || 'Unknown Track'}</Text>
      <Text style={[s.artist, { color: colors.textSecondary }]} numberOfLines={1}>{artistName || 'Unknown Artist'}</Text>

      {/* Open in Apple Music button */}
      {embedUrl ? (
        <TouchableOpacity style={[s.openBtn, { backgroundColor: colors.accent }]} onPress={handleOpen} activeOpacity={0.8}>
          <Text style={[s.openBtnText, { color: colors.white }]}>Open in Apple Music</Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.openBtn, { backgroundColor: colors.controlBg, opacity: 0.5 }]}>
          <Text style={[s.openBtnText, { color: colors.textTertiary }]}>Not Available</Text>
        </View>
      )}

      <Text style={[s.hint, { color: colors.textTertiary }]}>
        Full song playback via Apple Music
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  artwork: {
    width: 220,
    height: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  artworkPlaceholder: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  artist: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  openBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    marginTop: 8,
  },
  openBtnText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
});
