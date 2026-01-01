import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Pause, Play } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

const { width, height } = Dimensions.get('window');

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ObbyRush() {
  const router = useRouter();
  const { profile, spendEnergy, addCoins, addXP, updateGameStats } = useGame();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [paused, setPaused] = useState(false);
  
  const playerY = useRef(new Animated.Value(height - 200)).current;
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstacleCounter = useRef(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    if (!spendEnergy(1)) {
      alert('Not enough energy! Wait for it to refill.');
      return;
    }
    
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCoins(0);
    setObstacles([]);
    obstacleCounter.current = 0;
    playerY.setValue(height - 200);
  };

  const jump = () => {
    if (!isJumping && gameStarted && !gameOver && !paused) {
      setIsJumping(true);
      
      Animated.sequence([
        Animated.timing(playerY, {
          toValue: height - 350,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(playerY, {
          toValue: height - 200,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsJumping(false);
      });
    }
  };

  const endGame = useCallback(() => {
    setGameOver(true);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    const coinsEarned = Math.floor(score / 10);
    const xpEarned = Math.floor(score / 5);
    
    addCoins(coinsEarned);
    addXP(xpEarned);
    updateGameStats('obbyRush', score, coinsEarned);
    setCoins(coinsEarned);
  }, [score, addCoins, addXP, updateGameStats]);

  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      gameLoopRef.current = setInterval(() => {
        setScore(prev => prev + 1);
        
        if (Math.random() < 0.02) {
          const newObstacle: Obstacle = {
            id: obstacleCounter.current++,
            x: width,
            y: height - 200,
            width: 40,
            height: 60,
          };
          setObstacles(prev => [...prev, newObstacle]);
        }

        setObstacles(prev => {
          const updated = prev.map(obs => ({
            ...obs,
            x: obs.x - 8,
          })).filter(obs => obs.x > -50);

          return updated;
        });
      }, 50);

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, paused]);

  useEffect(() => {
    if (!gameStarted || gameOver || paused) return;

    const checkCollision = () => {
      const playerX = 50;
      const playerWidth = 50;
      const playerHeight = 60;
      
      const listener = playerY.addListener(({ value }) => {
        const playerBottom = value + playerHeight;

        obstacles.forEach(obs => {
          if (
            playerX < obs.x + obs.width &&
            playerX + playerWidth > obs.x &&
            playerBottom > obs.y &&
            value < obs.y + obs.height
          ) {
            endGame();
          }
        });
      });
      
      return listener;
    };

    const listener = checkCollision();

    return () => {
      if (listener) {
        playerY.removeListener(listener);
      }
    };
  }, [obstacles, gameStarted, gameOver, paused, playerY, endGame]);

  const togglePause = () => {
    setPaused(!paused);
  };

  if (!gameStarted) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.menuContent}>
          <Text style={styles.gameTitle}>🏃 Obby Rush</Text>
          <Text style={styles.gameDescription}>
            Tap to jump over obstacles!{'\n'}
            Survive as long as you can!
          </Text>
          
          <View style={styles.statsBox}>
            <Text style={styles.statsText}>High Score: {profile.gameStats.obbyRush.highScore}</Text>
            <Text style={styles.statsText}>Games Played: {profile.gameStats.obbyRush.gamesPlayed}</Text>
          </View>

          <Pressable style={styles.playButton} onPress={startGame}>
            <Text style={styles.playButtonText}>Play (1 ⚡)</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#87ceeb', '#4a90e2', '#2c5aa0']} style={styles.container}>
      <Pressable style={styles.gameArea} onPress={jump}>
        <View style={styles.topBar}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Pressable onPress={togglePause}>
            {paused ? <Play size={24} color="#ffffff" /> : <Pause size={24} color="#ffffff" />}
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.player,
            {
              transform: [{ translateY: playerY }],
            },
          ]}
        />

        {obstacles.map(obs => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              {
                left: obs.x,
                bottom: 100,
              },
            ]}
          />
        ))}

        <View style={styles.ground} />

        {gameOver && (
          <View style={styles.gameOverModal}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverScore}>Score: {score}</Text>
            <Text style={styles.gameOverCoins}>Earned: 🪙 {coins}</Text>
            
            <View style={styles.gameOverButtons}>
              <Pressable style={styles.retryButton} onPress={startGame}>
                <Text style={styles.retryButtonText}>Retry (1 ⚡)</Text>
              </Pressable>
              <Pressable style={styles.homeButton} onPress={() => router.back()}>
                <Text style={styles.homeButtonText}>Home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {paused && !gameOver && (
          <View style={styles.pausedOverlay}>
            <Text style={styles.pausedText}>Paused</Text>
            <Pressable style={styles.resumeButton} onPress={togglePause}>
              <Text style={styles.resumeButtonText}>Resume</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  gameDescription: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    minWidth: 200,
  },
  statsText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  player: {
    position: 'absolute',
    left: 50,
    width: 50,
    height: 60,
    backgroundColor: '#a855f7',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
  },
  obstacle: {
    position: 'absolute',
    width: 40,
    height: 60,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#22c55e',
    borderTopWidth: 4,
    borderTopColor: '#16a34a',
  },
  gameOverModal: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#14b8a6',
    marginBottom: 8,
  },
  gameOverCoins: {
    fontSize: 20,
    color: '#fbbf24',
    marginBottom: 24,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  resumeButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
