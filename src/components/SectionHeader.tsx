import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fontSize, fontFamily, layout } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, subtitle, onSeeAll }: Props) {
  const colors = useTheme();
  return (
    <View style={s.container}>
      <View style={s.left}>
        <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[s.subtitle, { color: colors.textTertiary }]}>{subtitle}</Text> : null}
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.6}>
          <Text style={[s.seeAll, { color: colors.textSecondary }]}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPadding,
    marginBottom: 14,
  },
  left: { flex: 1 },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.2,
  },
});
