// Game state types
export type GameState = 'welcome' | 'countdown' | 'playing' | 'completed';

// Upgrade effect types
export type UpgradeEffectType =
  | 'vowel_multiplier'
  | 'consonant_multiplier'
  | 'base_score'
  | 'combo_unlock'
  | 'combo_threshold'
  | 'combo_no_break';


// Upgrade types
export interface Upgrade {
  id: number;
  name: string;
  description: string;
  costs: number[];
  effect: UpgradeEffectType;
  values: number[];
  requisiteIds: number[];
  isPurchased?: boolean;
}

// Multiplier system
export interface Multipliers {
  base: number;
  vowel: number;
  consonant: number;
  combo: number;
}

// Combo state
export interface ComboState {
  isActive: boolean;
  multiplier: number;
  threshold: number; // WPM threshold to activate
  noBreak: boolean; // Whether mistakes break the combo
  availableThresholds: { wpm: number; multiplier: number }[]; // All unlocked combo tiers
}

// WPM tracking
export interface WPMData {
  recentTimestamps: number[]; // Timestamps of last 20 characters
  currentWPM: number;
}

// Game completion data
export interface GameCompletion {
  finalScore: number;
  elapsedSeconds: number;
  scorePerMinute: number;
}
