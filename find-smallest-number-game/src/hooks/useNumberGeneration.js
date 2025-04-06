/**
 * Custom hook to handle number generation and management:
 * - Generating numbers for grid and free modes
 * - Tracking the target number (smallest number)
 * - Shuffle and regenerate numbers for zen mode
 * - Track found numbers
 *
 * This hook separates number management logic from the main component.
 */
import { useState, useCallback } from 'react';

export const useNumberGeneration = (settings, type, mode) => {
  const [targetNumber, setTargetNumber] = useState(null);
  const [gridNumbers, setGridNumbers] = useState([]);
  const [freeNumbers, setFreeNumbers] = useState([]);
  const [foundNumbers, setFoundNumbers] = useState([]);

  const generateGridNumbers = useCallback(() => {
    const { minNumber, maxNumber, gridSize } = settings;
    const totalCells = gridSize * gridSize;
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < totalCells) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    setGridNumbers(Array.from(uniqueNumbers));
    setTargetNumber(Math.min(...uniqueNumbers));
  }, [settings]);

  const generateFreeNumbers = useCallback(() => {
    const { minNumber, maxNumber, maxNumbers } = settings;
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < maxNumbers) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    setFreeNumbers(Array.from(uniqueNumbers).map(value => ({ value, x: Math.random() * 90, y: Math.random() * 90 })));
    setTargetNumber(Math.min(...uniqueNumbers));
  }, [settings]);

  const updateTargetNumber = useCallback((remainingNumbers) => {
    if (remainingNumbers.length > 0) {
      setTargetNumber(Math.min(...remainingNumbers));
    } else {
      setTargetNumber(null); // No numbers left
    }
  }, []);

  return {
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    setFoundNumbers,
    generateGridNumbers,
    generateFreeNumbers,
    updateTargetNumber,
  };
};