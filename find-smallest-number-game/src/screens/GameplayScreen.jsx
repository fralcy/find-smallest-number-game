import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/GameplayScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import NumberBox from '../components/NumberBox';
import GameStats from '../components/GameStats';
import { useGameContext } from '../contexts/GameContext';

const GameplayScreen = () => {
  const { type, mode } = useParams(); // type: 'grid' or 'free', mode: 'campaign', 'custom', or 'zen'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Game context
  const { getGameSettings, saveHighScore, updateLevelProgress } = useGameContext();
  
  // Game settings
  const [settings, setSettings] = useState({
    minNumber: 1,
    maxNumber: 100,
    gridSize: 5, // Default for grid mode
    maxNumbers: 20, // Default for free mode
    timePerNumber: 5, // seconds
    totalTime: 100, // seconds
    level: 1, // for campaign mode
  });
  
  // Game state
  const [isPaused, setIsPaused] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [targetNumber, setTargetNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [lives, setLives] = useState(3); // For zen mode
  const [gameStarted, setGameStarted] = useState(false);
  const [numbersFound, setNumbersFound] = useState(0);
  
  // Grid state (for grid mode)
  const [gridNumbers, setGridNumbers] = useState([]);
  const [foundNumbers, setFoundNumbers] = useState([]);
  
  // Free mode state
  const [freeNumbers, setFreeNumbers] = useState([]);
  
  // Timer reference
  const [timer, setTimer] = useState(null);
  
  // Load game settings from context
  useEffect(() => {
    // Lấy level từ location state nếu đến từ campaign
    const level = location.state?.gameSettings?.level || null;
    
    // Lấy cài đặt game từ context
    const gameSettings = getGameSettings(type, mode, level);
    
    setSettings(gameSettings);
    setTimeLeft(gameSettings.totalTime);
  }, [type, mode, location, getGameSettings]);
  
  // Generate numbers for the grid or free mode when settings are loaded
  useEffect(() => {
    if (!settings.minNumber || !settings.maxNumber) return;
    
    if (type === 'grid') {
      generateGridNumbers();
    } else {
      generateFreeNumbers();
    }
    
    // Reset game state
    setScore(0);
    setNumbersFound(0);
    setFoundNumbers([]);
    setGameStarted(true);
    
  }, [settings, type]);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameStarted && !isPaused) {
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
  }, [gameStarted, isPaused]);
  
  // Track current smallest number
  useEffect(() => {
    if (type === 'grid' && gridNumbers.length > 0) {
      updateTargetNumber();
    } else if (type === 'free' && freeNumbers.length > 0) {
      updateTargetNumber();
    }
  }, [gridNumbers, freeNumbers, foundNumbers]);
  
  // Function to generate random numbers for grid
  const generateGridNumbers = () => {
    const { minNumber, maxNumber, gridSize } = settings;
    const totalCells = gridSize * gridSize;
    
    // Generate unique random numbers
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < totalCells) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    
    setGridNumbers(Array.from(uniqueNumbers));
    setTargetNumber(Math.min(...uniqueNumbers));
  };
  
  // Function to generate random numbers for free mode
  const generateFreeNumbers = () => {
    const { minNumber, maxNumber, maxNumbers } = settings;
    
    // Generate unique random numbers
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < maxNumbers) {
      uniqueNumbers.add(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
    }
    
    // Create array with position for each number
    const numbersWithPosition = Array.from(uniqueNumbers).map(value => ({
      value,
      x: Math.random() * 80 + 10, // percentage position (10% to 90%)
      y: Math.random() * 70 + 15  // percentage position (15% to 85%)
    }));
    
    setFreeNumbers(numbersWithPosition);
    setTargetNumber(Math.min(...uniqueNumbers));
  };
  
  // Function to update the target number (smallest number that hasn't been found)
  const updateTargetNumber = () => {
    if (type === 'grid') {
      // Filter out numbers that have already been found
      const remainingNumbers = gridNumbers.filter(num => !foundNumbers.includes(num));
      
      if (remainingNumbers.length === 0) {
        // All numbers found, game complete
        handleGameComplete();
        return;
      }
      
      // Find the smallest remaining number
      const smallestNumber = Math.min(...remainingNumbers);
      setTargetNumber(smallestNumber);
    } else {
      // Similar logic for free mode
      const remainingNumbers = freeNumbers
        .map(item => item.value)
        .filter(num => !foundNumbers.includes(num));
      
      if (remainingNumbers.length === 0) {
        // All numbers found, game complete
        handleGameComplete();
        return;
      }
      
      // Find the smallest remaining number
      const smallestNumber = Math.min(...remainingNumbers);
      setTargetNumber(smallestNumber);
    }
  };
  
  // Handle number click in grid mode
  const handleGridNumberClick = (number, index) => {
    if (isPaused) return;
    
    if (number === targetNumber) {
      // Correct number
      handleCorrectNumber(number);
    } else {
      // Wrong number
      handleWrongNumber();
    }
  };
  
  // Handle number click in free mode
  const handleFreeNumberClick = (numberObj, index) => {
    if (isPaused) return;
    
    if (numberObj.value === targetNumber) {
      // Correct number
      handleCorrectNumber(numberObj.value);
    } else {
      // Wrong number
      handleWrongNumber();
    }
  };
  
  // Handle when player finds correct number
  const handleCorrectNumber = (number) => {
    // Update found numbers
    setFoundNumbers(prev => [...prev, number]);
    
    // Update score based on time spent
    const pointsForNumber = Math.ceil(timeLeft / 10);
    setScore(prevScore => prevScore + pointsForNumber);
    
    // Track progress
    setNumbersFound(prev => prev + 1);
    
    // Check if the game is complete
    if (type === 'grid' && foundNumbers.length + 1 === gridNumbers.length) {
      handleGameComplete();
    } else if (type === 'free' && foundNumbers.length + 1 === freeNumbers.length) {
      handleGameComplete();
    }
  };
  
  // Handle when player clicks wrong number
  const handleWrongNumber = () => {
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
  
  const handlePauseClick = () => {
    setIsPaused(true);
    if (timer) clearInterval(timer);
    
    // Navigate to settings screen
    navigate('/settings', { 
      state: { 
        fromGameplay: true, 
        type, 
        mode,
        returnToGame: true
      } 
    });
  };
  
  // Function to handle game completion (win)
  const handleGameComplete = () => {
    if (timer) clearInterval(timer);
    
    // Tính toán số sao đạt được
    const stars = calculateStars();
    
    // Lưu điểm cao
    saveHighScore(type, mode, score);
    
    // Cập nhật tiến trình level nếu là campaign
    if (mode === 'campaign') {
      updateLevelProgress(type, settings.level, stars);
    }
    
    // Chuyển đến màn hình kết quả
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'finish',
        score,
        usedTime: settings.totalTime - timeLeft, // Convert from remaining time to used time
        timeRemaining: timeLeft,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: stars
      }
    });
  };

  // Function to handle timeout
  const handleTimeout = () => {
    if (timer) clearInterval(timer);
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'timeout',
        score,
        usedTime: settings.totalTime, // All time was used
        timeRemaining: 0,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: calculateStars()
      }
    });
  };

  // Function to handle running out of lives (zen mode)
  const handleLifeOut = () => {
    if (timer) clearInterval(timer);
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'lifeout',
        score,
        level: undefined,
        stars: undefined
      }
    });
  };

  // Helper function to calculate stars based on performance
  const calculateStars = () => {
    // Calculate based on percentage of time remaining
    const timePercentage = (timeLeft / settings.totalTime) * 100;
    
    if (timePercentage > 70) return 3;
    if (timePercentage > 40) return 2;
    return 1;
  };
  
  // Xác định độ khó dựa vào level hoặc settings
  const getDifficulty = () => {
    if (mode === 'campaign') {
      if (settings.level <= 3) return 'easy';
      if (settings.level <= 7) return 'normal';
      return 'hard';
    }
    return 'normal';
  };

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
              key={index}
              number={number}
              isTarget={number === targetNumber}
              isFound={foundNumbers.includes(number)}
              onClick={() => handleGridNumberClick(number, index)}
              difficulty={getDifficulty()}
            />
          ))}
        </div>
      </div>
    );
  };
  
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
              isFound={foundNumbers.includes(numberObj.value)}
              onClick={() => handleFreeNumberClick(numberObj, index)}
              difficulty={getDifficulty()}
            />
          </div>
        ))}
      </div>
    );
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <button 
          className={styles.pauseButton}
          onClick={handlePauseClick}
        >
          ⏸️
        </button>
        
        <div className={styles.instructionText}>
          Find <span className={styles.targetNumber}>{targetNumber}</span>
        </div>
      </div>
      
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
        
        {/* Hiển thị thông tin trò chơi */}
        <GameStats
          score={score}
          timeLeft={timeLeft}
          totalTime={settings.totalTime}
          lives={lives}
          mode={mode}
          level={settings.level}
          type={type}
          numbersFound={foundNumbers.length}
          totalNumbers={type === 'grid' ? gridNumbers.length : freeNumbers.length}
        />
      </div>
    </div>
  );
};

export default GameplayScreen;