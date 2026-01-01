import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Sparkles, Coins, Gem, Zap } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

export default function AccountSuccessScreen() {
  const router = useRouter();
  const { addCoins, addGems } = useGame();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    addCoins(500);
    addGems(50);

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, addCoins, addGems]);

  const handleContinue = () => {
    router.replace('/avatar-creator');
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Sparkles size={50} color="#a855f7" fill="#a855f7" />
          </View>
        </Animated.View>

        <Text style={styles.title}>Welcome to Pocket Worlds!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully
        </Text>

        <Animated.View style={[styles.bonusContainer, { opacity: fadeAnim }]}>
          <Text style={styles.bonusTitle}>Welcome Bonus</Text>
          
          <View style={styles.bonusGrid}>
            <View style={styles.bonusItem}>
              <View style={styles.bonusIconWrapper}>
                <Coins size={32} color="#f59e0b" />
              </View>
              <Text style={styles.bonusAmount}>500</Text>
              <Text style={styles.bonusLabel}>Coins</Text>
            </View>

            <View style={styles.bonusItem}>
              <View style={styles.bonusIconWrapper}>
                <Gem size={32} color="#14b8a6" />
              </View>
              <Text style={styles.bonusAmount}>50</Text>
              <Text style={styles.bonusLabel}>Gems</Text>
            </View>

            <View style={styles.bonusItem}>
              <View style={styles.bonusIconWrapper}>
                <Zap size={32} color="#10b981" />
              </View>
              <Text style={styles.bonusAmount}>5/5</Text>
              <Text style={styles.bonusLabel}>Energy</Text>
            </View>
          </View>

          <View style={styles.extraBonusCard}>
            <Text style={styles.extraBonusText}>🎩 Starter Hat unlocked!</Text>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#a855f7', '#7c3aed']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Start Your Adventure!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.particles}>
        {[...Array(10)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 3,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  bonusContainer: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  bonusTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  bonusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  bonusItem: {
    alignItems: 'center',
  },
  bonusIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bonusAmount: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 4,
  },
  bonusLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  extraBonusCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  extraBonusText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a855f7',
  },
});
