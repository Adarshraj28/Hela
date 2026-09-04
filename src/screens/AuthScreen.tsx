import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontFamily, layout } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { MusicNoteIcon, UserIcon, ArrowLeftIcon } from '../components/Icons';

type Mode = 'welcome' | 'login' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { signup, login, loginAsGuest } = useAuthStore();

  const [mode, setMode] = useState<Mode>('welcome');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await signup(username.trim(), email.trim().toLowerCase(), password);
    setLoading(false);
    if (!ok) setError('Email already taken');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!ok) setError('Invalid email or password');
  };

  const handleGuest = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={[st.container, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: 40, paddingHorizontal: layout.screenPadding }}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {mode === 'welcome' && (
          <>
            {/* Logo */}
            <View style={st.logoContainer}>
              <View style={[st.logo, { backgroundColor: colors.accent }]}>
                <MusicNoteIcon size={40} color={colors.white} />
              </View>
              <Text style={[st.appName, { color: colors.textPrimary }]}>Hela</Text>
              <Text style={[st.tagline, { color: colors.textSecondary }]}>Your personal music experience</Text>
            </View>

            {/* Welcome text */}
            <View style={st.welcomeSection}>
              <Text style={[st.welcomeTitle, { color: colors.textPrimary }]}>Welcome to Hela</Text>
              <Text style={[st.welcomeDesc, { color: colors.textSecondary }]}>
                Listen to millions of songs, create playlists, and discover new music.
              </Text>
            </View>

            {/* Buttons */}
            <View style={st.buttonGroup}>
              <TouchableOpacity style={[st.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={() => setMode('signup')} activeOpacity={0.8}>
                <Text style={[st.primaryBtnText, { color: colors.white }]}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[st.secondaryBtn, { borderColor: colors.borderMedium }]}
                onPress={() => setMode('login')} activeOpacity={0.8}>
                <Text style={[st.secondaryBtnText, { color: colors.textPrimary }]}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={st.guestBtn} onPress={handleGuest} activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={[st.guestBtnText, { color: colors.textSecondary }]}>Continue as Guest</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode === 'signup' && (
          <>
            <TouchableOpacity style={st.backBtn} onPress={() => { setMode('welcome'); setError(''); }} activeOpacity={0.7}>
              <ArrowLeftIcon size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[st.formTitle, { color: colors.textPrimary }]}>Create Account</Text>
            <Text style={[st.formSubtitle, { color: colors.textSecondary }]}>Join Hela and start listening</Text>

            <View style={st.formGroup}>
              <Text style={[st.label, { color: colors.textSecondary }]}>Username</Text>
              <TextInput style={[st.input, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                value={username} onChangeText={setUsername} placeholder="Your name" placeholderTextColor={colors.textTertiary}
                autoCapitalize="words" returnKeyType="next" />
            </View>

            <View style={st.formGroup}>
              <Text style={[st.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput style={[st.input, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={colors.textTertiary}
                keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            </View>

            <View style={st.formGroup}>
              <Text style={[st.label, { color: colors.textSecondary }]}>Password</Text>
              <TextInput style={[st.input, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                value={password} onChangeText={setPassword} placeholder="At least 4 characters" placeholderTextColor={colors.textTertiary}
                secureTextEntry returnKeyType="done" onSubmitEditing={handleSignup} />
            </View>

            {error ? <Text style={[st.error, { color: colors.accentRed }]}>{error}</Text> : null}

            <TouchableOpacity style={[st.primaryBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
              onPress={handleSignup} activeOpacity={0.8} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.white} /> : (
                <Text style={[st.primaryBtnText, { color: colors.white }]}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={st.switchBtn} onPress={() => { setMode('login'); setError(''); }} activeOpacity={0.7}>
              <Text style={[st.switchText, { color: colors.textSecondary }]}>Already have an account? <Text style={{ color: colors.accent, fontFamily: fontFamily.semibold }}>Log In</Text></Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'login' && (
          <>
            <TouchableOpacity style={st.backBtn} onPress={() => { setMode('welcome'); setError(''); }} activeOpacity={0.7}>
              <ArrowLeftIcon size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[st.formTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
            <Text style={[st.formSubtitle, { color: colors.textSecondary }]}>Log in to your Hela account</Text>

            <View style={st.formGroup}>
              <Text style={[st.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput style={[st.input, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={colors.textTertiary}
                keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            </View>

            <View style={st.formGroup}>
              <Text style={[st.label, { color: colors.textSecondary }]}>Password</Text>
              <TextInput style={[st.input, { backgroundColor: colors.bgSurface, borderColor: colors.borderMedium, color: colors.textPrimary }]}
                value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={colors.textTertiary}
                secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin} />
            </View>

            {error ? <Text style={[st.error, { color: colors.accentRed }]}>{error}</Text> : null}

            <TouchableOpacity style={[st.primaryBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
              onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.white} /> : (
                <Text style={[st.primaryBtnText, { color: colors.white }]}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={st.switchBtn} onPress={() => { setMode('signup'); setError(''); }} activeOpacity={0.7}>
              <Text style={[st.switchText, { color: colors.textSecondary }]}>Don't have an account? <Text style={{ color: colors.accent, fontFamily: fontFamily.semibold }}>Sign Up</Text></Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: fontSize.hero, fontFamily: fontFamily.bold, letterSpacing: -1 },
  tagline: { fontSize: fontSize.md, fontFamily: fontFamily.regular, marginTop: 4 },

  welcomeSection: { marginBottom: 48 },
  welcomeTitle: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5, marginBottom: 8 },
  welcomeDesc: { fontSize: fontSize.md, fontFamily: fontFamily.regular, lineHeight: 22 },

  buttonGroup: { gap: 12 },
  primaryBtn: { height: 52, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: fontSize.base, fontFamily: fontFamily.semibold },
  secondaryBtn: { height: 52, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  secondaryBtnText: { fontSize: fontSize.base, fontFamily: fontFamily.semibold },
  guestBtn: { height: 52, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  guestBtnText: { fontSize: fontSize.md, fontFamily: fontFamily.medium },

  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  formTitle: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, letterSpacing: -0.5, marginBottom: 4 },
  formSubtitle: { fontSize: fontSize.md, fontFamily: fontFamily.regular, marginBottom: 32 },

  formGroup: { marginBottom: 16 },
  label: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, marginBottom: 6 },
  input: { height: 50, borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: 14, fontSize: fontSize.base, fontFamily: fontFamily.regular },

  error: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, marginBottom: 8 },

  switchBtn: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: fontSize.md, fontFamily: fontFamily.regular },
});
