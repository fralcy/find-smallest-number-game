import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/GameplayScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import NumberBox from '../components/NumberBox';
import GameStats from '../components/GameStats';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';

import {generateGridNumbers, generateFreeNumbers, shuffleGridNumbers, shuffleFreeNumbers} from '../utils/GameLogic';


const GameplayScreen = () => {
  const { type, mode } = useParams(); // type: 'grid' or 'free', mode: 'campaign', 'custom', or 'zen'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Game context
  const { getGameSettings, saveHighScore, updateLevelProgress, audioManager } = useGameContext();
  
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

    if (location.state?.gameSettings) {
      // Sử dụng dữ liệu từ location.state nếu có
      gameSettings = location.state.gameSettings;
      console.log('GameplayScreen - Received gameSettings from location.state:', gameSettings);
    } else {
      // Nếu không có dữ liệu, lấy từ GameContext hoặc khởi tạo mặc định
      const level = mode === 'campaign' ? 1 : null; // Mặc định level 1 cho campaign
      gameSettings = getGameSettings(type, mode, level);
      console.log('GameplayScreen - Fallback to default gameSettings:', gameSettings);
    }

    setSettings(gameSettings);
    setTimeLeft(gameSettings.totalTime);
  }, [type, mode, location, getGameSettings]);
  
  // Generate numbers for the grid or free mode when settings are loaded
  useEffect(() => {
    if (!settings.minNumber || !settings.maxNumber) return;
    
    if (type === 'grid') {
      const {numbers, target} = generateGridNumbers(settings, mode);
      setGridNumbers(numbers);
      setTargetNumber(target);
    } else {
      const {numbers, target} = generateFreeNumbers(settings, mode);
      setFreeNumbers(numbers);
      setTargetNumber(target);
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
  }, [gameStarted, isPaused, mode, audioManager]);
  
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
        generateGridNumbers(); // Tạo grid mới
      }
    } else {
      // Wrong number
      handleWrongNumber();
      
      // Nếu là Zen mode, xáo trộn grid sau khi chọn sai
      if (mode === 'zen') {
        const shuffled = shuffleGridNumbers(gridNumbers);
        setGridNumbers(shuffled);
      }
    }
  };
  
  // Handle number click in free mode
  const handleFreeNumberClick = (numberObj, index) => {
    if (isPaused) return;
  
    if (numberObj.value === targetNumber) {
      // Correct number
      handleCorrectNumber(numberObj.value);
  
      // Nếu là Zen mode, tạo danh sách số mới
      if (mode === 'zen') {
        generateFreeNumbers(); // Gọi lại hàm generateFreeNumbers
      }
    } else {
      // Wrong number
      handleWrongNumber();
  
      // Nếu là Zen mode, chỉ xáo trộn vị trí các số
      if (mode === 'zen') {
        const shuffled = shuffleFreeNumbers(freeNumbers);
        setFreeNumbers(shuffled);
      }
    }
  };
  
  // Handle when player finds correct number
  const handleCorrectNumber = (number) => {
    // Phát âm thanh đúng
    audioManager.play('correct');
    
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
    // Phát âm thanh sai
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
  
  const handlePauseClick = () => {
    setIsPaused(true);
    if (timer) clearInterval(timer);

    // Phát âm thanh nút bấm
    audioManager.play('button');
  
    // Điều hướng đến SettingsScreen với dữ liệu gameplay
    navigate('/settings', { 
      state: { 
        fromGameplay: true, 
        type, 
        mode,
        score, // Điểm số hiện tại
        timeLeft, // Thời gian còn lại
        settings // Cài đặt gameplay
      } 
    });
  };
  
  // Function to handle game completion (win)
  const handleGameComplete = () => {
    if (timer) clearInterval(timer);

    // Phát âm thanh hoàn thành màn chơi
    audioManager.play('win');
    
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

    // Phát âm thanh hết thời gian
    audioManager.play('lose');
    
    const stars = calculateStars(); // Tính số sao dựa trên hiệu suất
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'timeout',
        score,
        usedTime: settings.totalTime, // All time was used
        timeRemaining: 0,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: stars
      }
    });
  };

  // Function to handle running out of lives (zen mode)
  const handleLifeOut = () => {
    if (timer) clearInterval(timer);

    // Phát âm thanh hết mạng
    audioManager.play('lose');
    
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
    const totalNumbers = type === 'grid' ? gridNumbers.length : freeNumbers.length;
    const foundPercentage = (numbersFound / totalNumbers) * 100; // Tỷ lệ số đã tìm thấy
    const timePercentage = ((settings.totalTime - timeLeft) / settings.totalTime) * 100; // Tỷ lệ thời gian đã sử dụng
  
    // Kết hợp tỷ lệ số đã tìm thấy và thời gian đã sử dụng
    const performanceScore = (foundPercentage * 0.7) + ((100 - timePercentage) * 0.3);
  
    if (performanceScore > 80) return 3; // Hiệu suất cao
    if (performanceScore > 50) return 2; // Hiệu suất trung bình
    return 1; // Hiệu suất thấp
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
            {t('find')} <span className={styles.targetNumber}>{targetNumber}</span>
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