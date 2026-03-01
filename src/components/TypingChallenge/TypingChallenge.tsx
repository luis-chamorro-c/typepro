import React, { useRef, useEffect, useState } from 'react';
import PixelTypewriter from '../PixelTypewriter/PixelTypewriter';
import Shop from '../Shop/Shop';
import { useTypingTest } from '../../hooks/useTypingTest';
import { UPGRADES } from '../../data/upgrades';
import cartIcon from '../../assets/cart.svg';
import styles from './TypingChallenge.module.css';

interface TypingChallengeProps {
  text: string;
  targetScore: number;
  isCountingDown?: boolean;
  onComplete?: (finalScore: number, elapsedSeconds: number) => void;
}

const TypingChallenge: React.FC<TypingChallengeProps> = ({
  text,
  targetScore,
  isCountingDown = false,
  onComplete
}) => {
  const handleComplete = (finalScore: number, elapsedSeconds: number) => {
    if (onComplete) {
      onComplete(finalScore, elapsedSeconds);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const textPreviewRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');

  // Shop state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<number[][]>([]);

  // Cleanup threshold - only remove characters before this index
  const [cleanupThreshold, setCleanupThreshold] = useState(0);

  const {
    currentCharIndex,
    typedChars,
    score,
    lastMistake,
    startTest,
    handleKeyPress,
    adjustScore,
    expectedText,
    multipliers,
    comboState,
    currentWPM,
    devMode,
  } = useTypingTest({
    text,
    targetScore,
    purchasedUpgrades,
    onComplete: handleComplete,
  });

  // Start test when countdown completes
  useEffect(() => {
    if (!isCountingDown && inputRef.current) {
      startTest();
      inputRef.current.focus();
    }
  }, [isCountingDown, startTest]);

  // Keep input focused
  useEffect(() => {
    if (!isCountingDown && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCountingDown]);

  // Auto-scroll text as user types
  useEffect(() => {
    if (cursorRef.current && textPreviewRef.current) {
      const cursorElement = cursorRef.current;
      const container = textPreviewRef.current;

      // Get the position of the cursor relative to container
      const cursorTop = cursorElement.offsetTop;
      const containerHeight = container.clientHeight;
      const lineHeight = parseFloat(getComputedStyle(cursorElement).lineHeight || '32');

      // Scroll to keep cursor in view (centered if possible)
      const scrollTarget = cursorTop - (containerHeight / 2) + (lineHeight / 2);
      container.scrollTop = Math.max(0, scrollTarget);
    }
  }, [currentCharIndex]);

  // Handle key presses for typing and typewriter animation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = e.key;

    // Set visual key press for typewriter
    const displayKey = key === ' ' ? 'SPACE' : key.toUpperCase();
    setLastKeyPressed(displayKey);
    setTimeout(() => setLastKeyPressed(''), 100);

    // Handle the actual typing
    handleKeyPress(key);
  };

  const getCharClassName = (index: number) => {
    const hasBeenTyped = typedChars[index] !== '';
    const isCurrent = index === currentCharIndex;

    let className = '';

    if (!hasBeenTyped) {
      className = styles.char; // Untyped - dim
    } else {
      const isCorrect = typedChars[index] === expectedText[index];
      className = isCorrect ? styles.correctChar : styles.incorrectChar;
    }

    // Add current position highlight
    if (isCurrent) {
      className += ` ${styles.currentChar}`;
    }

    return className;
  };

  const getDisplayChar = (index: number) => {
    const hasBeenTyped = typedChars[index] !== '';

    if (!hasBeenTyped) {
      return expectedText[index]; // Show expected character
    }

    return typedChars[index]; // Show what user actually typed
  };

  // Shop handlers
  const handleShopToggle = () => {
    // Cleanup old characters when opening shop
    if (!isShopOpen) {
      // Remove characters more than 300 behind current position
      const newThreshold = Math.max(0, currentCharIndex - 300);
      setCleanupThreshold(newThreshold);
    }

    setIsShopOpen(!isShopOpen);

    // Restore focus to input when closing shop
    if (isShopOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handlePurchase = (upgradeId: number, upgradeLevel: number) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || upgradeLevel === upgrade.costs.length || score < upgrade.costs[upgradeLevel]) return;

    // Deduct cost from score
    adjustScore(-upgrade.costs[upgradeLevel]);

    const updatedUpgrades = purchasedUpgrades.filter(u => u[0] !== upgradeId);
    setPurchasedUpgrades([...updatedUpgrades, [upgradeId, upgradeLevel + 1]]);

    console.log(`Purchased upgrade: ${upgrade.name} (ID: ${upgradeId}). Cost: ${upgrade.costs[upgradeLevel]} points.`);
  };

  return (
    <div className={styles.container} onClick={() => inputRef.current?.focus()}>
      {/* Red Flash on Mistakes */}
      {lastMistake && <div className={styles.redFlash} />}

      {/* Score Display - Top Center (Prominent) */}
      {!isCountingDown && (
        <div className={`${styles.scoreDisplay} ${lastMistake ? styles.shake : ''}`}>
          <div className={styles.scoreLabel}>SCORE</div>
          <div className={styles.scoreValue}>{score.toLocaleString()}</div>
        </div>
      )}

      {/* Combo Indicator - Only show when active */}
      {!isCountingDown && comboState.isActive && (
        <div className={styles.comboIndicator}>
          <div className={styles.comboActive}>
            🔥 COMBO {comboState.multiplier}× 🔥
          </div>
        </div>
      )}

      {/* Dev Mode Indicator - Top Right Corner */}
      {!isCountingDown && devMode && (
        <div className={styles.devModeIndicator}>
          DEV MODE
        </div>
      )}

      {/* Shop Icon - Top Right */}
      {!isCountingDown && (
        <div className={styles.shopIcon} onClick={handleShopToggle}>
          <img src={cartIcon} alt="Shop" className={styles.shopIconImage} />
        </div>
      )}

      {/* Shop Modal */}
      <Shop
        isOpen={isShopOpen}
        onClose={handleShopToggle}
        currentScore={score}
        purchasedUpgrades={purchasedUpgrades}
        onPurchase={handlePurchase}
      />

      {/* Hidden Input Field */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        className={styles.hiddenInput}
        disabled={isCountingDown}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Top section - Text preview */}
      <div className={styles.textSection}>
        <div className={styles.textPreview} ref={textPreviewRef}>
          {text.length > 0 ? (
            (() => {
              // Render from cleanup threshold to current position + 500 ahead
              // Cleanup only happens when opening shop
              const windowStart = cleanupThreshold;
              const windowEnd = Math.min(text.length, currentCharIndex + 500);
              const chars = text.split('').slice(windowStart, windowEnd);

              return chars.map((char, offset) => {
                const index = windowStart + offset;
                return (
                  <span
                    key={index}
                    className={getCharClassName(index)}
                    ref={index === currentCharIndex ? cursorRef : null}
                  >
                    {getDisplayChar(index)}
                  </span>
                );
              });
            })()
          ) : (
            <span>Loading text...</span>
          )}
        </div>
      </div>

      {/* Bottom section - Typewriter */}
      <div className={styles.typewriterSection}>
        <PixelTypewriter greyed={isCountingDown} activeKey={lastKeyPressed} />
      </div>
    </div>
  );
};

export default TypingChallenge;
