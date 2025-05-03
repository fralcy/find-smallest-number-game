/**
 * Custom hook to manage the general game state including:
 * - Score, time, lives
 * - Game flow (pausing, timeout, game completion)
 * - Result calculation
 */
import { useState, useEffect } from 'react';
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
  
  // Lấy độ khó từ settings
  const getDifficulty = () => {
    return settings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  };
  
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
  
  // Helper function to calculate stars based on performance
  const calculateStars = (outcome = 'finish') => {
    // Đối với Zen mode, không tính sao
    if (mode === 'zen') return 0;
    
    // Nếu chưa hoàn thành (timeout hay bỏ cuộc), trả về 0 sao
    if (outcome !== 'finish') return 0;
    
    const difficulty = getDifficulty();
    const totalNumbers = type === 'grid' ? 
      settings.gridSize * settings.gridSize : 
      settings.maxNumbers;
      
    // Tính tỷ lệ hoàn thành (%)
    const completionRate = (numbersFound / totalNumbers) * 100;
    
    // Nếu không tìm được số nào, trả về 0 sao
    if (completionRate === 0) return 0;
    
    // Tính tỷ lệ thời gian còn lại (%)
    const timeRemainingRate = (timeLeft / settings.totalTime) * 100;
  
    // Tính điểm hiệu suất dựa trên số tìm thấy và thời gian còn lại
    // Số tìm thấy quan trọng hơn thời gian (tỷ lệ 70/30)
    let performanceScore = (completionRate * 0.7) + (timeRemainingRate * 0.3);
    
    // Điều chỉnh ngưỡng yêu cầu dựa trên độ khó
    let thresholds = {
      [DIFFICULTY_LEVELS.EASY]: { three: 85, two: 60, one: 30 },
      [DIFFICULTY_LEVELS.NORMAL]: { three: 80, two: 50, one: 20 },
      [DIFFICULTY_LEVELS.HARD]: { three: 70, two: 40, one: 10 }
    };
    
    const threshold = thresholds[difficulty] || thresholds[DIFFICULTY_LEVELS.NORMAL];
  
    // Kiểm tra từng ngưỡng và đảm bảo giá trị trả về chính xác
    if (performanceScore >= threshold.three) return 3;
    if (performanceScore >= threshold.two) return 2;
    if (performanceScore >= threshold.one) return 1;
    
    // Nếu không đạt bất kỳ ngưỡng nào, trả về 0 sao
    return 0;
  };

  // Function to handle game completion (win)
  const handleGameComplete = () => {
    if (timer) clearInterval(timer);

    // Play completion sound
    audioManager.play('win');
    
    // Calculate stars earned
    const stars = calculateStars('finish');
    
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
    
    // Khi hết giờ, vẫn giữ nguyên điểm số đã đạt được
    // Điểm số hiện tại là score, không cần reset về 0
    
    // Kiểm tra xem người chơi đã tìm thấy bao nhiêu số
    const totalNumbers = type === 'grid' ? 
      settings.gridSize * settings.gridSize : 
      settings.maxNumbers;
    
    // Tính số sao dựa trên hiệu suất đã đạt được
    const completionRate = (numbersFound / totalNumbers) * 100;
    
    // Đối với timeout, dùng một thuật toán riêng để tính sao
    // dựa vào tỷ lệ hoàn thành mà không quan tâm đến thời gian
    let timeoutStars = 0;
    const difficulty = getDifficulty();
    
    // Các ngưỡng hoàn thành để đạt được sao khi hết giờ
    const timeoutThresholds = {
      [DIFFICULTY_LEVELS.EASY]: { two: 80, one: 50 },
      [DIFFICULTY_LEVELS.NORMAL]: { two: 75, one: 40 },
      [DIFFICULTY_LEVELS.HARD]: { two: 70, one: 30 }
    };
    
    const threshold = timeoutThresholds[difficulty] || timeoutThresholds[DIFFICULTY_LEVELS.NORMAL];
    
    // Tính số sao - khi timeout thì tối đa 2 sao
    if (completionRate >= threshold.two) timeoutStars = 2;
    else if (completionRate >= threshold.one) timeoutStars = 1;
    else timeoutStars = 0;
    
    // Nếu đã tìm thấy tất cả số nhưng vẫn hết giờ - vẫn đạt 3 sao
    if (numbersFound >= totalNumbers) {
      timeoutStars = 3;
    }
    
    // Save high score
    saveHighScore(type, mode, score);
    
    // Update level progress if in campaign mode
    if (mode === 'campaign') {
      updateLevelProgress(type, settings.level, timeoutStars);
    }
    
    navigate('/result', {
      state: {
        type,
        mode,
        outcome: 'timeout',
        score, // Giữ nguyên điểm số đã đạt được
        usedTime: settings.totalTime,
        timeRemaining: 0,
        level: mode === 'campaign' ? settings.level : undefined,
        stars: timeoutStars, // Số sao đã tính toán cho timeout
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
        stars: 0, // Hết mạng = 0 sao
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
        settings,
        lives: mode === 'zen' ? lives : undefined
      } 
    });
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
    resetGameState
  };
};