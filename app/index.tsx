import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading: gameLoading, hasSeenAvatarCreator } = useGame();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, rotateAnim]);

  useEffect(() => {
    if (!gameLoading && !authLoading) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.replace('/auth/welcome');
        } else if (!hasSeenAvatarCreator) {
          router.replace('/avatar-creator');
        } else {
          router.replace('/home');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameLoading, authLoading, isAuthenticated, hasSeenAvatarCreator, router]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          },
        ]}
      >
        <View style={styles.cube}>
          <View style={[styles.cubeFace, styles.front]} />
          <View style={[styles.cubeFace, styles.back]} />
          <View style={[styles.cubeFace, styles.left]} />
          <View style={[styles.cubeFace, styles.right]} />
          <View style={[styles.cubeFace, styles.top]} />
          <View style={[styles.cubeFace, styles.bottom]} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: scaleAnim }]}>
        Pocket Worlds
      </Animated.Text>

      <Animated.View style={[styles.loadingBar, { opacity: scaleAnim }]}>
        <View style={styles.loadingFill} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  cube: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  cubeFace: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  front: {
    backgroundColor: '#7c3aed',
  },
  back: {
    backgroundColor: '#6d28d9',
  },
  left: {
    backgroundColor: '#14b8a6',
    width: 30,
    left: -15,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  right: {
    backgroundColor: '#0d9488',
    width: 30,
    right: -15,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  top: {
    backgroundColor: '#a855f7',
    height: 30,
    top: -15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bottom: {
    backgroundColor: '#9333ea',
    height: 30,
    bottom: -15,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 60,
    textShadowColor: '#a855f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  loadingBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 3,
  },
});
