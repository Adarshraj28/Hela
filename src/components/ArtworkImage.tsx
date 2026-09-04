import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, View } from 'react-native';
import { MusicNoteIcon } from './Icons';

interface Props {
  uri?: string;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
  iconColor?: string;
}

export default function ArtworkImage({ uri, size = 48, borderRadius = 8, style, iconColor = '#8b5cf6' }: Props) {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
      }, style]}>
        <MusicNoteIcon size={size * 0.4} color={iconColor} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius }, style]}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}
