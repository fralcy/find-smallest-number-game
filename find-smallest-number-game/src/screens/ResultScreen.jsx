import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/ResultScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state
  const { 
    type = 'grid',                     // grid or free
    mode = 'campaign',                 // campaign, custom, or zen
    outcome = 'finish',                // finish, timeout, or lifeout
    score = 0,                         // default score is 0 if not provided
    usedTime = 0,                      // default used time is 0
    timeRemaining = 0,                 // default time remaining is 0
    level = 1,                         // for campaign mode
    stars = 0                          // default stars is 0
  } = location.state || {};
  
  // If data does not exist, navigate to the main screen
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location, navigate]);
  
  // Determine the result title based on outcome
  const getResultTitle = () => {
    if (outcome === 'timeout') return 'Time out';
    if (outcome === 'lifeout') return 'Life out';
    return 'Finish';
  };
  
  // Handle Exit button - returns to appropriate screen based on mode
  const handleExit = () => {
    if (mode === 'campaign' || mode === 'custom') {
      navigate(`/game/${type}/${mode}`);
    } else {
      // Zen mode - return to game mode detail
      navigate(`/game-mode/${type}`);
    }
  };
  
  // Handle Replay button - replays the same level/game
  const handleReplay = () => {
    navigate(`/game/${type}/${mode}`, { 
      state: { 
        level: mode === 'campaign' ? level : undefined
      }
    });
  };
  
  // Handle Continue button - only for campaign mode, goes to next level
  const handleContinue = () => {
    if (mode === 'campaign') {
      navigate(`/game/${type}/${mode}`, { 
        state: { 
          level: level + 1
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
        {mode === 'campaign' && (
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