import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { borderRadius, fontSize, fontFamily } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface MoodCard {
  label: string;
  emoji: string;
  color: string;
  query: string;
}

const MOODS: MoodCard[] = [
  { label: 'Chill', emoji: '🧊', color: '#1a5276', query: 'chill relaxed lofi' },
  { label: 'Workout', emoji: '💪', color: '#922b21', query: 'workout motivation gym' },
  { label: 'Sad', emoji: '😢', color: '#4a235a', query: 'sad emotional ballad' },
  { label: 'Happy', emoji: '☀️', color: '#7d6608', query: 'happy upbeat feel good' },
  { label: 'Party', emoji: '🎉', color: '#b7410e', query: 'party dance hits' },
  { label: 'Focus', emoji: '🧠', color: '#1b4f32', query: 'focus study instrumental' },
  { label: 'Romance', emoji: '❤️', color: '#943126', query: 'romance love songs' },
  { label: 'Energy', emoji: '⚡', color: '#784212', query: 'energy hype bangers' },
  { label: 'Sleep', emoji: '🌙', color: '#154360', query: 'sleep ambient calm' },
  { label: 'Road Trip', emoji: '🚗', color: '#1e8449', query: 'road trip driving hits' },
];

interface Props {
  onSelect: (query: string) => void;
}

export default function MoodGenreCards({ onSelect }: Props) {
  const colors = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, gap: 10 }}>
      {MOODS.map((mood) => (
        <TouchableOpacity
          key={mood.label}
          style={[s.card, { backgroundColor: mood.color }]}
          activeOpacity={0.75}
          onPress={() => onSelect(mood.query)}
        >
          <Text style={s.emoji}>{mood.emoji}</Text>
          <Text style={s.label}>{mood.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: {
    width: 105,
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: '#ffffff',
    letterSpacing: -0.1,
  },
});
