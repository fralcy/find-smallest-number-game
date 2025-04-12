import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/GameplayScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import GameStats from '../components/GameStats';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import { useGameState } from '../hooks/useGameState';
import { useGameEvents } from '../hooks/useGameEvents';
import { useNumberGeneration } from '../hooks/useNumberGeneration';
import { useGameRenderer } from '../hooks/useGameRenderer';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

const GameplayScreen = () => {
  const { type, mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGameSettings, saveHighScore, updateLevelProgress, audioManager } = useGameContext();
  const [timeAdjustment, setTimeAdjustment] = useState(0); // Để điều chỉnh thời gian khi trả lời sai
  
  // Load game settings
  const settings = location.state?.gameSettings || getGameSettings(type, mode, mode === 'campaign' ? 1 : null);

  // Thêm state để theo dõi thông tin về độ khó
  const [shouldShowTargetNumber, setShouldShowTargetNumber] = useState(true);
  const [distractingWarningVisible, setDistractingWarningVisible] = useState(false);
  
  // Lấy độ khó từ settings
  const getDifficulty = () => {
    return settings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  };

  // Quản lý trạng thái game
  const {
    isPaused,
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
  } = useGameState(settings, type, mode, audioManager, saveHighScore, updateLevelProgress);

  // Quản lý số
  const {
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    setFoundNumbers,
    distractingNumbers,
    generateGridNumbers,
    generateFreeNumbers,
    shuffleGridNumbers,
    shuffleFreeNumbers,
    updateTargetNumber,
  } = useNumberGeneration(settings, type, mode);

  // Xử lý sự kiện game
  const { 
    handleGridNumberClick, 
    handleFreeNumberClick,
    showTargetNumber, // State để kiểm soát hiển thị target number
    comboCount, // Biến để theo dõi combo
    consecutiveWrong, // Biến để theo dõi số lần sai liên tiếp
    foundIndices, // Danh sách vị trí đã tìm thấy
    getDistractingWarning // Hàm lấy thông báo về số gây xao nhãng
  } = useGameEvents(
    type,
    mode,
    audioManager,
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    setFoundNumbers,
    distractingNumbers,
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
    shuffleFreeNumbers,
    settings
  );
  
  // Cập nhật thời gian dựa trên điều chỉnh
  useEffect(() => {
    if (timeAdjustment !== 0 && mode !== 'zen') {
      setTimeLeft(prev => Math.max(1, prev + timeAdjustment));
      setTimeAdjustment(0);
    }
  }, [timeAdjustment, mode, setTimeLeft]);

  // Render phần tử game
  const { renderGridMode, renderFreeMode } = useGameRenderer(
    type,
    mode,
    settings,
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    foundIndices,
    handleGridNumberClick,
    handleFreeNumberClick,
    getDifficulty
  );

  // Khởi tạo game
  useEffect(() => {
    if (type === 'grid') {
      generateGridNumbers();
    } else {
      generateFreeNumbers();
    }
    setGameStarted(true);
    
    // Xử lý hiển thị target number dựa vào độ khó
    const difficulty = getDifficulty();
    if (difficulty === DIFFICULTY_LEVELS.EASY) {
      setShouldShowTargetNumber(true);
    } else if (difficulty === DIFFICULTY_LEVELS.NORMAL || difficulty === DIFFICULTY_LEVELS.HARD) {
      // Với normal và hard, không hiển thị target number ngay từ đầu
      setShouldShowTargetNumber(false);
    }
  }, [type, generateGridNumbers, generateFreeNumbers, setGameStarted, getDifficulty]);
  
  // Hiệu ứng để kiểm soát hiển thị target number dựa vào số đã tìm thấy và độ khó
  useEffect(() => {
    const difficulty = getDifficulty();
    
    // Ẩn target number cho Normal và Hard
    if ((difficulty === DIFFICULTY_LEVELS.NORMAL || difficulty === DIFFICULTY_LEVELS.HARD) && foundNumbers.length >= 0) {
      setShouldShowTargetNumber(false);
    }
  }, [foundNumbers.length, getDifficulty]);
  
  // Hiệu ứng để hiển thị cảnh báo số gây xao nhãng
  useEffect(() => {
    const warning = getDistractingWarning();
    if (warning) {
      setDistractingWarningVisible(true);
      
      // Ẩn cảnh báo sau 5 giây
      const timer = setTimeout(() => {
        setDistractingWarningVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [getDistractingWarning, distractingNumbers]);
  
  // Hiển thị combo trên màn hình nếu có
  const renderComboText = () => {
    if (comboCount >= 3) {
      const comboLevel = Math.floor(comboCount / 3);
      return (
        <div className={styles.comboText}>
          {t('combo')} x{comboLevel + 1}
        </div>
      );
    }
    return null;
  };
  
  // Hiển thị thông báo "Tìm số tiếp theo!" khi số đích bị ẩn
  const renderNextNumberText = () => {
    if (!shouldShowTargetNumber || !showTargetNumber) {
      return (
        <div className={styles.infoText}>
          {t('findNext')}
        </div>
      );
    }
    return null;
  };
  
  // Hiển thị cảnh báo khi có số trùng lặp hoặc số gây xao nhãng
  const renderDistractingWarning = () => {
    if (distractingWarningVisible && distractingNumbers.length > 0) {
      return (
        <div className={styles.distractingWarning}>
          {t('duplicateNumbersWarning')}
        </div>
      );
    }
    return null;
  };

  // Lấy class CSS dựa vào độ khó
  const getDifficultyClass = () => {
    const difficulty = getDifficulty();
    return styles[difficulty] || '';
  };

  return (
    <div className={`${styles.container} ${getDifficultyClass()}`}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <button className={styles.pauseButton} onClick={handlePauseClick}>
            ⏸️
          </button>
        </div>
        <div className={styles.middleSection}>
          {(shouldShowTargetNumber && showTargetNumber) ? (
            <div className={styles.instructionText}>
              {t('find')} <span className={styles.targetNumber}>{targetNumber}</span>
            </div>
          ) : (
            <div className={styles.instructionText}>
              {t('findSmallestNumber')}
            </div>
          )}
        </div>
        <div className={styles.rightSection}>
          <GameStats 
            score={score} 
            timeLeft={timeLeft} 
            lives={lives} 
            isZenMode={mode === 'zen'} 
          />
        </div>
      </div>
      
      {/* Hiển thị combo */}
      {renderComboText()}
      
      {/* Hiển thị cảnh báo trùng lặp */}
      {renderDistractingWarning()}
      
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
    </div>
  );
};

export default GameplayScreen;