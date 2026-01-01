export interface AvatarCustomization {
  skinTone: string;
  face: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  hat?: string;
  effect?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: AvatarCustomization;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  inventory: {
    hats: string[];
    outfits: string[];
    faces: string[];
    effects: string[];
  };
  achievements: string[];
  gameStats: {
    obbyRush: GameStats;
    memoryMatch: GameStats;
    dodgeMaster: GameStats;
  };
  dailyStreak: number;
  lastLoginDate: string;
  createdAt: number;
}

export interface GameStats {
  highScore: number;
  gamesPlayed: number;
  totalCoins: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'hats' | 'outfits' | 'faces' | 'effects';
  price: number;
  currency: 'coins' | 'gems';
  preview: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: {
    coins?: number;
    gems?: number;
    xp?: number;
  };
  requirement: number;
  progress: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: AvatarCustomization;
  score: number;
  rank: number;
}

export interface DailyReward {
  day: number;
  coins?: number;
  gems?: number;
  energy?: number;
}
