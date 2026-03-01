import { Upgrade } from '../types';

export const VOWEL_MULTIPLIER = 'vowel_multiplier';
export const CONSONANT_MULTIPLIER = 'consonant_multiplier';
export const BASE_SCORE = 'base_score';
export const COMBO_UNLOCK = 'combo_unlock';
export const COMBO_THRESHOLD = 'combo_threshold';
export const COMBO_NO_BREAK = 'combo_no_break';

/**
 * UPGRADE TREE SYSTEM
 *
 * Scoring Formula: Base × Key Multiplier × Combo Multiplier
 *
 * - Base: Starting value for each keystroke (starts at 1)
 * - Key Multiplier: Vowels and consonants can have different multipliers
 * - Combo Multiplier: Unlocked by maintaining WPM thresholds
 *
 * Costs are calculated for ~1 minute unlock intervals at 100 WPM (~500 chars/min baseline)
 */

export const UPGRADES: Upgrade[] = [
  {
    id: 1,
    name: 'Vowel Power',
    description: 'All vowels give 3× score',
    costs: [75, 1500], 
    effect: VOWEL_MULTIPLIER,
    values: [3,5],
    requisiteIds: []
  },
  {
    id: 2,
    name: 'Consonant Boost',
    description: 'All consonants give 3× score',
    costs: [75, 1500], 
    effect: CONSONANT_MULTIPLIER,
    values: [3,5],
    requisiteIds: []
  },
  {
    id: 3,
    name: 'Keyboard Upgrade',
    description: 'All keys are worth more (base 1 → 5)',
    costs: [400, 10000],
    effect: BASE_SCORE,
    values: [5,20],
    requisiteIds: [1]
  },
  {
    id: 4,
    name: 'Combo System',
    description: 'Unlocks 3× combo at 60 WPM',
    costs: [5000, 20000], // ~80 seconds
    effect: COMBO_UNLOCK,
    values: [60, 80],
    requisiteIds: [1,2,3]
  },
  {
    id: 5,
    name: 'Combo Efficiency',
    description: '3× combo threshold lowered to 40 WPM',
    costs: [10000], 
    effect: COMBO_THRESHOLD,
    values: [40],
    requisiteIds: [4]
  },
  {
    id: 6,
    name: 'Unbreakable Focus',
    description: 'Mistakes no longer disable combos',
    costs: [30000],
    effect: COMBO_NO_BREAK,
    values: [1],
    requisiteIds: [4]
  }
];

/**
 * Helper function to get upgrade by ID
 */
export function getUpgradeById(id: number): Upgrade | undefined {
  return UPGRADES.find(upgrade => upgrade.id === id);
}

/**
 * Check if all prerequisites for an upgrade are met
 */
export function canPurchaseUpgrade(
  upgrade: Upgrade,
  purchasedUpgrades: number[][]
): boolean {
  const purchasedUpgradeIds = purchasedUpgrades.map(u => u[0]);
  return upgrade.requisiteIds.every(reqId => purchasedUpgradeIds.includes(reqId));
}

/**
 * Get names of prerequisite upgrades
 */
export function getPrerequisiteNames(upgrade: Upgrade): string[] {
  return upgrade.requisiteIds
    .map(id => getUpgradeById(id)?.name)
    .filter((name): name is string => name !== undefined);
}
