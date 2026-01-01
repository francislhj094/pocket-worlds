import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Coins as CoinsIcon, Gem } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import { SHOP_ITEMS } from '@/constants/gameData';

export default function Shop() {
  const router = useRouter();
  const { profile, purchaseItem } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<'hats' | 'outfits' | 'faces' | 'effects'>('hats');

  const categories = [
    { id: 'hats' as const, name: 'Hats', icon: '🎩' },
    { id: 'outfits' as const, name: 'Outfits', icon: '👕' },
    { id: 'faces' as const, name: 'Faces', icon: '😊' },
    { id: 'effects' as const, name: 'Effects', icon: '✨' },
  ];

  const filteredItems = SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: typeof SHOP_ITEMS[0]) => {
    if (profile.inventory[item.category].includes(item.id)) {
      alert('You already own this item!');
      return;
    }

    const success = purchaseItem(item.id, item.category, item.price, item.currency);
    if (success) {
      alert(`Purchased ${item.name}!`);
    } else {
      alert(`Not enough ${item.currency}!`);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <X size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.currency}>
          <View style={styles.currencyItem}>
            <CoinsIcon size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.currencyText}>{profile.coins}</Text>
          </View>
          <View style={styles.currencyItem}>
            <Gem size={16} color="#14b8a6" fill="#14b8a6" />
            <Text style={styles.currencyText}>{profile.gems}</Text>
          </View>
        </View>
      </View>

      <View style={styles.categories}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsContent}>
        {filteredItems.map(item => {
          const owned = profile.inventory[item.category].includes(item.id);

          return (
            <View key={item.id} style={styles.shopItem}>
              <View style={styles.itemPreview}>
                <Text style={styles.itemIcon}>{item.preview}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {owned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedText}>Owned</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[
                      styles.buyButton,
                      { backgroundColor: item.currency === 'coins' ? '#fbbf24' : '#14b8a6' },
                    ]}
                    onPress={() => handlePurchase(item)}
                  >
                    <Text style={styles.buyButtonText}>
                      {item.currency === 'coins' ? '🪙' : '💎'} {item.price}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
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
  currency: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  itemsList: {
    flex: 1,
  },
  itemsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  shopItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  itemPreview: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemIcon: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ownedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  ownedText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
