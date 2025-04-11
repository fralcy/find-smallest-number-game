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

const GameplayScreen = () => {
  const { type, mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGameSettings, saveHighScore, updateLevelProgress, audioManager } = useGameContext();
  const [timeAdjustment, setTimeAdjustment] = useState(0); // Để điều chỉnh thời gian khi trả lời sai
  
  // Load game settings
  const settings = location.state?.gameSettings || getGameSettings(type, mode, mode === 'campaign' ? 1 : null);

  // Quản lý trạng thái game
  const {
    isPaused,
    score,
    setScore,
    timeLeft,
    setTimeLeft, // Thêm setTimeLeft để có thể điều chỉnh thời gian
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
    showTargetNumber, // Thêm state để kiểm soát hiển thị target number
    getDifficulty, // Thêm hàm để xác định độ khó hiện tại
    comboCount, // Thêm biến để theo dõi combo
    consecutiveWrong // Thêm biến để theo dõi số lần sai liên tiếp
  } = useGameEvents(
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
    shuffleFreeNumbers,
    settings // Truyền settings vào để useGameEvents có thể xác định độ khó
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
  }, [type, generateGridNumbers, generateFreeNumbers, setGameStarted]);
  
  // Hiển thị combo trên màn hình nếu có
  const renderComboText = () => {
    if (comboCount >= 3) {
      const comboLevel = Math.floor(comboCount / 3);
      return (
        <div className={styles.comboText}>
          Combo x{comboLevel + 1}
        </div>
      );
    }
    return null;
  };
  
  // Hiển thị thông báo "Tìm thấy!" khi đã tìm thấy một số
  const renderFoundText = () => {
    if (numbersFound > 0 && !showTargetNumber) {
      return (
        <div className={styles.infoText}>
          {t('findNext')}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <button className={styles.pauseButton} onClick={handlePauseClick}>
            ⏸️
          </button>
        </div>
        <div className={styles.middleSection}>
          {showTargetNumber ? (
            <div className={styles.instructionText}>
              {t('find')} <span className={styles.targetNumber}>{targetNumber}</span>
            </div>
          ) : (
            renderFoundText()
          )}
        </div>
        <div className={styles.rightSection}>
          <GameStats score={score} timeLeft={timeLeft} lives={lives} isZenMode={mode === 'zen'} />
        </div>
      </div>
      
      {/* Hiển thị combo */}
      {renderComboText()}
      
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
    </div>
  );
};

export default GameplayScreen;