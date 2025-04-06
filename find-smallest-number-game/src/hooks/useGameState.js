/**
 * Custom hook to manage the general game state including:
 * - Score, time, lives
 * - Game flow (pausing, timeout, game completion)
 * - Result calculation
 *
 * This hook abstracts the core game state management away from the component.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGameState = (settings, type, mode, audioManager, saveHighScore, updateLevelProgress) => {
  const navigate = useNavigate();
  
  // Basic game state
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.totalTime || 100);
  const [lives, setLives] = useState(3); // For zen mode
  const [gameStarted, setGameStarted] = useState(false);
  const [numbersFound, setNumbersFound] = useState(0);
  const [timer, setTimer] = useState(null);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameStarted && !isPaused && mode !== 'zen') {
      const countdown = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimer(countdown);
      
      return () => clearInterval(countdown);
    }
  }, [gameStarted, isPaused, mode]);
  
  // Function to handle game completion (win)
  const handleGameComplete = () => {
    if (timer) clearInterval(timer);

    // Play completion sound
    audioManager.play('win');
    
    // Calculate stars earned
    const stars = calculateStars();
    
    // Save high score
    saveHighScore(type, mode, score);
    
    // Update level progress if in campaign mode
    if (mode === 'campaign') {
      updateLevelProgress(type, settings.level, stars);
    }
    
    // Navigate to results screen
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'finish',
        score,
        usedTime: settings.totalTime - timeLeft,
        timeRemaining: timeLeft,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: stars,
        gameSettings: settings
      }
    });
  };

  // Function to handle timeout
  const handleTimeout = () => {
    if (timer) clearInterval(timer);

    // Play timeout sound
    audioManager.play('lose');
    
    const stars = calculateStars();
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'timeout',
        score,
        usedTime: settings.totalTime,
        timeRemaining: 0,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: stars,
        gameSettings: settings
      }
    });
  };

  // Function to handle running out of lives (zen mode)
  const handleLifeOut = () => {
    if (timer) clearInterval(timer);

    // Play life out sound
    audioManager.play('lose');
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'lifeout',
        score,
        level: undefined,
        stars: undefined,
        gameSettings: settings
      }
    });
  };

  // Handle pause button click
  const handlePauseClick = () => {
    setIsPaused(true);
    if (timer) clearInterval(timer);

    // Play button sound
    audioManager.play('button');
  
    // Navigate to settings with current game state
    navigate('/settings', { 
      state: { 
        fromGameplay: true, 
        type, 
        mode,
        score,
        timeLeft,
        settings
      } 
    });
  };

  // Helper function to calculate stars based on performance
  const calculateStars = () => {
    const totalNumbers = type === 'grid' ? 
      settings.gridSize * settings.gridSize : 
      settings.maxNumbers;
      
    const foundPercentage = (numbersFound / totalNumbers) * 100;
    const timePercentage = ((settings.totalTime - timeLeft) / settings.totalTime) * 100;
  
    // Combine found percentage and time usage for overall score
    const performanceScore = (foundPercentage * 0.7) + ((100 - timePercentage) * 0.3);
  
    if (performanceScore > 80) return 3;
    if (performanceScore > 50) return 2;
    return 1;
  };

  // Reset game state
  const resetGameState = () => {
    setScore(0);
    setNumbersFound(0);
    setGameStarted(true);
    setTimeLeft(settings.totalTime);
  };

  return {
    isPaused,
    score,
    setScore,
    timeLeft,
    lives,
    setLives,
    gameStarted,
    setGameStarted,
    numbersFound,
    setNumbersFound,
    handleGameComplete,
    handleTimeout,
    handleLifeOut,
    handlePauseClick,
    resetGameState
  };
};