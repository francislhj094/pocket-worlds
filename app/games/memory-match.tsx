import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

const { width } = Dimensions.get('window');

interface Card {
  id: number;
  value: string;
  matched: boolean;
  flipped: boolean;
}

const EMOJIS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎹'];

export default function MemoryMatch() {
  const router = useRouter();
  const { profile, spendEnergy, addCoins, addXP, updateGameStats } = useGame();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  const initializeGame = () => {
    if (!spendEnergy(1)) {
      alert('Not enough energy! Wait for it to refill.');
      return;
    }

    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        matched: false,
        flipped: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const handleCardPress = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].matched ||
      cards[index].flipped ||
      flippedIndices.includes(index)
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped;
      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].matched = true;
          matched[second].matched = true;
          setCards(matched);
          setMatchedPairs(prev => prev + 1);
          setFlippedIndices([]);

          if (matchedPairs + 1 === EMOJIS.length) {
            endGame();
          }
        }, 500);
      } else {
        setTimeout(() => {
          const unflipped = [...cards];
          unflipped[first].flipped = false;
          unflipped[second].flipped = false;
          setCards(unflipped);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const endGame = () => {
    setGameOver(true);
    
    const score = Math.max(1000 - timer * 10 - moves * 5, 100);
    const coinsEarned = Math.floor(score / 20);
    const xpEarned = Math.floor(score / 10);
    
    addCoins(coinsEarned);
    addXP(xpEarned);
    updateGameStats('memoryMatch', score, coinsEarned);
  };

  if (!gameStarted) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.menuContent}>
          <Text style={styles.gameTitle}>🧠 Memory Match</Text>
          <Text style={styles.gameDescription}>
            Match all pairs as fast as you can!{'\n'}
            Test your memory skills!
          </Text>
          
          <View style={styles.statsBox}>
            <Text style={styles.statsText}>High Score: {profile.gameStats.memoryMatch.highScore}</Text>
            <Text style={styles.statsText}>Games Played: {profile.gameStats.memoryMatch.gamesPlayed}</Text>
          </View>

          <Pressable style={styles.playButton} onPress={initializeGame}>
            <Text style={styles.playButtonText}>Play (1 ⚡)</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.stats}>
          <Text style={styles.statText}>Time: {timer}s</Text>
          <Text style={styles.statText}>Moves: {moves}</Text>
          <Text style={styles.statText}>Pairs: {matchedPairs}/{EMOJIS.length}</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {cards.map((card, index) => (
          <Pressable
            key={card.id}
            style={[
              styles.card,
              (card.flipped || card.matched) && styles.cardFlipped,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(index)}
          >
            {(card.flipped || card.matched) && (
              <Text style={styles.cardEmoji}>{card.value}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {gameOver && (
        <View style={styles.gameOverModal}>
          <Text style={styles.gameOverTitle}>Perfect! 🎉</Text>
          <Text style={styles.gameOverStats}>Time: {timer}s</Text>
          <Text style={styles.gameOverStats}>Moves: {moves}</Text>
          
          <View style={styles.gameOverButtons}>
            <Pressable style={styles.retryButton} onPress={initializeGame}>
              <Text style={styles.retryButtonText}>Play Again (1 ⚡)</Text>
            </Pressable>
            <Pressable style={styles.homeButton} onPress={() => router.back()}>
              <Text style={styles.homeButtonText}>Home</Text>
            </Pressable>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  card: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    backgroundColor: '#a855f7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7c3aed',
  },
  cardFlipped: {
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
  },
  cardMatched: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  cardEmoji: {
    fontSize: 32,
  },
  gameOverModal: {
    position: 'absolute',
    top: '35%',
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
  gameOverStats: {
    fontSize: 18,
    color: '#14b8a6',
    marginBottom: 8,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
