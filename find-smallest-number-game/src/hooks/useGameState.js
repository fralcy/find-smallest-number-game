import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

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
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'timeout', 'complete'
  
  // Get difficulty from settings
  const getDifficulty = useCallback(() => {
    return settings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  }, [settings]);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameStarted && !isPaused && mode !== 'zen' && gameStatus === 'playing') {
      const countdown = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setGameStatus('timeout');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimer(countdown);
      
      return () => clearInterval(countdown);
    }
  }, [gameStarted, isPaused, mode, gameStatus]);
  
  // Effect to handle navigation when game completes or times out
  useEffect(() => {
    if (gameStatus === 'complete') {
      // Calculate stars for completion
      const stars = calculateStars('finish');
      
      // Save high score
      if (typeof saveHighScore === 'function') {
        saveHighScore(type, mode, score);
      }
      
      // Update level progress if in campaign mode
      if (mode === 'campaign' && typeof updateLevelProgress === 'function') {
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
    } 
    else if (gameStatus === 'timeout') {
      // Play timeout sound
      audioManager.play('lose');
      
      // Calculate stars for timeout
      const totalNumbers = type === 'grid' ? 
        settings.gridSize * settings.gridSize : 
        settings.maxNumbers;
      
      const completionRate = (numbersFound / totalNumbers) * 100;
      
      // Calculate stars based on completion rate when timeout occurs
      let timeoutStars = 0;
      const difficulty = getDifficulty();
      
      // Thresholds for timeout stars
      const timeoutThresholds = {
        [DIFFICULTY_LEVELS.EASY]: { two: 80, one: 50 },
        [DIFFICULTY_LEVELS.NORMAL]: { two: 75, one: 40 },
        [DIFFICULTY_LEVELS.HARD]: { two: 70, one: 30 }
      };
      
      const threshold = timeoutThresholds[difficulty] || timeoutThresholds[DIFFICULTY_LEVELS.NORMAL];
      
      // Calculate stars - max 2 stars when timeout occurs normally
      if (completionRate >= threshold.two) timeoutStars = 2;
      else if (completionRate >= threshold.one) timeoutStars = 1;
      else timeoutStars = 0;
      
      // Special case: if they found all numbers but ran out of time, give 3 stars
      if (numbersFound >= totalNumbers) {
        timeoutStars = 3;
      }
      
      // Save high score
      if (typeof saveHighScore === 'function') {
        saveHighScore(type, mode, score);
      }
      
      // Update level progress if in campaign mode
      if (mode === 'campaign' && typeof updateLevelProgress === 'function') {
        updateLevelProgress(type, settings.level, timeoutStars);
      }
      
      // Navigate to results screen
      navigate('/result', {
        state: {
          type,
          mode,
          outcome: 'timeout',
          score, // Keep the current score (don't reset to 0)
          usedTime: settings.totalTime,
          timeRemaining: 0,
          level: mode === 'campaign' ? settings.level : undefined,
          stars: timeoutStars, // Use calculated stars
          gameSettings: settings
        }
      });
    }
  }, [gameStatus, score, timeLeft, settings, type, mode, navigate, saveHighScore, updateLevelProgress, getDifficulty, audioManager, numbersFound]);

  // Helper function to calculate stars based on performance
  const calculateStars = useCallback((outcome = 'finish') => {
    // For Zen mode, no stars
    if (mode === 'zen') return 0;
    
    // If not completed (timeout or abandoned), return 0 stars
    if (outcome !== 'finish') return 0;
    
    const difficulty = getDifficulty();
    const totalNumbers = type === 'grid' ? 
      settings.gridSize * settings.gridSize : 
      settings.maxNumbers;
      
    // Calculate completion rate (%)
    const completionRate = (numbersFound / totalNumbers) * 100;
    
    // If no numbers found, return 0 stars
    if (completionRate === 0) return 0;
    
    // Calculate time remaining rate (%)
    const timeRemainingRate = (timeLeft / settings.totalTime) * 100;
  
    // Calculate performance score based on numbers found and time remaining
    // Numbers found matters more than time (70/30 ratio)
    let performanceScore = (completionRate * 0.7) + (timeRemainingRate * 0.3);
    
    // Adjust thresholds based on difficulty
    let thresholds = {
      [DIFFICULTY_LEVELS.EASY]: { three: 85, two: 60, one: 30 },
      [DIFFICULTY_LEVELS.NORMAL]: { three: 80, two: 50, one: 20 },
      [DIFFICULTY_LEVELS.HARD]: { three: 70, two: 40, one: 10 }
    };
    
    const threshold = thresholds[difficulty] || thresholds[DIFFICULTY_LEVELS.NORMAL];
  
    // Check each threshold and return appropriate stars
    if (performanceScore >= threshold.three) return 3;
    if (performanceScore >= threshold.two) return 2;
    if (performanceScore >= threshold.one) return 1;
    
    // Default to 0 stars if no thresholds met
    return 0;
  }, [mode, getDifficulty, type, settings, numbersFound, timeLeft]);

  // Function to handle game completion (win) - simplified to just set the status
  const handleGameComplete = useCallback(() => {
    if (timer) clearInterval(timer);
    setTimer(null);
    audioManager.play('win');
    setGameStatus('complete');
  }, [timer, audioManager]);

  // Function to handle timeout - simplified to just set the status
  const handleTimeout = useCallback(() => {
    if (timer) clearInterval(timer);
    setTimer(null);
    setGameStatus('timeout');
  }, [timer]);

  // Function to handle running out of lives (zen mode)
  const handleLifeOut = useCallback(() => {
    if (timer) clearInterval(timer);
    setTimer(null);
    
    // Play life out sound
    audioManager.play('lose');
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'lifeout',
        score,
        level: undefined,
        stars: 0, // No stars for running out of lives
        gameSettings: settings
      }
    });
  }, [timer, audioManager, navigate, type, mode, score, settings]);

  // Handle pause button click
  const handlePauseClick = useCallback(() => {
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
        settings,
        lives: mode === 'zen' ? lives : undefined
      } 
    });
  }, [timer, audioManager, navigate, type, mode, score, timeLeft, settings, lives]);

  // Reset game state
  const resetGameState = useCallback(() => {
    setScore(0);
    setNumbersFound(0);
    setGameStarted(true);
    setTimeLeft(settings.totalTime);
    setGameStatus('playing');
  }, [settings]);

  return {
    isPaused,
    setIsPaused,
    score,
    setScore,
    timeLeft,
    setTimeLeft,
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
    resetGameState,
    gameStatus
  };
};