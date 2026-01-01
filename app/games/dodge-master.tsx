import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Pause, Play } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

const { width, height } = Dimensions.get('window');

interface FallingObject {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
}

export default function DodgeMaster() {
  const router = useRouter();
  const { profile, spendEnergy, addCoins, addXP, updateGameStats } = useGame();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playerX, setPlayerX] = useState(width / 2 - 25);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  
  const objectCounter = useRef(0);
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
    setObjects([]);
    setPlayerX(width / 2 - 25);
    objectCounter.current = 0;
  };

  const endGame = useCallback(() => {
    setGameOver(true);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    const coinsEarned = Math.floor(score / 5);
    const xpEarned = Math.floor(score / 3);
    
    addCoins(coinsEarned);
    addXP(xpEarned);
    updateGameStats('dodgeMaster', score, coinsEarned);
    setCoins(coinsEarned);
  }, [score, addCoins, addXP, updateGameStats]);

  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const interval = setInterval(() => {
        setScore(prev => prev + 1);
        
        if (Math.random() < 0.03 + score * 0.00001) {
          const newObject: FallingObject = {
            id: objectCounter.current++,
            x: Math.random() * (width - 50),
            y: -50,
            speed: 3 + Math.random() * 3 + score * 0.01,
            size: 40 + Math.random() * 20,
          };
          setObjects(prev => [...prev, newObject]);
        }

        setObjects(prev => {
          const updated = prev.map(obj => ({
            ...obj,
            y: obj.y + obj.speed,
          }));

          updated.forEach(obj => {
            const playerY = height - 150;
            const playerSize = 50;

            if (
              obj.y + obj.size > playerY &&
              obj.y < playerY + playerSize &&
              obj.x + obj.size > playerX &&
              obj.x < playerX + playerSize
            ) {
              endGame();
            }
          });

          return updated.filter(obj => obj.y < height);
        });
      }, 50);
      
      gameLoopRef.current = interval;

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, paused, playerX, score, endGame]);

  const togglePause = () => {
    setPaused(!paused);
  };

  const handleMove = (direction: 'left' | 'right') => {
    if (!gameStarted || gameOver || paused) return;

    setPlayerX(prev => {
      if (direction === 'left') {
        return Math.max(0, prev - 30);
      } else {
        return Math.min(width - 50, prev + 30);
      }
    });
  };

  if (!gameStarted) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.menuContent}>
          <Text style={styles.gameTitle}>⚡ Dodge Master</Text>
          <Text style={styles.gameDescription}>
            Avoid falling objects!{'\n'}
            Use buttons to move left and right!
          </Text>
          
          <View style={styles.statsBox}>
            <Text style={styles.statsText}>High Score: {profile.gameStats.dodgeMaster.highScore}</Text>
            <Text style={styles.statsText}>Games Played: {profile.gameStats.dodgeMaster.gamesPlayed}</Text>
          </View>

          <Pressable style={styles.playButton} onPress={startGame}>
            <Text style={styles.playButtonText}>Play (1 ⚡)</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.scoreText}>Time: {score}s</Text>
        <Pressable onPress={togglePause}>
          {paused ? <Play size={24} color="#ffffff" /> : <Pause size={24} color="#ffffff" />}
        </Pressable>
      </View>

      <View style={styles.gameArea}>
        {objects.map(obj => (
          <View
            key={obj.id}
            style={[
              styles.fallingObject,
              {
                left: obj.x,
                top: obj.y,
                width: obj.size,
                height: obj.size,
              },
            ]}
          />
        ))}

        <View
          style={[
            styles.player,
            {
              left: playerX,
            },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => handleMove('left')}>
          <Text style={styles.controlButtonText}>◀</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={() => handleMove('right')}>
          <Text style={styles.controlButtonText}>▶</Text>
        </Pressable>
      </View>

      {gameOver && (
        <View style={styles.gameOverModal}>
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          <Text style={styles.gameOverScore}>Survived: {score}s</Text>
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
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  player: {
    position: 'absolute',
    bottom: 100,
    width: 50,
    height: 50,
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#0d9488',
  },
  fallingObject: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#dc2626',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 20,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#a855f7',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7c3aed',
  },
  controlButtonText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
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
