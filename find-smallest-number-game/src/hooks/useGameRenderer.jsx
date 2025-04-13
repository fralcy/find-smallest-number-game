/**
 * Custom hook to handle game rendering:
 * - Render grid or free mode game elements
 * - Apply styling and layout based on game mode
 * - Set up click handlers for number boxes
 * - Support for duplicate numbers and distracting numbers
 *
 * This hook separates UI rendering logic from the main component.
 */
import React from 'react';
import styles from '../styles/GameplayScreen.module.css';
import NumberBox from '../components/NumberBox';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

export const useGameRenderer = (
  type,
  mode,
  settings,
  targetNumber,
  gridNumbers,
  freeNumbers,
  foundNumbers,
  foundIndices,
  handleGridNumberClick,
  handleFreeNumberClick,
  getDifficulty
) => {
  // Render grid mode
  const renderGridMode = () => {
    const difficulty = getDifficulty();
    const isZenMode = mode === 'zen';
    const gridSizeClass = 
      difficulty === DIFFICULTY_LEVELS.EASY 
        ? styles.easyGrid 
        : difficulty === DIFFICULTY_LEVELS.NORMAL 
          ? styles.normalGrid 
          : styles.hardGrid;
    
    return (
      <div className={styles.gridContainer}>
        <div 
          className={`${styles.grid} ${gridSizeClass}`}
          style={{ 
            gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${settings.gridSize}, 1fr)`,
            animation: isZenMode ? 'none' : undefined // Loại bỏ hiệu ứng rung lắc trong Zen mode
          }}
        >
          {gridNumbers.map((number, index) => (
            <NumberBox
              key={`${index}-${number}`}
              number={number}
              isTarget={number === targetNumber}
              isFound={foundIndices.includes(index)}
              onClick={() => handleGridNumberClick(number, index)}
              difficulty={difficulty}
              isZenMode={isZenMode}
            />
          ))}
        </div>
      </div>
    );
  };
  
  // Render free mode
  const renderFreeMode = () => {
    const difficulty = getDifficulty();
    const isZenMode = mode === 'zen';
    const containerClass = 
      difficulty === DIFFICULTY_LEVELS.EASY 
        ? styles.easyFreeContainer 
        : difficulty === DIFFICULTY_LEVELS.NORMAL 
          ? styles.normalFreeContainer 
          : styles.hardFreeContainer;
    
    return (
      <div 
        className={`${styles.freeContainer} ${containerClass}`}
        style={{
          animation: isZenMode ? 'none' : undefined // Loại bỏ hiệu ứng rung lắc trong Zen mode
        }}
      >
        {freeNumbers.map((numberObj, index) => (
          <div
            key={index}
            className={styles.freeNumberWrapper}
            style={{
              left: `${numberObj.x}%`,
              top: `${numberObj.y}%`
            }}
          >
            <NumberBox
              number={numberObj.value}
              isTarget={numberObj.value === targetNumber}
              isFound={foundIndices.includes(index)}
              onClick={() => handleFreeNumberClick(numberObj, index)}
              difficulty={difficulty}
              isZenMode={isZenMode}
            />
          </div>
        ))}
      </div>
    );
  };

  return {
    renderGridMode,
    renderFreeMode
  };
}