import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AvatarCustomization, GameStats, Achievement } from '@/types/game';
import { ACHIEVEMENTS, ENERGY_REFILL_MINUTES, XP_PER_LEVEL } from '@/constants/gameData';

const DEFAULT_AVATAR: AvatarCustomization = {
  skinTone: '#ffd6a5',
  face: 'happy',
  hairStyle: 'short',
  hairColor: '#2d1b00',
  outfit: 'casual',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'player_' + Date.now(),
  username: 'Player',
  avatar: DEFAULT_AVATAR,
  level: 1,
  xp: 0,
  coins: 1000,
  gems: 50,
  energy: 5,
  maxEnergy: 5,
  lastEnergyUpdate: Date.now(),
  inventory: {
    hats: [],
    outfits: ['casual', 'sporty'],
    faces: ['happy', 'cool', 'excited'],
    effects: [],
  },
  achievements: [],
  gameStats: {
    obbyRush: { highScore: 0, gamesPlayed: 0, totalCoins: 0 },
    memoryMatch: { highScore: 0, gamesPlayed: 0, totalCoins: 0 },
    dodgeMaster: { highScore: 0, gamesPlayed: 0, totalCoins: 0 },
  },
  dailyStreak: 0,
  lastLoginDate: '',
  createdAt: Date.now(),
};

interface GameContextType {
  profile: UserProfile;
  isLoading: boolean;
  hasSeenAvatarCreator: boolean;
  updateAvatar: (avatar: AvatarCustomization) => void;
  completeAvatarCreator: () => Promise<void>;
  spendEnergy: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addXP: (amount: number) => void;
  updateGameStats: (game: keyof UserProfile['gameStats'], score: number, coinsEarned: number) => void;
  purchaseItem: (itemId: string, category: keyof UserProfile['inventory'], price: number, currency: 'coins' | 'gems') => boolean;
  claimDailyReward: (coins: number, gems: number, energy: number) => void;
  getAchievementProgress: () => Achievement[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenAvatarCreator, setHasSeenAvatarCreator] = useState(false);

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const updateEnergy = useCallback((currentProfile?: UserProfile) => {
    const p = currentProfile || profile;
    if (p.energy >= p.maxEnergy) return;

    const now = Date.now();
    const timePassed = now - p.lastEnergyUpdate;
    const energyToAdd = Math.floor(timePassed / (ENERGY_REFILL_MINUTES * 60 * 1000));

    if (energyToAdd > 0) {
      const newEnergy = Math.min(p.maxEnergy, p.energy + energyToAdd);
      const updatedProfile = {
        ...p,
        energy: newEnergy,
        lastEnergyUpdate: now,
      };
      saveProfile(updatedProfile);
    }
  }, [profile]);

  const checkDailyLogin = useCallback((currentProfile: UserProfile) => {
    const today = new Date().toDateString();
    if (currentProfile.lastLoginDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const isConsecutive = currentProfile.lastLoginDate === yesterday;
      const newStreak = isConsecutive ? currentProfile.dailyStreak + 1 : 1;

      const updatedProfile = {
        ...currentProfile,
        lastLoginDate: today,
        dailyStreak: newStreak,
      };
      saveProfile(updatedProfile);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    console.log('[GameContext] Loading profile...');
    try {
      const stored = await AsyncStorage.getItem('profile');
      const seen = await AsyncStorage.getItem('hasSeenAvatarCreator');
      console.log('[GameContext] Loaded from storage:', { hasProfile: !!stored, hasSeen: !!seen });
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        updateEnergy(parsed);
        checkDailyLogin(parsed);
      }
      if (seen) {
        setHasSeenAvatarCreator(true);
      }
      console.log('[GameContext] Profile loaded successfully');
    } catch (error) {
      console.error('[GameContext] Failed to load profile:', error);
    } finally {
      setIsLoading(false);
      console.log('[GameContext] Loading complete');
    }
  }, [updateEnergy, checkDailyLogin]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergy();
    }, 60000);
    return () => clearInterval(interval);
  }, [updateEnergy]);

  const updateAvatar = useCallback((avatar: AvatarCustomization) => {
    saveProfile({ ...profile, avatar });
  }, [profile]);

  const completeAvatarCreator = useCallback(async () => {
    await AsyncStorage.setItem('hasSeenAvatarCreator', 'true');
    setHasSeenAvatarCreator(true);
  }, []);

  const spendEnergy = useCallback((amount: number): boolean => {
    if (profile.energy >= amount) {
      saveProfile({ ...profile, energy: profile.energy - amount });
      return true;
    }
    return false;
  }, [profile]);

  const checkAchievements = useCallback((currentProfile: UserProfile) => {
    const totalCoinsCollected = Object.values(currentProfile.gameStats).reduce((sum, stats) => sum + stats.totalCoins, 0);
    const totalItemsPurchased = Object.values(currentProfile.inventory).reduce((sum, items) => sum + items.length, 0) - 5;
    const totalGamesPlayed = Object.values(currentProfile.gameStats).reduce((sum, stats) => sum + stats.gamesPlayed, 0);

    ACHIEVEMENTS.forEach(achievement => {
      if (currentProfile.achievements.includes(achievement.id)) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_game':
          shouldUnlock = totalGamesPlayed >= 1;
          break;
        case 'coin_collector':
          shouldUnlock = totalCoinsCollected >= 1000;
          break;
        case 'level_10':
          shouldUnlock = currentProfile.level >= 10;
          break;
        case 'daily_champion':
          shouldUnlock = currentProfile.dailyStreak >= 7;
          break;
        case 'obby_master':
          shouldUnlock = currentProfile.gameStats.obbyRush.highScore >= 1000;
          break;
        case 'shopaholic':
          shouldUnlock = totalItemsPurchased >= 5;
          break;
      }

      if (shouldUnlock) {
        const updatedProfile = {
          ...currentProfile,
          achievements: [...currentProfile.achievements, achievement.id],
          coins: currentProfile.coins + (achievement.reward.coins || 0),
          gems: currentProfile.gems + (achievement.reward.gems || 0),
          xp: currentProfile.xp + (achievement.reward.xp || 0),
        };
        saveProfile(updatedProfile);
      }
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    const newProfile = { ...profile, coins: profile.coins + amount };
    saveProfile(newProfile);
    checkAchievements(newProfile);
  }, [profile, checkAchievements]);

  const addGems = useCallback((amount: number) => {
    saveProfile({ ...profile, gems: profile.gems + amount });
  }, [profile]);

  const addXP = useCallback((amount: number) => {
    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    
    while (newXP >= XP_PER_LEVEL * newLevel) {
      newXP -= XP_PER_LEVEL * newLevel;
      newLevel += 1;
    }

    const newProfile = { ...profile, xp: newXP, level: newLevel };
    saveProfile(newProfile);
    checkAchievements(newProfile);
  }, [profile, checkAchievements]);

  const updateGameStats = useCallback((game: keyof UserProfile['gameStats'], score: number, coinsEarned: number) => {
    const currentStats = profile.gameStats[game];
    const updatedStats: GameStats = {
      highScore: Math.max(currentStats.highScore, score),
      gamesPlayed: currentStats.gamesPlayed + 1,
      totalCoins: currentStats.totalCoins + coinsEarned,
    };

    const newProfile = {
      ...profile,
      gameStats: {
        ...profile.gameStats,
        [game]: updatedStats,
      },
    };
    saveProfile(newProfile);
    checkAchievements(newProfile);
  }, [profile, checkAchievements]);

  const purchaseItem = useCallback((itemId: string, category: keyof UserProfile['inventory'], price: number, currency: 'coins' | 'gems'): boolean => {
    if (currency === 'coins' && profile.coins >= price) {
      const newProfile = {
        ...profile,
        coins: profile.coins - price,
        inventory: {
          ...profile.inventory,
          [category]: [...profile.inventory[category], itemId],
        },
      };
      saveProfile(newProfile);
      checkAchievements(newProfile);
      return true;
    } else if (currency === 'gems' && profile.gems >= price) {
      const newProfile = {
        ...profile,
        gems: profile.gems - price,
        inventory: {
          ...profile.inventory,
          [category]: [...profile.inventory[category], itemId],
        },
      };
      saveProfile(newProfile);
      checkAchievements(newProfile);
      return true;
    }
    return false;
  }, [profile, checkAchievements]);

  const claimDailyReward = useCallback((coins: number, gems: number, energy: number) => {
    const newProfile = {
      ...profile,
      coins: profile.coins + coins,
      gems: profile.gems + gems,
      energy: Math.min(profile.maxEnergy, profile.energy + energy),
    };
    saveProfile(newProfile);
  }, [profile]);

  const getAchievementProgress = (): Achievement[] => {
    const totalCoinsCollected = Object.values(profile.gameStats).reduce((sum, stats) => sum + stats.totalCoins, 0);
    const totalItemsPurchased = Object.values(profile.inventory).reduce((sum, items) => sum + items.length, 0) - 5;
    const totalGamesPlayed = Object.values(profile.gameStats).reduce((sum, stats) => sum + stats.gamesPlayed, 0);

    return ACHIEVEMENTS.map(achievement => {
      let progress = 0;

      switch (achievement.id) {
        case 'first_game':
          progress = totalGamesPlayed;
          break;
        case 'coin_collector':
          progress = totalCoinsCollected;
          break;
        case 'level_10':
          progress = profile.level;
          break;
        case 'daily_champion':
          progress = profile.dailyStreak;
          break;
        case 'obby_master':
          progress = profile.gameStats.obbyRush.highScore;
          break;
        case 'shopaholic':
          progress = Math.max(0, totalItemsPurchased);
          break;
      }

      return { ...achievement, progress };
    });
  };

  const value: GameContextType = {
    profile,
    isLoading,
    hasSeenAvatarCreator,
    updateAvatar,
    completeAvatarCreator,
    spendEnergy,
    addCoins,
    addGems,
    addXP,
    updateGameStats,
    purchaseItem,
    claimDailyReward,
    getAchievementProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
