import { ShopItem, DailyReward, Achievement } from '@/types/game';

export const SKIN_TONES = ['#ffd6a5', '#c68642', '#8d5524', '#3d2817', '#f4c2a5', '#d4a574'];

export const FACES = [
  { id: 'happy', name: 'Happy', free: true },
  { id: 'cool', name: 'Cool', free: true },
  { id: 'excited', name: 'Excited', free: true },
  { id: 'wink', name: 'Wink', free: false },
  { id: 'star', name: 'Star Eyes', free: false },
  { id: 'kawaii', name: 'Kawaii', free: false },
];

export const HAIR_STYLES = [
  { id: 'short', name: 'Short', free: true },
  { id: 'long', name: 'Long', free: true },
  { id: 'curly', name: 'Curly', free: true },
  { id: 'spiky', name: 'Spiky', free: false },
  { id: 'bun', name: 'Bun', free: false },
  { id: 'afro', name: 'Afro', free: false },
];

export const HAIR_COLORS = [
  '#2d1b00', '#6b4423', '#c93305', '#e9c46a', '#f4a261', '#a855f7', '#14b8a6', '#3b82f6',
];

export const OUTFITS = [
  { id: 'casual', name: 'Casual', free: true },
  { id: 'sporty', name: 'Sporty', free: true },
  { id: 'formal', name: 'Formal', free: false },
  { id: 'hoodie', name: 'Hoodie', free: false },
  { id: 'ninja', name: 'Ninja', free: false },
  { id: 'robot', name: 'Robot', free: false },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'cap', name: 'Cool Cap', category: 'hats', price: 500, currency: 'coins', preview: '🧢' },
  { id: 'crown', name: 'Gold Crown', category: 'hats', price: 50, currency: 'gems', preview: '👑' },
  { id: 'wizard', name: 'Wizard Hat', category: 'hats', price: 1000, currency: 'coins', preview: '🧙' },
  { id: 'party', name: 'Party Hat', category: 'hats', price: 25, currency: 'gems', preview: '🎉' },
  
  { id: 'hero', name: 'Hero Suit', category: 'outfits', price: 2000, currency: 'coins', preview: '🦸' },
  { id: 'space', name: 'Space Suit', category: 'outfits', price: 75, currency: 'gems', preview: '👨‍🚀' },
  { id: 'pirate', name: 'Pirate', category: 'outfits', price: 1500, currency: 'coins', preview: '🏴‍☠️' },
  
  { id: 'wink', name: 'Wink', category: 'faces', price: 300, currency: 'coins', preview: '😉' },
  { id: 'star', name: 'Star Eyes', category: 'faces', price: 20, currency: 'gems', preview: '🤩' },
  { id: 'kawaii', name: 'Kawaii', category: 'faces', price: 500, currency: 'coins', preview: '😊' },
  
  { id: 'sparkle', name: 'Sparkle', category: 'effects', price: 30, currency: 'gems', preview: '✨' },
  { id: 'fire', name: 'Fire Aura', category: 'effects', price: 50, currency: 'gems', preview: '🔥' },
  { id: 'rainbow', name: 'Rainbow Trail', category: 'effects', price: 40, currency: 'gems', preview: '🌈' },
];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 100 },
  { day: 2, coins: 150 },
  { day: 3, coins: 200, energy: 1 },
  { day: 4, coins: 250 },
  { day: 5, gems: 5, coins: 300 },
  { day: 6, coins: 400, energy: 2 },
  { day: 7, gems: 20, coins: 500, energy: 5 },
];

export const ACHIEVEMENTS: Omit<Achievement, 'progress'>[] = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    reward: { coins: 100, xp: 50 },
    requirement: 1,
  },
  {
    id: 'coin_collector',
    name: 'Coin Collector',
    description: 'Collect 1000 total coins',
    icon: '🪙',
    reward: { gems: 5, xp: 100 },
    requirement: 1000,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    reward: { gems: 10, coins: 500 },
    requirement: 10,
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete a 7-day streak',
    icon: '🔥',
    reward: { gems: 25, xp: 200 },
    requirement: 7,
  },
  {
    id: 'obby_master',
    name: 'Obby Master',
    description: 'Score 1000 in Obby Rush',
    icon: '🏃',
    reward: { gems: 15, xp: 150 },
    requirement: 1000,
  },
  {
    id: 'memory_genius',
    name: 'Memory Genius',
    description: 'Complete Memory Match in under 30 seconds',
    icon: '🧠',
    reward: { gems: 15, xp: 150 },
    requirement: 30,
  },
  {
    id: 'dodge_expert',
    name: 'Dodge Expert',
    description: 'Survive 60 seconds in Dodge Master',
    icon: '⚡',
    reward: { gems: 15, xp: 150 },
    requirement: 60,
  },
  {
    id: 'shopaholic',
    name: 'Shopaholic',
    description: 'Purchase 5 items from the shop',
    icon: '🛍️',
    reward: { gems: 10, xp: 100 },
    requirement: 5,
  },
];

export const XP_PER_LEVEL = 100;
export const ENERGY_REFILL_MINUTES = 10;
