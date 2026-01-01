import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { LogIn, UserPlus, Users } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.cube}>
            <View style={[styles.cubeFace, styles.front]} />
            <View style={[styles.cubeFace, styles.left]} />
            <View style={[styles.cubeFace, styles.top]} />
          </View>
        </View>

        <Text style={styles.title}>Pocket Worlds</Text>
        <Text style={styles.subtitle}>Jump in and start your adventure!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#a855f7', '#7c3aed']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <UserPlus size={24} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <LogIn size={22} color="#a855f7" />
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => setShowGuestWarning(true)}
            activeOpacity={0.8}
          >
            <Users size={20} color="#64748b" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal
        visible={showGuestWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuestWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guest Mode</Text>
            <Text style={styles.modalText}>
              As a guest, your progress won&apos;t be saved and you&apos;ll have limited access to features like leaderboards and social features.
            </Text>
            <Text style={styles.modalTextBold}>
              Create an account to unlock the full experience!
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={() => {
                setShowGuestWarning(false);
                router.push('/auth/signup');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => {
                setShowGuestWarning(false);
                router.push('/avatar-creator');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSecondaryButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  cube: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  cubeFace: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  front: {
    width: 100,
    height: 100,
    backgroundColor: '#7c3aed',
  },
  left: {
    backgroundColor: '#14b8a6',
    width: 25,
    height: 100,
    left: -12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  top: {
    backgroundColor: '#a855f7',
    width: 100,
    height: 25,
    top: -12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#a855f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 2,
    borderColor: '#a855f7',
    gap: 12,
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#a855f7',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 16,
    fontWeight: '600' as const,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    gap: 10,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalTextBold: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600' as const,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
  },
  modalPrimaryButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
    textAlign: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.4)',
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
