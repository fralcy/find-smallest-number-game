import React from 'react';
import styles from '../styles/GameStats.module.css';

const GameStats = ({ 
  score, 
  timeLeft, 
  lives, 
  isZenMode = false
}) => {
  // Format time display
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className={styles.statsContainer}>
      {/* Row 1: Score */}
      <div className={styles.row}>
        <div className={styles.scoreContainer}>
          <span className={styles.scoreValue}>Score: {score}</span>
        </div>
      </div>

      {/* Row 2: Time or Lives */}
      <div className={styles.row}>
        {!isZenMode ? (
          <div className={styles.timeContainer}>
            <span className={styles.timeValue}>Time: {formatTime(timeLeft)}</span>
          </div>
        ) : (
          <div className={styles.livesContainer}>
            {[...Array(lives)].map((_, index) => (
              <span key={index} className={styles.lifeIcon}>❤️</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;