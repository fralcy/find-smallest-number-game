/**
 * Custom hook to handle game interaction events:
 * - Process player clicks on numbers
 * - Handle correct and wrong answers
 * - Determine game difficulty
 * - Update game state based on player actions
 *
 * This hook isolates user interaction logic from the main component.
 */
import { useState } from 'react';

export const useGameEvents = (
  type, 
  mode, 
  audioManager,
  targetNumber,
  gridNumbers,
  freeNumbers,
  foundNumbers,
  setFoundNumbers,
  score,
  setScore,
  timeLeft,
  lives,
  setLives,
  setNumbersFound,
  handleGameComplete,
  handleLifeOut,
  updateTargetNumber,
  generateGridNumbers,
  generateFreeNumbers,
  shuffleGridNumbers,
  shuffleFreeNumbers
) => {
  const [currentNumber, setCurrentNumber] = useState(null);
  
  // Determine difficulty based on level or settings
  const getDifficulty = (settings) => {
    if (mode === 'campaign') {
      if (settings.level <= 3) return 'easy';
      if (settings.level <= 7) return 'normal';
      return 'hard';
    }
    return mode === 'zen' ? 'hard' : 'normal'; // Zen mode is always hard
  };

  // Handle number click in grid mode
  const handleGridNumberClick = (number, index) => {    
    if (number === targetNumber) {
      // Correct number
      handleCorrectNumber(number);
      
      // For zen mode, generate new grid after correct answer
      if (mode === 'zen') {
        generateGridNumbers();
      }
    } else {
      // Wrong number
      handleWrongNumber();
      
      // For zen mode, shuffle grid after wrong answer
      if (mode === 'zen') {
        shuffleGridNumbers();
      }
    }
  };
  
  // Handle number click in free mode
  const handleFreeNumberClick = (numberObj, index) => {
    if (numberObj.value === targetNumber) {
      // Correct number
      handleCorrectNumber(numberObj.value);
  
      // For zen mode, generate new numbers
      if (mode === 'zen') {
        generateFreeNumbers();
      }
    } else {
      // Wrong number
      handleWrongNumber();
  
      // For zen mode, shuffle number positions
      if (mode === 'zen') {
        shuffleFreeNumbers();
      }
    }
  };
  
  // Handle when player finds correct number
  const handleCorrectNumber = (number) => {
    // Play correct sound
    audioManager.play('correct');
    
    if (mode === 'zen') {
      // In zen mode, increase score for each correct answer
      setScore(prevScore => prevScore + 10);
      return;
    }
  
    // Update found numbers and target number
    setFoundNumbers(prev => {
      const updatedFoundNumbers = [...prev, number];
      
      // Update target number based on remaining numbers
      if (type === 'grid') {
        const remainingNumbers = gridNumbers.filter(num => !updatedFoundNumbers.includes(num));
        updateTargetNumber(remainingNumbers);
      } else if (type === 'free') {
        const remainingNumbers = freeNumbers
          .map(numObj => numObj.value)
          .filter(num => !updatedFoundNumbers.includes(num));
        updateTargetNumber(remainingNumbers);
      }
  
      return updatedFoundNumbers;
    });
  
    const pointsForNumber = Math.ceil(timeLeft / 10);
    setScore(prevScore => prevScore + pointsForNumber);
    setNumbersFound(prev => prev + 1);
  
    // Check if game is complete
    if (type === 'grid' && foundNumbers.length + 1 === gridNumbers.length) {
      handleGameComplete();
    } else if (type === 'free' && foundNumbers.length + 1 === freeNumbers.length) {
      handleGameComplete();
    }
  };
  
  // Handle when player clicks wrong number
  const handleWrongNumber = () => {
    // Play wrong sound
    audioManager.play('wrong');

    if (mode === 'zen') {
      // Reduce lives in zen mode
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          handleLifeOut();
        }
        return newLives;
      });
    } else {
      // Reduce score in other modes
      setScore(prev => Math.max(0, prev - 10));
    }
  };

  return {
    currentNumber,
    setCurrentNumber,
    getDifficulty,
    handleGridNumberClick,
    handleFreeNumberClick
  };
};