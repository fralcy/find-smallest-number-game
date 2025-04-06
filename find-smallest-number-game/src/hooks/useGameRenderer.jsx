/**
 * Custom hook to handle game rendering:
 * - Render grid or free mode game elements
 * - Apply styling and layout based on game mode
 * - Set up click handlers for number boxes
 *
 * This hook separates UI rendering logic from the main component.
 */
import React from 'react';
import styles from '../styles/GameplayScreen.module.css';
import NumberBox from '../components/NumberBox';

export const useGameRenderer = (
  type,
  mode,
  settings,
  targetNumber,
  gridNumbers,
  freeNumbers,
  foundNumbers,
  handleGridNumberClick,
  handleFreeNumberClick,
  getDifficulty
) => {
  // Render grid mode
  const renderGridMode = () => {
    return (
      <div className={styles.gridContainer}>
        <div 
          className={styles.grid}
          style={{ 
            gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${settings.gridSize}, 1fr)`
          }}
        >
          {gridNumbers.map((number, index) => (
            <NumberBox
              key={`${index}-${number}`}
              number={number}
              isTarget={number === targetNumber}
              isFound={mode === 'zen' ? false : foundNumbers.includes(number)}
              onClick={() => handleGridNumberClick(number, index)}
              difficulty={getDifficulty(settings)}
            />
          ))}
        </div>
      </div>
    );
  };
  
  // Render free mode
  const renderFreeMode = () => {
    return (
      <div className={styles.freeContainer}>
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
              isFound={mode === 'zen' ? false : foundNumbers.includes(numberObj.value)}
              onClick={() => handleFreeNumberClick(numberObj, index)}
              difficulty={getDifficulty(settings)}
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