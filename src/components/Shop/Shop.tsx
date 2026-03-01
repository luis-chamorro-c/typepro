import React from 'react';
import { UPGRADES, canPurchaseUpgrade, getPrerequisiteNames } from '../../data/upgrades';
import styles from './Shop.module.css';

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  purchasedUpgrades: number[][];
  onPurchase: (upgradeId: number, upgradeLevel: number) => void;
}

const Shop: React.FC<ShopProps> = ({ isOpen, onClose, currentScore, purchasedUpgrades, onPurchase }) => {
  if (!isOpen) return null;

  const canAfford = (cost: number) => currentScore >= cost;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className={styles.header}>
          <h2 className={styles.title}>SHOP</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Current score display */}
        <div className={styles.scoreInfo}>
          YOUR SCORE: {currentScore.toLocaleString()}
        </div>

        {/* Upgrades list */}
        <div className={styles.upgradeList}>
          {UPGRADES.map((upgrade) => {
            const upgradeTuple = purchasedUpgrades.filter(u => u[0] === upgrade.id)[0];
            const level = upgradeTuple?.[1] || 0;
            const isPurchased = !!upgradeTuple && level === upgrade.costs.length
            const isLocked = !canPurchaseUpgrade(upgrade, purchasedUpgrades);
            const affordable = canAfford(upgrade.costs[level]);
            const prerequisites = getPrerequisiteNames(upgrade);

            const upgradeString = 'I'.repeat(level + 1);
            return (
              <div
                key={upgrade.id}
                className={`${styles.upgradeCard} ${
                  isPurchased ? styles.purchased : isLocked ? styles.locked : ''
                }`}
              >
                <div className={styles.upgradeContent}>
                  <h3 className={styles.upgradeName}>{upgrade.name} {upgradeString}</h3>
                  <p className={styles.upgradeDescription}>{upgrade.description}</p>
                  <div className={styles.upgradeCost}>
                    {isPurchased ? 'Purchased' : `Cost: ${upgrade.costs[level].toLocaleString()} points`}
                  </div>
                  {isLocked && prerequisites.length > 0 && (
                    <div className={styles.requirements}>
                      Requires: {prerequisites.join(', ')}
                    </div>
                  )}
                </div>

                {isPurchased ? (
                  <div className={styles.checkmark}>✓</div>
                ) : isLocked ? (
                  <div className={styles.lockedIcon}>🔒</div>
                ) : (
                  <button
                    className={`${styles.buyButton} ${!affordable ? styles.disabled : ''}`}
                    onClick={() => onPurchase(upgrade.id, level)}
                    disabled={!affordable}
                  >
                    BUY
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;
