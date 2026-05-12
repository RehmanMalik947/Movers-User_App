import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  Easing,
} from 'react-native';

const C = {
  primary: '#1847B1',
  white: '#FFFFFF',
  textHead: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.7)',
};

const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.loaderWrapper}>
        <SimplePulse delay={0} size={120} />
        <SimplePulse delay={500} size={80} />
        <View style={styles.centerDot} />
      </View>

      
      
    </Animated.View>
  );
};

const SimplePulse = ({ delay, size }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scale, {
            toValue: 2.2,
            duration: 1800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pulseCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseCircle: {
    position: 'absolute',
    backgroundColor: '#1847B1',
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '500',
  },
});

export default LoadingOverlay;