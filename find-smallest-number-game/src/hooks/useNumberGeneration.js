/**
 * Custom hook to handle number generation and management:
 * - Generating numbers for grid and free modes
 * - Tracking the target number (smallest number)
 * - Shuffle and regenerate numbers for zen mode
 * - Track found numbers
 */
import { useState, useCallback, useEffect } from 'react';
import { DIFFICULTY_LEVELS, HARD_MODE_DISTRACTION_COUNT } from '../constants/difficulty';
import { generateContrastingColors } from '../utils/colorUtils';

export const useNumberGeneration = (settings, type, mode) => {
  const [targetNumber, setTargetNumber] = useState(null);
  const [gridNumbers, setGridNumbers] = useState([]);
  const [freeNumbers, setFreeNumbers] = useState([]);
  const [foundNumbers, setFoundNumbers] = useState([]);
  const [colors, setColors] = useState([]);

  // Generate contrasting colors for numbers
  useEffect(() => {
    const difficulty = settings.difficulty || DIFFICULTY_LEVELS.NORMAL;
    
    if (difficulty === DIFFICULTY_LEVELS.HARD) {
      // Tạo mảng màu tương phản đẹp
      const totalNumbers = 
        type === 'grid' 
          ? settings.gridSize * settings.gridSize 
          : settings.maxNumbers;
          
      setColors(generateContrastingColors(totalNumbers));
    }
  }, [settings, type]);

  const generateGridNumbers = useCallback(() => {
    const { minNumber, maxNumber, gridSize, difficulty } = settings;
    let totalCells = gridSize * gridSize;
    const uniqueNumbers = new Set();
    
    // For hard mode, we might add some distraction numbers outside the range
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    const distractionCount = isHardMode ? HARD_MODE_DISTRACTION_COUNT : 0;
    
    // Generate main numbers within range
    while (uniqueNumbers.size < totalCells - distractionCount) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    
    // In hard mode, add some distracting numbers outside the range
    if (isHardMode && minNumber > 10) {
      for (let i = 0; i < distractionCount; i++) {
        // Distracting numbers are either smaller than minNumber or larger than maxNumber
        const outsideRange = Math.random() > 0.5
          ? Math.floor(Math.random() * minNumber)  // Smaller than minNumber
          : Math.floor(Math.random() * 1000) + maxNumber; // Larger than maxNumber
          
        uniqueNumbers.add(outsideRange);
      }
    }
    
    // Chuyển Set thành mảng và xáo trộn
    const numbersArray = Array.from(uniqueNumbers);
    const shuffled = shuffleArray([...numbersArray]);
    
    setGridNumbers(shuffled);
    setTargetNumber(Math.min(...numbersArray));
    setFoundNumbers([]);
  }, [settings]);

  const generateFreeNumbers = useCallback(() => {
    const { minNumber, maxNumber, maxNumbers, difficulty } = settings;
    const uniqueNumbers = new Set();
    
    // For hard mode, we might add some distraction numbers outside the range
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    const distractionCount = isHardMode ? HARD_MODE_DISTRACTION_COUNT : 0;
    
    // Generate main numbers
    while (uniqueNumbers.size < maxNumbers - distractionCount) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    
    // In hard mode, add distracting numbers
    if (isHardMode && minNumber > 10) {
      for (let i = 0; i < distractionCount; i++) {
        const outsideRange = Math.random() > 0.5
          ? Math.floor(Math.random() * minNumber)
          : Math.floor(Math.random() * 1000) + maxNumber;
          
        uniqueNumbers.add(outsideRange);
      }
    }
    
    const numbersArray = Array.from(uniqueNumbers);
    
    // Tạo vị trí đẹp hơn, phân phối tốt hơn và tránh chồng chéo
    setFreeNumbers(distributeNumbersEvenly(numbersArray, isHardMode));
    setTargetNumber(Math.min(...numbersArray));
    setFoundNumbers([]);
  }, [settings]);
  
  // Shuffle grid numbers
  const shuffleGridNumbers = useCallback(() => {
    setGridNumbers(shuffleArray([...gridNumbers]));
  }, [gridNumbers]);
  
  // Shuffle free numbers
  const shuffleFreeNumbers = useCallback(() => {
    // Only shuffle positions, keep values
    const values = freeNumbers.map(item => item.value);
    setFreeNumbers(distributeNumbersEvenly(values, settings.difficulty === DIFFICULTY_LEVELS.HARD));
  }, [freeNumbers, settings.difficulty]);
  
  // Update target number based on remaining numbers
  const updateTargetNumber = useCallback((remainingNumbers) => {
    if (remainingNumbers.length > 0) {
      setTargetNumber(Math.min(...remainingNumbers));
    } else {
      setTargetNumber(null); // No numbers left
    }
  }, []);
  
  // Helper function to shuffle an array (Fisher-Yates)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Distribute numbers evenly across the screen for free mode
  const distributeNumbersEvenly = (values, isHardMode) => {
    const result = [];
    const gridSize = Math.ceil(Math.sqrt(values.length));
    const cellSize = 100 / gridSize;
    
    // Create a grid layout but with random variation within each cell
    values.forEach((value, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Base position (center of the cell)
      let x = (col * cellSize) + (cellSize / 2);
      let y = (row * cellSize) + (cellSize / 2);
      
      // Add random variation
      const variation = isHardMode ? cellSize * 0.4 : cellSize * 0.3;
      x += (Math.random() * variation) - (variation / 2);
      y += (Math.random() * variation) - (variation / 2);
      
      // Ensure numbers stay within screen bounds
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      
      result.push({ value, x, y });
    });
    
    return result;
  };

  return {
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    setFoundNumbers,
    generateGridNumbers,
    generateFreeNumbers,
    shuffleGridNumbers,
    shuffleFreeNumbers,
    updateTargetNumber,
  };
};