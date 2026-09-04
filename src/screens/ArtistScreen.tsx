import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useTheme } from '../hooks/useTheme';
import * as api from '../services/musicApi';
import { Artist, Track, Album } from '../types';
import { ArrowLeftIcon, PlayIcon } from '../components/Icons';

export default function ArtistScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
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
      try { setLoading(true); const [a, t, al] = await Promise.all([api.getArtist(id), api.getArtistTopTracks(id), api.getArtistAlbums(id)]); setArtist(a); setTracks(t); setAlbums(al);    } catch {
      // Artist not found — handled by null check below
    } finally { setLoading(false); }
    })();
  }, [route.params?.id]);

  if (loading) return <View style={[st.loading, { backgroundColor: colors.bgBase }]}><ActivityIndicator color={colors.accent} /></View>;
  if (!artist) return <View style={[st.loading, { backgroundColor: colors.bgBase }]}><Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>Artist not found</Text></View>;

  const isLiked = isFavoriteArtist(artist.id);

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[st.backBtn, { top: insets.top + 8, backgroundColor: colors.controlBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.white} />
      </TouchableOpacity>

      <View style={{ position: 'relative', height: 300, marginHorizontal: 16, borderRadius: borderRadius.lg, overflow: 'hidden', marginTop: insets.top }}>
        <Image source={{ uri: artist.artwork }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} blurRadius={2} />
        <View style={[st.heroOverlay, { backgroundColor: colors.overlay.replace('0.5', '0.4').replace('0.3', '0.4') }]} />
        <View style={st.heroContent}>
          <View style={[st.artistCircle, { borderColor: 'rgba(255,255,255,0.15)' }]}>
            <Image source={{ uri: artist.artwork }} style={st.artistImage} />
          </View>
          <Text style={{ fontSize: fontSize.xs, fontFamily: fontFamily.bold, letterSpacing: 1, color: colors.textSecondary, textTransform: 'uppercase' }}>Artist</Text>
          <Text style={[st.artistName, { color: colors.white }]}>{artist.name}</Text>
        </View>
      </View>

      <View style={st.actions}>
        <TouchableOpacity style={[st.playBtn, { backgroundColor: colors.accent }]} activeOpacity={0.8}
          onPress={() => tracks.length > 0 && playTrack(tracks[0], tracks, 0)}>
          <PlayIcon size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[st.followBtn, { borderColor: colors.borderMedium }, isLiked && { borderColor: colors.accentPink }]}
          onPress={() => isLiked ? removeFavoriteArtist(artist.id) : addFavoriteArtist(artist)} activeOpacity={0.7}>
          <Text style={[st.followText, { color: colors.textPrimary }, isLiked && { color: colors.accentPink }]}>{isLiked ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Popular</Text>
        {tracks.map((track, i) => (
          <TouchableOpacity key={track.id} style={st.trackRow} activeOpacity={0.7}
            onPress={() => playTrack(track, tracks, i)}>
            <Text style={[st.trackIndex, { color: colors.textMuted }]}>{i + 1}</Text>
            <Image source={{ uri: track.artwork }} style={[st.trackArt, { borderRadius: borderRadius.sm }]} />
            <View style={st.trackInfo}>
              <Text style={[st.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
              <Text style={[st.trackArtist, { color: colors.textTertiary }]} numberOfLines={1}>{track.artist}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {albums.length > 0 && (
        <View style={st.section}>
          <Text style={[st.sectionTitle, { color: colors.textPrimary }]}>Discography</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {albums.map(album => (
              <TouchableOpacity key={album.id} style={st.albumCard} activeOpacity={0.7}
                onPress={() => navigation.navigate('Album', { id: album.id })}>
                <Image source={{ uri: album.artwork }} style={[st.albumArt, { borderRadius: borderRadius.md }]} />
                <Text style={[st.albumTitle, { color: colors.textPrimary }]} numberOfLines={1}>{album.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24 },
  artistCircle: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 3, marginBottom: 12 },
  artistImage: { width: '100%', height: '100%' },
  artistName: { fontSize: fontSize.hero, fontFamily: fontFamily.bold, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: layout.screenPadding, marginVertical: 16 },
  playBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  followBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: borderRadius.full, borderWidth: 1 },
  followText: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
  section: { marginBottom: 24, paddingHorizontal: layout.screenPadding },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, marginBottom: 12 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  trackArt: { width: 44, height: 44 },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  albumCard: { width: 150 },
  albumArt: { width: 150, height: 150, marginBottom: 8 },
  albumTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold },
});
