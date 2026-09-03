import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import * as api from '../services/musicApi';
import { Album, Track } from '../types';

export default function AlbumScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { playTrack } = usePlayerStore();
  const { isFavoriteAlbum, addFavoriteAlbum, removeFavoriteAlbum } = useLibraryStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = route.params?.id;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [a, t] = await Promise.all([api.getAlbum(id), api.getAlbumTracks(id)]);
        setAlbum(a);
        setTracks(t);
      } catch {} finally { setLoading(false); }
    })();
  }, [route.params?.id]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.accent} /></View>;
  if (!album) return <View style={styles.loading}><Text style={{ color: colors.textSecondary }}>Album not found</Text></View>;

  const isLiked = isFavoriteAlbum(album.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      {/* Back */}
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Artwork */}
      <View style={{ alignItems: 'center', paddingTop: insets.top + 50, paddingHorizontal: layout.screenPadding }}>
        <Image source={{ uri: album.artwork }} style={styles.artwork} />
      </View>

      {/* Info */}
      <View style={{ alignItems: 'center', paddingHorizontal: layout.screenPadding, marginTop: 20, marginBottom: 16 }}>
        <Text style={styles.albumTitle}>{album.title}</Text>
        <Text style={styles.albumArtist}>{album.artist} · {tracks.length} songs</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}
          onPress={() => tracks.length > 0 && playTrack(tracks[0], tracks, 0)}>
          <Text style={styles.playBtnText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => isLiked ? removeFavoriteAlbum(album.id) : addFavoriteAlbum(album)}>
          <Text style={[styles.heartBtn, isLiked && { color: colors.accentPink }]}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Tracklist */}
      <View style={{ paddingHorizontal: layout.screenPadding, marginTop: 8 }}>
        {tracks.map((track, i) => (
          <TouchableOpacity key={track.id} style={styles.trackRow} activeOpacity={0.7}
            onPress={() => playTrack(track, tracks, i)}>
            <Text style={styles.trackIndex}>{i + 1}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
            </View>
            {track.duration ? <Text style={styles.trackDuration}>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loading: { flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: colors.white },
  artwork: { width: 280, height: 280, borderRadius: borderRadius.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.5, shadowRadius: 32 },
  albumTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  albumArtist: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 20, color: colors.white, marginLeft: 2 },
  heartBtn: { fontSize: 28, color: colors.textTertiary },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  trackArtist: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },
  trackDuration: { fontSize: fontSize.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
});
