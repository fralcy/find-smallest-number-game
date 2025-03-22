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
    gridSize: type === 'grid' && mode === 'zen' ? 9 : 5, // 9x9 cho Zen mode, 5x5 cho các mode khác
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
  
  // Load game settings from context or location state
  useEffect(() => {
    let gameSettings;

    // Nếu là Zen Mode trong Grid Mode, sử dụng cài đặt mặc định đặc biệt
    if (type === 'grid' && mode === 'zen') {
      gameSettings = {
        minNumber: 1,
        maxNumber: 100,
        gridSize: 9, // 9x9 grid cho Zen mode
        timePerNumber: 0, // Không giới hạn thời gian
        totalTime: 0
      };
    } else {
      // Lấy level từ location state nếu đến từ campaign
      const level = location.state?.gameSettings?.level || null;
      
      // Lấy cài đặt game từ context hoặc location state
      gameSettings = location.state?.gameSettings || getGameSettings(type, mode, level);
    }
    
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
  
  // Track current smallest number
  useEffect(() => { 
    if (mode !== 'zen') {
      if (type === 'grid' && gridNumbers.length > 0) {
        updateTargetNumber();
      } else if (type === 'free' && freeNumbers.length > 0) {
        updateTargetNumber();
      }
    }
  }, [gridNumbers, freeNumbers, foundNumbers, mode, type]);
  
  // Function to generate random numbers for grid
  const generateGridNumbers = () => {
    const { minNumber, maxNumber, gridSize } = settings;
    const totalCells = gridSize * gridSize;
  
    // Tạo số cần tìm ban đầu
    const target = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  
    // Tạo lưới với các số ngẫu nhiên
    const numbers = Array(totalCells).fill(null).map(() => 
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    );
  
    // Đặt số cần tìm ở một vị trí ngẫu nhiên
    const targetIndex = Math.floor(Math.random() * totalCells);
    numbers[targetIndex] = target;
  
    setGridNumbers(numbers);
    setTargetNumber(target); // Cập nhật số cần tìm
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
  
  // Hàm xáo trộn vị trí các số (cho Zen mode)
  const shuffleGridNumbers = () => {
    if (type !== 'grid' || mode !== 'zen') return;
    
    // Clone mảng hiện tại và xáo trộn
    const shuffled = [...gridNumbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setGridNumbers(shuffled);
  };
  
  // Hàm thay thế số đã tìm thấy bằng một số mới (cho Zen mode)
  const replaceFoundNumber = (number) => {
    if (type !== 'grid' || mode !== 'zen') return;
  
    const { minNumber, maxNumber } = settings;
  
    // Tạo số cần tìm mới
    let newTargetNumber;
    do {
      newTargetNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    } while (newTargetNumber === targetNumber); // Đảm bảo số mới khác số cần tìm hiện tại
  
    // Tạo số mới để thay thế số đã tìm thấy
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    } while (newNumber === number || newNumber === newTargetNumber); // Đảm bảo số mới khác số cũ và số cần tìm mới
  
    // Thay thế số tại vị trí của số đã tìm thấy
    const newGridNumbers = [...gridNumbers];
    const indexToReplace = gridNumbers.indexOf(number);
    newGridNumbers[indexToReplace] = newNumber;
  
    // Đặt số cần tìm mới ở một vị trí ngẫu nhiên
    const targetIndex = Math.floor(Math.random() * newGridNumbers.length);
    newGridNumbers[targetIndex] = newTargetNumber;
  
    // Cập nhật trạng thái
    setGridNumbers(newGridNumbers);
    setTargetNumber(newTargetNumber); // Cập nhật số cần tìm mới
  };
  
  // Function to update the target number (smallest number that hasn't been found)
  const updateTargetNumber = () => {
    if (type === 'grid') {
      // Với Zen mode, đơn giản chỉ tìm số nhỏ nhất trong mảng hiện tại
      if (mode === 'zen') {
        const smallestNumber = Math.min(...gridNumbers);
        setTargetNumber(smallestNumber);
        return;
      }
      
      // Các mode khác - lọc ra số chưa tìm thấy
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
      
      // Nếu là Zen mode, thay số đúng bằng số mới và xáo trộn grid
      if (mode === 'zen') {
        replaceFoundNumber(number);
        shuffleGridNumbers();
      }
    } else {
      // Wrong number
      handleWrongNumber();
      
      // Nếu là Zen mode, xáo trộn grid sau khi chọn sai
      if (mode === 'zen') {
        shuffleGridNumbers();
      }
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
    if (mode === 'zen') {
      // Trong Zen mode, tăng điểm mỗi khi tìm đúng
      setScore(prevScore => prevScore + 10);
  
      // Thay thế số đúng bằng số mới và cập nhật số cần tìm
      replaceFoundNumber(number);
      return;
    }
  
    // Các mode khác
    setFoundNumbers(prev => [...prev, number]);
    const pointsForNumber = Math.ceil(timeLeft / 10);
    setScore(prevScore => prevScore + pointsForNumber);
    setNumbersFound(prev => prev + 1);
  
    // Kiểm tra nếu trò chơi hoàn thành
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
    return mode === 'zen' ? 'hard' : 'normal'; // Zen mode luôn khó
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
              key={`${index}-${number}`} // Thêm number vào key để React cập nhật khi số thay đổi
              number={number}
              isTarget={number === targetNumber}
              isFound={mode === 'zen' ? false : foundNumbers.includes(number)}
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
        {/* Left Section: Pause Button */}
        <div className={styles.leftSection}>
          <button 
            className={styles.pauseButton}
            onClick={handlePauseClick}
          >
            ⏸️
          </button>
        </div>

        {/* Middle Section: Instruction Text */}
        <div className={styles.middleSection}>
          <div className={styles.instructionText}>
            Find <span className={styles.targetNumber}>{targetNumber}</span>
          </div>
        </div>

        {/* Right Section: Stats */}
        <div className={styles.rightSection}>
          <GameStats
            score={score}
            timeLeft={timeLeft}
            lives={lives}
            isZenMode={mode === 'zen'}
          />
        </div>
      </div>

      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
    </div>
  );
};

export default GameplayScreen;