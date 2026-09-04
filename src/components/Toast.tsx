import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { borderRadius, fontSize, fontFamily } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { XIcon } from '../components/Icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useTheme();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map());

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const anim = new Animated.Value(0);
    animatedValues.current.set(id, anim);

    setToasts(prev => [...prev, { id, message, type }]);

    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 15 }),
      Animated.delay(3000),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      animatedValues.current.delete(id);
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    const anim = animatedValues.current.get(id);
    if (anim) {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        animatedValues.current.delete(id);
      });
    }
  }, []);

  const getBg = (type: ToastType) => {
    switch (type) {
      case 'success': return 'rgba(30, 215, 96, 0.9)';
      case 'error': return 'rgba(239, 68, 68, 0.9)';
      case 'info': return colors.glassBg;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={s.container} pointerEvents="box-none">
        {toasts.map(toast => {
          const anim = animatedValues.current.get(toast.id);
          if (!anim) return null;
          return (
            <Animated.View
              key={toast.id}
              style={[s.toast, {
                backgroundColor: getBg(toast.type),
                borderColor: toast.type === 'success' ? 'rgba(30,215,96,0.3)' : toast.type === 'error' ? 'rgba(239,68,68,0.3)' : colors.glassBorder,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }), opacity: anim }],
              }]}
            >
              <Text style={[s.message, { color: toast.type === 'info' ? colors.textPrimary : '#ffffff' }]} numberOfLines={2}>
                {toast.message}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    width: SCREEN_WIDTH - 40,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 8,
  },
  message: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.1,
  },
});
