import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/ResultScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { audioManager, getGameSettings, gridLevels, freeLevels } = useGameContext();
  
  // Get data from location state
  const { 
    type = 'grid',
    mode = 'campaign',
    outcome = 'finish',
    score = 0,
    usedTime = 0,
    timeRemaining = 0,
    level = 1,
    stars = 0
  } = location.state || {};
  
  // Determine total levels based on type
  const totalLevels = type === 'grid' ? gridLevels.length : freeLevels.length;

  // If data does not exist, navigate to the main screen
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location, navigate]);
  
  // Phát âm thanh tương ứng khi hiển thị kết quả
  useEffect(() => {
    if (outcome === 'finish') {
      audioManager.play('win');
    } else {
      audioManager.play('lose');
    }
    
    return () => {
      audioManager.playMusic('./sounds/background-music.mp3');
    };
  }, [outcome, audioManager]);
  
  // Determine the result title based on outcome
  const getResultTitle = () => {
    if (outcome === 'timeout') return 'Time out';
    if (outcome === 'lifeout') return 'Life out';
    return 'Finish';
  };
  
  // Handle Exit button - returns to appropriate screen based on mode
  const handleExit = () => {
    audioManager.play('button');
    
    if (mode === 'campaign' || mode === 'custom') {
      navigate(`/game/${type}/${mode}`);
    } else {
      // Zen mode - return to game mode detail
      navigate(`/game-mode/${type}`);
    }
  };
  
  // Handle Replay button - replays the same level/game
  const handleReplay = () => {
    const gameSettings = location.state?.gameSettings || getGameSettings(type, mode, level);

    console.log('Replay - gameSettings:', gameSettings);

    navigate(`/game/${type}/${mode}/play`, { 
      state: { 
        gameSettings,
        mode,
        type
      }
    });
  };
  
  // Handle Continue button - only for campaign mode, goes to next level
  const handleContinue = () => {
    if (mode === 'campaign') {
      const nextLevel = level + 1;
      const gameSettings = getGameSettings(type, mode, nextLevel);

      console.log('Continue - gameSettings:', gameSettings);

      navigate(`/game/${type}/campaign/play`, { 
        state: { 
          gameSettings,
          mode: 'campaign',
          type
        }
      });
    }
  };
  
  // Render stars based on performance (for campaign mode)
  const renderStars = () => {
    return (
      <div className={styles.starsContainer}>
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className={`${styles.star} ${index < stars ? styles.activeStar : styles.inactiveStar}`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <h1 className={styles.title}>{getResultTitle()}</h1>
      
      {/* Only show stars for campaign mode */}
      {mode === 'campaign' && renderStars()}
      
      <div className={styles.resultsContainer}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>Score:</span>
          <span className={styles.resultValue}>{score}</span>
        </div>
        
        {/* Show time info except for zen mode */}
        {mode !== 'zen' && (
          <>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Used time:</span>
              <span className={styles.resultValue}>{usedTime}s</span>
            </div>
            
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Time remaining:</span>
              <span className={styles.resultValue}>{timeRemaining}s</span>
            </div>
          </>
        )}
      </div>
      
      <div className={styles.buttonsContainer}>
        <button 
          className={`${styles.actionButton} ${styles.exitButton}`}
          onClick={handleExit}
        >
          Exit
        </button>
        
        <button 
          className={`${styles.actionButton} ${styles.replayButton}`}
          onClick={handleReplay}
        >
          Replay
        </button>
        
        {/* Only show Continue button for campaign mode */}
        {mode === 'campaign' && level < totalLevels && (
          <button 
            className={`${styles.actionButton} ${styles.continueButton}`}
            onClick={handleContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;