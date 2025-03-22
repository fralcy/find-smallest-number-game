import React from 'react';
import styles from '../styles/GameStats.module.css';

const GameStats = ({ 
  score, 
  timeLeft, 
  totalTime, 
  lives, 
  mode, 
  level, 
  type,
  numbersFound,
  totalNumbers
}) => {
  // Format time display
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Tính phần trăm thời gian còn lại
  const timePercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  
  // Xác định màu sắc dựa vào thời gian còn lại
  const getTimeColor = () => {
    if (timePercentage > 60) return '#4CEEAD'; // Xanh lá - còn nhiều thời gian
    if (timePercentage > 30) return '#F5A623'; // Cam - thời gian trung bình
    return '#E74C3C'; // Đỏ - sắp hết thời gian
  };
  
  // Hiển thị progress bar thời gian (chỉ khi không phải zen mode)
  const renderTimeBar = () => {
    if (mode === 'zen') return null;
    
    return (
      <div className={styles.timeBarContainer}>
        <div 
          className={styles.timeBar} 
          style={{ 
            width: `${timePercentage}%`,
            backgroundColor: getTimeColor()
          }}
        ></div>
      </div>
    );
  };
  
  // Hiển thị số lượng mạng (chỉ với zen mode)
  const renderLives = () => {
    if (mode !== 'zen') return null;
    
    return (
      <div className={styles.livesContainer}>
        {[...Array(lives)].map((_, index) => (
          <span key={index} className={styles.lifeIcon}>❤️</span>
        ))}
      </div>
    );
  };
  
  // Hiển thị tiến trình tìm số (số đã tìm / tổng số)
  const renderProgress = () => {
    return (
      <div className={styles.progressContainer}>
        <span className={styles.progressText}>{numbersFound}/{totalNumbers}</span>
      </div>
    );
  };
  
  return (
    <div className={styles.statsContainer}>
      {/* Hiển thị loại chế độ và level (nếu là campaign) */}
      <div className={styles.gameMode}>
        {type.toUpperCase()} - {mode.toUpperCase()} {mode === 'campaign' ? `(Lv.${level})` : ''}
      </div>
      
      {/* Hiển thị điểm */}
      <div className={styles.scoreContainer}>
        <span className={styles.scoreLabel}>SCORE</span>
        <span className={styles.scoreValue}>{score}</span>
      </div>
      
      {/* Hiển thị thời gian còn lại */}
      {mode !== 'zen' && (
        <div className={styles.timeContainer}>
          <span className={styles.timeLabel}>TIME</span>
          <span className={styles.timeValue}>{formatTime(timeLeft)}</span>
          {renderTimeBar()}
        </div>
      )}
      
      {/* Hiển thị số mạng còn lại cho zen mode */}
      {renderLives()}
      
      {/* Hiển thị tiến trình tìm số */}
      {renderProgress()}
    </div>
  );
};

export default GameStats;