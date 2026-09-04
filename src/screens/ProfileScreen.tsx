import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { UserIcon, MusicNoteIcon, TrashIcon, ArrowLeftIcon } from '../components/Icons';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { user, updateProfile, logout } = useAuthStore();
  const { favorites, favoriteAlbums, favoriteArtists } = useLibraryStore();
  const { playlists } = usePlaylistStore();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.username || '');
  const [editBio, setEditBio] = useState(user?.bio || '');

  const handleSave = () => {
    updateProfile({ username: editName.trim(), bio: editBio.trim() });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = user ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView style={[st.container, { backgroundColor: colors.bgBase }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100, paddingHorizontal: layout.screenPadding }}
      showsVerticalScrollIndicator={false}>

      {/* Back */}
      <TouchableOpacity style={[st.backBtn, { backgroundColor: colors.controlBg }]}
        onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ArrowLeftIcon size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Avatar */}
      <View style={st.avatarSection}>
        <View style={[st.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[st.avatarText, { color: colors.white }]}>{initials}</Text>
        </View>

        {editing ? (
          <TextInput style={[st.nameInput, { color: colors.textPrimary, borderBottomColor: colors.accent }]}
            value={editName} onChangeText={setEditName} autoFocus returnKeyType="done" />
        ) : (
          <Text style={[st.username, { color: colors.textPrimary }]}>{user?.username || 'Unknown'}</Text>
        )}

        {user?.isGuest ? (
          <Text style={[st.guestBadge, { color: colors.accent, borderColor: colors.accent }]}>Guest Account</Text>
        ) : (
          <Text style={[st.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        )}

        {editing ? (
          <TextInput style={[st.bioInput, { color: colors.textSecondary, borderColor: colors.borderMedium }]}
            value={editBio} onChangeText={setEditBio} placeholder="Write something about yourself..."
            placeholderTextColor={colors.textTertiary} multiline maxLength={150} />
        ) : (
          <Text style={[st.bio, { color: colors.textTertiary }]}>{user?.bio || 'No bio yet'}</Text>
        )}
      </View>

      {/* Edit/Save button */}
      <TouchableOpacity style={[st.editBtn, { backgroundColor: editing ? colors.accent : colors.controlBg }]}
        onPress={() => editing ? handleSave() : setEditing(true)} activeOpacity={0.8}>
        <Text style={[st.editBtnText, { color: editing ? colors.white : colors.textPrimary }]}>
          {editing ? 'Save Profile' : 'Edit Profile'}
        </Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={st.statsRow}>
        <View style={[st.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[st.statValue, { color: colors.textPrimary }]}>{favorites.length}</Text>
          <Text style={[st.statLabel, { color: colors.textTertiary }]}>Liked</Text>
        </View>
        <View style={[st.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[st.statValue, { color: colors.textPrimary }]}>{playlists.length}</Text>
          <Text style={[st.statLabel, { color: colors.textTertiary }]}>Playlists</Text>
        </View>
        <View style={[st.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[st.statValue, { color: colors.textPrimary }]}>{favoriteAlbums.length}</Text>
          <Text style={[st.statLabel, { color: colors.textTertiary }]}>Albums</Text>
        </View>
        <View style={[st.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <Text style={[st.statValue, { color: colors.textPrimary }]}>{favoriteArtists.length}</Text>
          <Text style={[st.statLabel, { color: colors.textTertiary }]}>Artists</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>QUICK ACTIONS</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity style={[st.cardRow, { borderBottomColor: colors.borderSubtle }]}
            onPress={() => navigation.navigate('SettingsTab')} activeOpacity={0.7}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>⚙ Settings</Text>
            <Text style={[st.cardArrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.cardRow, { borderBottomColor: colors.borderSubtle }]}
            onPress={() => navigation.navigate('LibraryTab')} activeOpacity={0.7}>
            <Text style={[st.cardLabel, { color: colors.textPrimary }]}>♫ My Library</Text>
            <Text style={[st.cardArrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.cardRow} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={[st.cardLabel, { color: colors.accentRed }]}>⏻ Logout</Text>
            <Text style={[st.cardArrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account info */}
      <View style={st.section}>
        <Text style={[st.sectionTitle, { color: colors.textTertiary }]}>ACCOUNT</Text>
        <View style={[st.card, { backgroundColor: colors.cardBg, borderColor: colors.borderSubtle }]}>
          <View style={st.cardRow}>
            <Text style={[st.cardLabel, { color: colors.textSecondary }]}>Member since</Text>
            <Text style={[st.cardValue, { color: colors.textTertiary }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
          <View style={[st.cardRow, { borderBottomColor: colors.borderSubtle }]}>
            <Text style={[st.cardLabel, { color: colors.textSecondary }]}>Account type</Text>
            <Text style={[st.cardValue, { color: colors.textTertiary }]}>{user?.isGuest ? 'Guest' : 'Registered'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 36, fontFamily: fontFamily.bold },
  username: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, letterSpacing: -0.3 },
  email: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 4 },
  guestBadge: { fontSize: fontSize.xs, fontFamily: fontFamily.semibold, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full, borderWidth: 1 },
  bio: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 8, textAlign: 'center' },

  nameInput: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, textAlign: 'center', borderBottomWidth: 2, paddingBottom: 4, minWidth: 200 },
  bioInput: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, marginTop: 8, textAlign: 'center', borderWidth: 1, borderRadius: borderRadius.md, padding: 10, minHeight: 60, width: '100%' },

  editBtn: { height: 44, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  editBtnText: { fontSize: fontSize.md, fontFamily: fontFamily.semibold },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: fontSize.xl, fontFamily: fontFamily.bold },
  statLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: fontSize.xs, fontFamily: fontFamily.bold, letterSpacing: 1, marginBottom: 10 },
  card: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  cardLabel: { fontSize: fontSize.md, fontFamily: fontFamily.regular },
  cardValue: { fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  cardArrow: { fontSize: 20, fontFamily: fontFamily.regular },
});
