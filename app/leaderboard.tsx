import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { AvatarCustomization } from '@/types/game';

const CubicAvatar = ({ avatar, size = 40 }: { avatar: AvatarCustomization; size?: number }) => {
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
      <Rect x="60" y="140" width="80" height="60" rx="8" fill="#3b82f6" stroke="#000" strokeWidth="3" />
      <Rect x="30" y="145" width="30" height="50" rx="8" fill="#3b82f6" stroke="#000" strokeWidth="2" />
      <Rect x="140" y="145" width="30" height="50" rx="8" fill="#3b82f6" stroke="#000" strokeWidth="2" />
    </Svg>
  );
};

export default function Leaderboard() {
  const router = useRouter();
  const { profile } = useGame();
  const [selectedGame, setSelectedGame] = useState<'all' | 'obbyRush' | 'memoryMatch' | 'dodgeMaster'>('all');

  const games = [
    { id: 'all' as const, name: 'Global', icon: '🌍' },
    { id: 'obbyRush' as const, name: 'Obby Rush', icon: '🏃' },
    { id: 'memoryMatch' as const, name: 'Memory Match', icon: '🧠' },
    { id: 'dodgeMaster' as const, name: 'Dodge Master', icon: '⚡' },
  ];

  const mockLeaderboard = Array.from({ length: 10 }, (_, i) => ({
    id: `player_${i}`,
    username: i === 0 ? profile.username : `Player ${i + 1}`,
    avatar: profile.avatar,
    score: i === 0 
      ? (selectedGame === 'all' ? profile.level * 100 : profile.gameStats[selectedGame].highScore)
      : Math.floor(Math.random() * 1000),
    rank: i + 1,
  })).sort((a, b) => b.score - a.score);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.title}>Leaderboard</Text>
        <Trophy size={24} color="#fbbf24" />
      </View>

      <View style={styles.filters}>
        {games.map(game => (
          <Pressable
            key={game.id}
            style={[
              styles.filterButton,
              selectedGame === game.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedGame(game.id)}
          >
            <Text style={styles.filterEmoji}>{game.icon}</Text>
            <Text style={[
              styles.filterText,
              selectedGame === game.id && styles.filterTextActive,
            ]}>
              {game.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {mockLeaderboard.map((entry, index) => (
          <View key={entry.id} style={[
            styles.leaderboardItem,
            entry.username === profile.username && styles.currentPlayer,
          ]}>
            <View style={styles.rank}>
              {index < 3 ? (
                <Text style={styles.rankEmoji}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </Text>
              ) : (
                <Text style={styles.rankNumber}>{entry.rank}</Text>
              )}
            </View>
            <CubicAvatar avatar={entry.avatar} size={40} />
            <Text style={styles.playerName}>{entry.username}</Text>
            <Text style={styles.playerScore}>{entry.score}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  filterEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  currentPlayer: {
    borderWidth: 2,
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  rank: {
    width: 40,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
});
