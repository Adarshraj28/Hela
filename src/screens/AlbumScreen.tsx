import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useTheme } from '../hooks/useTheme';
import * as api from '../services/musicApi';
import { Album, Track } from '../types';
import { ArrowLeftIcon, HeartIcon, PlayIcon } from '../components/Icons';

export default function AlbumScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { playTrack } = usePlayerStore();
  const { isFavoriteAlbum, addFavoriteAlbum, removeFavoriteAlbum } = useLibraryStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = route.params?.id;
    if (!id) return;
    (async () => {
      try { setLoading(true); const [a, t] = await Promise.all([api.getAlbum(id), api.getAlbumTracks(id)]); setAlbum(a); setTracks(t); } catch {} finally { setLoading(false); }
    })();
  }, [route.params?.id]);

  if (loading) return <View style={[st.loading, { backgroundColor: colors.bgBase }]}><ActivityIndicator color={colors.accent} /></View>;
  if (!album) return <View style={[st.loading, { backgroundColor: colors.bgBase }]}><Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>Album not found</Text></View>;

  const isLiked = isFavoriteAlbum(album.id);

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[st.backBtn, { top: insets.top + 8, backgroundColor: colors.controlBg }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.white} />
      </TouchableOpacity>

      <View style={{ alignItems: 'center', paddingTop: insets.top + 50, paddingHorizontal: layout.screenPadding }}>
        <Image source={{ uri: album.artwork }} style={[st.artwork, { borderRadius: borderRadius.lg }]} />
      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: layout.screenPadding, marginTop: 20, marginBottom: 16 }}>
        <Text style={[st.albumTitle, { color: colors.textPrimary }]}>{album.title}</Text>
        <Text style={[st.albumArtist, { color: colors.textSecondary }]}>{album.artist} · {tracks.length} songs</Text>
      </View>
      <View style={st.actions}>
        <TouchableOpacity style={[st.playBtn, { backgroundColor: colors.accent }]} activeOpacity={0.8}
          onPress={() => tracks.length > 0 && playTrack(tracks[0], tracks, 0)}>
          <PlayIcon size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => isLiked ? removeFavoriteAlbum(album.id) : addFavoriteAlbum(album)} activeOpacity={0.7}>
          <HeartIcon size={28} color={isLiked ? colors.accentPink : colors.textTertiary} filled={isLiked} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: layout.screenPadding, marginTop: 8 }}>
        {tracks.map((track, i) => (
          <TouchableOpacity key={track.id} style={[st.trackRow, { borderBottomColor: colors.borderSubtle }]} activeOpacity={0.7}
            onPress={() => playTrack(track, tracks, i)}>
            <Text style={[st.trackIndex, { color: colors.textMuted }]}>{i + 1}</Text>
            <View style={st.trackInfo}>
              <Text style={[st.trackTitle, { color: colors.textPrimary }]} numberOfLines={1}>{track.title}</Text>
              <Text style={[st.trackArtist, { color: colors.textTertiary }]} numberOfLines={1}>{track.artist}</Text>
            </View>
            {track.duration ? <Text style={[st.trackDuration, { color: colors.textMuted }]}>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 280, height: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.5, shadowRadius: 32 },
  albumTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, textAlign: 'center', letterSpacing: -0.3 },
  albumArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4, textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 },
  playBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1 },
  trackIndex: { width: 20, textAlign: 'center', fontSize: fontSize.sm, fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium },
  trackArtist: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 2 },
  trackDuration: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, fontVariant: ['tabular-nums'] },
});
