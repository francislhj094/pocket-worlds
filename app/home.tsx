import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, User, Trophy, Zap, Coins as CoinsIcon, Gem, Star } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import { XP_PER_LEVEL, DAILY_REWARDS } from '@/constants/gameData';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { AvatarCustomization } from '@/types/game';

const { width } = Dimensions.get('window');

const CubicAvatar = ({ avatar, size = 120 }: { avatar: AvatarCustomization; size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Rect x="50" y="30" width="100" height="100" rx="12" fill={avatar.skinTone} stroke="#000" strokeWidth="3" />
      
      {avatar.hairStyle === 'short' && (
        <Path d="M 50 30 Q 50 10, 100 10 Q 150 10, 150 30 L 150 50 L 50 50 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
      )}
      {avatar.hairStyle === 'long' && (
        <>
          <Path d="M 50 30 Q 50 10, 100 10 Q 150 10, 150 30 L 150 80 L 50 80 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Rect x="45" y="60" width="20" height="40" rx="10" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Rect x="135" y="60" width="20" height="40" rx="10" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
        </>
      )}
      
      {avatar.face === 'happy' && (
        <>
          <Circle cx="75" cy="70" r="8" fill="#000" />
          <Circle cx="125" cy="70" r="8" fill="#000" />
          <Path d="M 70 95 Q 100 105, 130 95" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {avatar.face === 'cool' && (
        <>
          <Rect x="60" y="65" width="30" height="12" rx="6" fill="#000" />
          <Rect x="110" y="65" width="30" height="12" rx="6" fill="#000" />
          <Path d="M 75 95 L 125 95" stroke="#000" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {avatar.face === 'excited' && (
        <>
          <Circle cx="75" cy="65" r="10" fill="#000" />
          <Circle cx="125" cy="65" r="10" fill="#000" />
          <Circle cx="100" cy="95" r="12" fill="#000" />
        </>
      )}
      
      <Rect x="60" y="140" width="80" height="60" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="3" />
      <Rect x="30" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="2" />
      <Rect x="140" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="2" />
    </Svg>
  );
};

const DailyRewardModal = ({ visible, onClose, onClaim }: { visible: boolean; onClose: () => void; onClaim: () => void }) => {
  const { profile } = useGame();
  const currentDay = Math.min(profile.dailyStreak, 7);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Daily Reward! 🎁</Text>
        <Text style={styles.modalSubtitle}>Day {currentDay} Streak</Text>

        <View style={styles.rewardsGrid}>
          {DAILY_REWARDS.map((reward, index) => {
            const isToday = index + 1 === currentDay;
            const isClaimed = index + 1 < currentDay;

            return (
              <View
                key={reward.day}
                style={[
                  styles.rewardDay,
                  isToday && styles.rewardDayActive,
                  isClaimed && styles.rewardDayClaimed,
                ]}
              >
                <Text style={styles.rewardDayNumber}>{reward.day}</Text>
                {reward.coins && <Text style={styles.rewardText}>🪙 {reward.coins}</Text>}
                {reward.gems && <Text style={styles.rewardText}>💎 {reward.gems}</Text>}
                {reward.energy && <Text style={styles.rewardText}>⚡ {reward.energy}</Text>}
              </View>
            );
          })}
        </View>

        <Pressable style={styles.claimButton} onPress={onClaim}>
          <Text style={styles.claimButtonText}>Claim Reward!</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default function Home() {
  const router = useRouter();
  const { profile, claimDailyReward } = useGame();
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [hasShownDailyReward, setHasShownDailyReward] = useState(false);

  const xpProgress = (profile.xp / (XP_PER_LEVEL * profile.level)) * 100;

  useEffect(() => {
    const today = new Date().toDateString();
    if (!hasShownDailyReward && profile.lastLoginDate === today && profile.dailyStreak > 0) {
      setTimeout(() => setShowDailyReward(true), 500);
      setHasShownDailyReward(true);
    }
  }, [profile.lastLoginDate, profile.dailyStreak, hasShownDailyReward]);

  const handleClaimReward = useCallback(() => {
    const currentDay = Math.min(profile.dailyStreak, 7);
    const reward = DAILY_REWARDS[currentDay - 1];
    claimDailyReward(reward.coins || 0, reward.gems || 0, reward.energy || 0);
    setShowDailyReward(false);
  }, [profile.dailyStreak, claimDailyReward]);

  const games = [
    { id: 'obbyRush', name: 'Obby Rush', icon: '🏃', color: '#ef4444', route: '/games/obby-rush' as const },
    { id: 'memoryMatch', name: 'Memory Match', icon: '🧠', color: '#f59e0b', route: '/games/memory-match' as const },
    { id: 'dodgeMaster', name: 'Dodge Master', icon: '⚡', color: '#8b5cf6', route: '/games/dodge-master' as const },
  ];

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <CubicAvatar avatar={profile.avatar} size={80} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{profile.username}</Text>
              <View style={styles.levelBadge}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.levelText}>Level {profile.level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.currencyRow}>
            <View style={styles.currencyItem}>
              <CoinsIcon size={20} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.currencyText}>{profile.coins}</Text>
            </View>
            <View style={styles.currencyItem}>
              <Gem size={20} color="#14b8a6" fill="#14b8a6" />
              <Text style={styles.currencyText}>{profile.gems}</Text>
            </View>
            <View style={styles.currencyItem}>
              <Zap size={20} color="#a855f7" fill="#a855f7" />
              <Text style={styles.currencyText}>{profile.energy}/{profile.maxEnergy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.xpBar}>
          <Text style={styles.xpText}>XP Progress</Text>
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.xpNumbers}>{profile.xp} / {XP_PER_LEVEL * profile.level}</Text>
        </View>

        <Text style={styles.sectionTitle}>Play Games</Text>
        <View style={styles.gamesGrid}>
          {games.map(game => (
            <Pressable
              key={game.id}
              style={[styles.gameCard, { backgroundColor: game.color + '20', borderColor: game.color }]}
              onPress={() => router.push(game.route)}
            >
              <Text style={styles.gameIcon}>{game.icon}</Text>
              <Text style={styles.gameName}>{game.name}</Text>
              <View style={styles.gameStats}>
                <Text style={styles.gameStatsText}>
                  Best: {profile.gameStats[game.id as keyof typeof profile.gameStats]?.highScore || 0}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/shop')}>
            <ShoppingBag size={24} color="#ffffff" />
            <Text style={styles.actionText}>Shop</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/profile')}>
            <User size={24} color="#ffffff" />
            <Text style={styles.actionText}>Profile</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/leaderboard')}>
            <Trophy size={24} color="#ffffff" />
            <Text style={styles.actionText}>Leaderboard</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DailyRewardModal
        visible={showDailyReward}
        onClose={() => setShowDailyReward(false)}
        onClaim={handleClaimReward}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  levelText: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: 14,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  currencyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpBar: {
    marginBottom: 32,
  },
  xpText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  xpBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 6,
  },
  xpNumbers: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gameCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  gameIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  gameStats: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameStatsText: {
    color: '#ffffff',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 2,
    borderColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -200 }],
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#14b8a6',
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  rewardDay: {
    width: (width - 104) / 4,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rewardDayActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  rewardDayClaimed: {
    opacity: 0.4,
  },
  rewardDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 10,
    color: '#ffffff',
  },
  claimButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
