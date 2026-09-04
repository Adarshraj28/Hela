import { useRef, useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

// ── Press Scale Hook ──
// Adds a satisfying scale-down effect on press
export function usePressScale(scale = 0.95) {
  const sv = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
  }));

  const onPressIn = useCallback(() => {
    sv.value = withSpring(scale, { damping: 15, stiffness: 400 });
  }, [scale]);

  const onPressOut = useCallback(() => {
    sv.value = withSpring(1, { damping: 10, stiffness: 300 });
  }, []);

  return { animatedStyle, onPressIn, onPressOut };
}

// ── Fade In Hook ──
// Fades + slides in from below
export function useFadeIn(delay = 0) {
  const sv = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: sv.value,
    transform: [{ translateY: interpolate(sv.value, [0, 1], [20, 0]) }],
  }));

  const start = useCallback(() => {
    sv.value = withDelay(delay, withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    }));
  }, [delay]);

  return { animatedStyle, start };
}

// ── Heart Bounce Hook ──
// Heart scales up with bounce when liked
export function useHeartBounce() {
  const sv = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
  }));

  const trigger = useCallback(() => {
    sv.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(0.9, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  }, []);

  return { animatedStyle, trigger };
}

// ── Breathing / Floating Hook ──
// Gentle scale oscillation for playing indicator
export function useBreathing() {
  const sv = useSharedValue(1);
  const isAnimating = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
  }));

  const start = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    sv.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false
    );
  }, []);

  const stop = useCallback(() => {
    isAnimating.current = false;
    cancelAnimation(sv);
    sv.value = withSpring(1, { damping: 15 });
  }, []);

  return { animatedStyle, start, stop };
}

// ── Pulse Hook ──
// Repeating pulse (for notification dot, live indicator, etc.)
export function usePulse() {
  const sv = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
    opacity: interpolate(sv.value, [1, 1.5], [1, 0.3]),
  }));

  const start = useCallback(() => {
    sv.value = withRepeat(
      withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const stop = useCallback(() => {
    cancelAnimation(sv);
    sv.value = 1;
  }, []);

  return { animatedStyle, start, stop };
}

// ── Slide In Hook ──
// Slides in from a direction
export function useSlideIn(direction: 'left' | 'right' | 'up' | 'down' = 'up', delay = 0) {
  const sv = useSharedValue(0);

  const getTransform = () => {
    switch (direction) {
      case 'left': return [{ translateX: interpolate(sv.value, [0, 1], [-100, 0]) }];
      case 'right': return [{ translateX: interpolate(sv.value, [0, 1], [100, 0]) }];
      case 'up': return [{ translateY: interpolate(sv.value, [0, 1], [60, 0]) }];
      case 'down': return [{ translateY: interpolate(sv.value, [0, 1], [-60, 0]) }];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: sv.value,
    transform: getTransform(),
  }));

  const start = useCallback(() => {
    sv.value = withDelay(delay, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [delay]);

  return { animatedStyle, start };
}

// ── Rotate Hook ──
// Continuous rotation (for vinyl/loading)
export function useRotate() {
  const sv = useSharedValue(0);
  const isAnimating = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sv.value}deg` }],
  }));

  const start = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    sv.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const stop = useCallback(() => {
    isAnimating.current = false;
    cancelAnimation(sv);
  }, []);

  return { animatedStyle, start, stop };
}

// ── Number Count Hook ──
// Animates a number from 0 to target
export function useNumberCount(target: number, duration = 1000, delay = 0) {
  const sv = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    // The actual number is read via sv
  }));

  const start = useCallback(() => {
    sv.value = withDelay(delay, withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    }));
  }, [target, duration, delay]);

  return { animatedStyle, start, sv };
}

// ── Wrapper Components ──

// AnimatedPressable: scales down on press
export function AnimatedPressable({
  children,
  style,
  onPress,
  scale = 0.96,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  scale?: number;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(scale);

  return (      <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// AnimatedFadeIn: fades in children when they mount
export function AnimatedFadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const { animatedStyle, start } = useFadeIn(delay);

  // Auto-start on mount
  const hasStarted = useRef(false);
  if (!hasStarted.current) {
    hasStarted.current = true;
    setTimeout(start, 50);
  }

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
