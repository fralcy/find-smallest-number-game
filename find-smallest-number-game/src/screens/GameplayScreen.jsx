import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/GameplayScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import GameStats from '../components/GameStats';
import SettingsScreen from '../screens/SettingsScreen';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import { useGameState } from '../hooks/useGameState';
import { useGameEvents } from '../hooks/useGameEvents';
import { useNumberGeneration } from '../hooks/useNumberGeneration';
import { useGameRenderer } from '../hooks/useGameRenderer';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import pauseButtonSvg from '../assets/pause-button.svg';

const GameplayScreen = () => {
  const { type, mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGameSettings, saveHighScore, updateLevelProgress, audioManager } = useGameContext();
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  
  // Load game settings
  const settings = useMemo(() => {
    return location.state?.gameSettings || getGameSettings(type, mode, mode === 'campaign' ? 1 : null);
  }, [location.state, getGameSettings, type, mode]);

  // Other state variables
  const [shouldShowTargetNumber, setShouldShowTargetNumber] = useState(true);
  const [distractingWarningVisible, setDistractingWarningVisible] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [initialTarget, setInitialTarget] = useState(settings?.minNumber || 1);
  
  // Get difficulty from settings
  const getDifficulty = useCallback(() => {
    return settings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  }, [settings]);

  // Manage game state
  const {
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
  } = useGameState(settings, type, mode, audioManager, saveHighScore, updateLevelProgress);

  // Define our new pause handler that uses the modal
  const handlePauseClick = () => {
    audioManager.play('button');
    setIsPaused(true); // Pause the game using the setter from the hook
    setIsPauseModalOpen(true); // Show the settings modal
  };

  // Handle resume when the modal is closed
  const handleResumeGame = () => {
    setIsPauseModalOpen(false);
    setIsPaused(false); // Resume the game
  };

  // Handle end game from the settings modal
  const handleEndGame = () => {
    if (mode === 'zen') {
      // For Zen mode: navigate to result screen
      navigate('/result', {
        state: {
          type,
          mode,
          outcome: 'finish', // Player actively ended the game
          score,
          usedTime: 0,
          timeRemaining: 0,
          gameSettings: {
            ...settings,
            difficulty: DIFFICULTY_LEVELS.HARD
          }
        }
      });
    } else {
      // For Campaign and Custom mode
      navigate(`/game/${type}/${mode}`);
    }
  };

  // Manage numbers
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
    resetAndGenerateNew,
  } = useNumberGeneration(settings, type, mode);

  // Ensure targetNumber is valid
  const displayTargetNumber = targetNumber !== null ? targetNumber : initialTarget;

  // Handle game events
  const { 
    handleGridNumberClick, 
    handleFreeNumberClick,
    showTargetNumber,
    comboCount,
    consecutiveWrong,
    foundIndices,
    getDistractingWarning
  } = useGameEvents(
    type,
    mode,
    audioManager,
    displayTargetNumber,
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
  
  // Update time based on adjustment
  useEffect(() => {
    if (timeAdjustment !== 0 && mode !== 'zen') {
      setTimeLeft(prev => Math.max(1, prev + timeAdjustment));
      setTimeAdjustment(0);
    }
  }, [timeAdjustment, mode, setTimeLeft]);

  // Render game elements
  const { renderGridMode, renderFreeMode } = useGameRenderer(
    type,
    mode,
    settings,
    displayTargetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    foundIndices,
    handleGridNumberClick,
    handleFreeNumberClick,
    getDifficulty
  );

  // Initialize game
  useEffect(() => {
    if (!gameInitialized) {
      resetAndGenerateNew();
      setGameStarted(true);
      
      const difficulty = getDifficulty();
      setShouldShowTargetNumber(difficulty === DIFFICULTY_LEVELS.EASY);
      
      setGameInitialized(true);
    }
  }, [type, getDifficulty, resetAndGenerateNew, setGameStarted, gameInitialized]);

  // Update initialTarget when targetNumber changes
  useEffect(() => {
    if (targetNumber !== null) {
      setInitialTarget(targetNumber);
    }
  }, [targetNumber]);
  
  // Control target number visibility based on found numbers and difficulty
  useEffect(() => {
    const difficulty = getDifficulty();
    
    if ((difficulty === DIFFICULTY_LEVELS.NORMAL || difficulty === DIFFICULTY_LEVELS.HARD) && foundNumbers.length >= 0) {
      setShouldShowTargetNumber(false);
    }
  }, [foundNumbers.length, getDifficulty]);
  
  // Show distracting number warning
  useEffect(() => {
    const warning = getDistractingWarning();
    if (warning) {
      setDistractingWarningVisible(true);
      
      const timer = setTimeout(() => {
        setDistractingWarningVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [getDistractingWarning, distractingNumbers]);
  
  // Render combo text
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

  // Get CSS class based on difficulty
  const getDifficultyClass = () => {
    const difficulty = getDifficulty();
    return styles[difficulty] || '';
  };

  return (
    <div className={`${styles.container} ${getDifficultyClass()}`}>
      <RotateDeviceNotice />
      
      {/* Settings Modal Overlay */}
      {isPauseModalOpen && (
        <div className={styles.pauseOverlay} onClick={() => handleResumeGame()}>
          <div className={styles.settingsModalWrapper} onClick={e => e.stopPropagation()}>
            <SettingsScreen 
              fromGameplay={true} 
              type={type} 
              mode={mode} 
              score={score} 
              timeLeft={timeLeft}
              lives={lives}
              settings={settings}
              onContinue={handleResumeGame}
              onEndGame={handleEndGame}
            />
          </div>
        </div>
      )}
      
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <button className={styles.pauseButton} onClick={handlePauseClick}>
            <img src={pauseButtonSvg} alt="Pause" width="35" height="35" />
          </button>
        </div>
        <div className={styles.middleSection}>
          {(shouldShowTargetNumber && showTargetNumber) ? (
            <div className={styles.instructionText}>
              {t('find')} <span className={styles.targetNumber}>{displayTargetNumber}</span>
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
      
      {renderComboText()}
      
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
    </div>
  );
};

export default GameplayScreen;