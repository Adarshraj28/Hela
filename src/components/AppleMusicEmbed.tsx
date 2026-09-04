import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { borderRadius, fontFamily, fontSize } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { MusicNoteIcon } from './Icons';

interface Props {
  embedUrl: string;
  trackTitle?: string;
  artistName?: string;
}

function getEmbedHTML(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }
        .container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        iframe { width: 100%; height: 100%; border: none; border-radius: 12px; overflow: hidden; }
      </style>
    </head>
    <body>
      <div class="container">
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameborder="0"
          height="450"
          style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;background:transparent;"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="${url}"
        ></iframe>
      </div>
    </body>
    </html>
  `;
}

export default function AppleMusicEmbed({ embedUrl, trackTitle, artistName }: Props) {
  const colors = useTheme();

  if (!embedUrl) {
    return (
      <View style={s.fallback}>
        <MusicNoteIcon size={48} color={colors.textMuted} />
        <Text style={[s.fallbackTitle, { color: colors.textPrimary }]}>Full song unavailable</Text>
        <Text style={[s.fallbackDesc, { color: colors.textSecondary }]}>
          {trackTitle ? `${trackTitle} by ${artistName || ''}` : 'This track is not available for streaming'}
        </Text>
        <Text style={[s.fallbackHint, { color: colors.textTertiary }]}>
          Open in Apple Music to listen to the full track
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <WebView
        source={{ html: getEmbedHTML(embedUrl) }}
        style={s.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[s.loadingContainer, { backgroundColor: colors.bgPrimary + 'e6' }]}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={[s.loadingText, { color: colors.textSecondary }]}>Loading Apple Music...</Text>
          </View>
        )}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        bounces={false}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  webview: { flex: 1, width: '100%', backgroundColor: 'transparent' },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontFamily: fontFamily.medium, fontSize: fontSize.sm },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  fallbackTitle: { fontFamily: fontFamily.semibold, fontSize: fontSize.lg },
  fallbackDesc: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, textAlign: 'center' },
  fallbackHint: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, textAlign: 'center', marginTop: 8 },
});
