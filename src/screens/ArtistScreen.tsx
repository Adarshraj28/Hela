import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, fontSize, fontWeight, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import * as api from '../services/musicApi';
import { Artist, Track, Album } from '../types';

export default function ArtistScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { playTrack } = usePlayerStore();
  const { isFavoriteArtist, addFavoriteArtist, removeFavoriteArtist } = useLibraryStore();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = route.params?.id;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [a, t, al] = await Promise.all([api.getArtist(id), api.getArtistTopTracks(id), api.getArtistAlbums(id)]);
        setArtist(a);
        setTracks(t);
        setAlbums(al);
      } catch {} finally { setLoading(false); }
    })();
  }, [route.params?.id]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.accent} /></View>;
  if (!artist) return <View style={styles.loading}><Text style={{ color: colors.textSecondary }}>Artist not found</Text></View>;

  const isLiked = isFavoriteArtist(artist.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={{ position: 'relative', height: 300, marginHorizontal: 16, borderRadius: borderRadius.lg, overflow: 'hidden', marginTop: insets.top }}>
        <Image source={{ uri: artist.artwork }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} blurRadius={2} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.artistCircle}>
            <Image source={{ uri: artist.artwork }} style={styles.artistImage} />
          </View>
          <Text style={styles.artistLabel}>Artist</Text>
          <Text style={styles.artistName}>{artist.name}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}
          onPress={() => tracks.length > 0 && playTrack(tracks[0], tracks, 0)}>
          <Text style={styles.playBtnText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.followBtn, isLiked && { borderColor: colors.accentPink }]}
          onPress={() => isLiked ? removeFavoriteArtist(artist.id) : addFavoriteArtist(artist)}>
          <Text style={[styles.followText, isLiked && { color: colors.accentPink }]}>{isLiked ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      {/* Popular */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular</Text>
        {tracks.map((track, i) => (
          <TouchableOpacity key={track.id} style={styles.trackRow} activeOpacity={0.7}
            onPress={() => playTrack(track, tracks, i)}>
            <Text style={styles.trackIndex}>{i + 1}</Text>
            <Image source={{ uri: track.artwork }} style={styles.trackArt} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Discography */}
      {albums.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discography</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {albums.map(album => (
              <TouchableOpacity key={album.id} style={styles.albumCard} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={styles.albumArt} />
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loading: { flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: colors.white },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24 },
  artistCircle: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  artistImage: { width: '100%', height: '100%' },
  artistLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 1, color: colors.textSecondary, textTransform: 'uppercase' },
  artistName: { fontSize: fontSize.hero, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: layout.screenPadding, marginVertical: 16 },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 20, color: colors.white, marginLeft: 2 },
  followBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderMedium },
  followText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },

  section: { marginBottom: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 },

  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, color: colors.textMuted },
  trackArt: { width: 44, height: 44, borderRadius: borderRadius.sm },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  trackArtist: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },

  albumCard: { width: 150 },
  albumArt: { width: 150, height: 150, borderRadius: borderRadius.md, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
});
