import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Award, Package } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { AvatarCustomization } from '@/types/game';

const CubicAvatar = ({ avatar, size = 120 }: { avatar: AvatarCustomization; size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Rect x="50" y="30" width="100" height="100" rx="12" fill={avatar.skinTone} stroke="#000" strokeWidth="3" />
      {avatar.hairStyle === 'short' && (
        <Path d="M 50 30 Q 50 10, 100 10 Q 150 10, 150 30 L 150 50 L 50 50 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
      )}
      {avatar.face === 'happy' && (
        <>
          <Circle cx="75" cy="70" r="8" fill="#000" />
          <Circle cx="125" cy="70" r="8" fill="#000" />
          <Path d="M 70 95 Q 100 105, 130 95" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      <Rect x="60" y="140" width="80" height="60" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : '#ef4444'} stroke="#000" strokeWidth="3" />
      <Rect x="30" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : '#ef4444'} stroke="#000" strokeWidth="2" />
      <Rect x="140" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : '#ef4444'} stroke="#000" strokeWidth="2" />
    </Svg>
  );
};

export default function Profile() {
  const router = useRouter();
  const { profile, getAchievementProgress } = useGame();
  const achievements = getAchievementProgress();

  const stats = [
    { label: 'Level', value: profile.level },
    { label: 'Total XP', value: profile.xp },
    { label: 'Games Played', value: Object.values(profile.gameStats).reduce((sum, s) => sum + s.gamesPlayed, 0) },
    { label: 'Total Coins Earned', value: Object.values(profile.gameStats).reduce((sum, s) => sum + s.totalCoins, 0) },
  ];

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <X size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileCard}>
          <CubicAvatar avatar={profile.avatar} size={100} />
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.userLevel}>Level {profile.level}</Text>
        </View>

        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Award size={20} color="#a855f7" />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        {achievements.map(achievement => {
          const completed = profile.achievements.includes(achievement.id);
          const progress = Math.min(achievement.progress, achievement.requirement);

          return (
            <View key={achievement.id} style={[styles.achievementCard, completed && styles.achievementCompleted]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(progress / achievement.requirement) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress}/{achievement.requirement}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.sectionHeader}>
          <Package size={20} color="#a855f7" />
          <Text style={styles.sectionTitle}>Inventory</Text>
        </View>
        <View style={styles.inventoryCard}>
          <Text style={styles.inventoryLabel}>Hats: {profile.inventory.hats.length}</Text>
          <Text style={styles.inventoryLabel}>Outfits: {profile.inventory.outfits.length}</Text>
          <Text style={styles.inventoryLabel}>Faces: {profile.inventory.faces.length}</Text>
          <Text style={styles.inventoryLabel}>Effects: {profile.inventory.effects.length}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  userLevel: {
    fontSize: 16,
    color: '#14b8a6',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  achievementCompleted: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  inventoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  inventoryLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
});
