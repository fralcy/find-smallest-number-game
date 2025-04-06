import React, { useEffect } from 'react';
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

  // Load game settings
  const settings = location.state?.gameSettings || getGameSettings(type, mode, mode === 'campaign' ? 1 : null);

  // Manage game state
  const {
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
  } = useGameState(settings, type, mode, audioManager, saveHighScore, updateLevelProgress);

  // Manage numbers
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

  // Handle game events
  const { handleGridNumberClick, handleFreeNumberClick } = useGameEvents(
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
  );

  // Render game elements
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
    () => mode === 'campaign' && settings.level <= 3 ? 'easy' : mode === 'zen' ? 'hard' : 'normal'
  );

  // Initialize game
  useEffect(() => {
    if (type === 'grid') {
      generateGridNumbers();
    } else {
      generateFreeNumbers();
    }
    setGameStarted(true);
  }, [type, generateGridNumbers, generateFreeNumbers, setGameStarted]);

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
          <div className={styles.instructionText}>
            {t('find')} <span className={styles.targetNumber}>{targetNumber}</span>
          </div>
        </div>
        <div className={styles.rightSection}>
          <GameStats score={score} timeLeft={timeLeft} lives={lives} isZenMode={mode === 'zen'} />
        </div>
      </div>
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
    </div>
  );
};

export default GameplayScreen;