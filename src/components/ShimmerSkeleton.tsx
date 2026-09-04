import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface Props {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export default function ShimmerSkeleton({ width, height, borderRadius = 8, style }: Props) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(translateX.value, [-1, 1], [-200, 400])
    }],
  }));

  return (
    <View style={[{ width: width as any, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

// Skeleton variants
export function SkeletonCard({ size = 155 }: { size?: number }) {
  return (
    <View style={{ width: size }}>
      <ShimmerSkeleton width={size} height={size} borderRadius={12} />
      <View style={{ marginTop: 8, gap: 4 }}>
        <ShimmerSkeleton width={size * 0.7} height={12} borderRadius={4} />
        <ShimmerSkeleton width={size * 0.5} height={10} borderRadius={4} />
      </View>
    </View>
  );
}

export function SkeletonSongRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <ShimmerSkeleton width={48} height={48} borderRadius={8} />
      <View style={{ flex: 1, gap: 6 }}>
        <ShimmerSkeleton width="70%" height={14} borderRadius={4} />
        <ShimmerSkeleton width="45%" height={11} borderRadius={4} />
      </View>
    </View>
  );
}

export function SkeletonArtist() {
  return (
    <View style={{ alignItems: 'center', width: 76 }}>
      <ShimmerSkeleton width={76} height={76} borderRadius={38} />
      <View style={{ marginTop: 8, alignItems: 'center', gap: 4 }}>
        <ShimmerSkeleton width={50} height={10} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    width: 200,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
