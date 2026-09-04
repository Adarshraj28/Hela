import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { HeartIcon } from './Icons';

interface Props {
  liked: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  onPress: () => void;
}

export default function AnimatedHeart({
  liked,
  size = 24,
  activeColor = '#ec4899',
  inactiveColor = '#50506a',
  onPress,
}: Props) {
  const scale = useSharedValue(1);
  const particleScale = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    if (liked) {
      // Heart bounce
      scale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 400 }),
        withSpring(0.85, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      // Particle burst
      particleScale.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) })
      );
      particleOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
    }
  }, [liked]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: particleScale.value }],
    opacity: particleOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      {/* Particle burst ring */}
      <Animated.View style={[styles.particleRing, particleStyle, { borderColor: activeColor }]} />

      {/* Heart */}
      <Animated.View style={heartStyle}>
        <HeartIcon
          size={size}
          color={liked ? activeColor : inactiveColor}
          filled={liked}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
});
