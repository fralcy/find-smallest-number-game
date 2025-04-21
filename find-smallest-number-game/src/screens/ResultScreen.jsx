import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/ResultScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import { getDifficultyName, getDifficultyColor } from '../utils/difficultyUtils';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    audioManager, 
    getGameSettings, 
    gridLevels, 
    freeLevels, 
    saveGameResult  // Thêm saveGameResult từ context
  } = useGameContext();
  
  // Get data from location state
  const { 
    type = 'grid',
    mode = 'campaign',
    outcome = 'finish',
    score = 0,
    usedTime = 0,
    timeRemaining = 0,
    level = 1,
    stars = 0,
    gameSettings
  } = location.state || {};
  
  // Lấy thông tin độ khó từ gameSettings
  const difficulty = gameSettings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  
  // Determine total levels based on type
  const totalLevels = type === 'grid' ? gridLevels.length : freeLevels.length;

  // If data does not exist, navigate to the main screen
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location, navigate]);
  
  // Lưu kết quả game vào lịch sử khi kết thúc game
  useEffect(() => {
    // Chỉ lưu kết quả cho campaign mode
    if (mode === 'campaign' && level && location.state) {
      // Tạo object kết quả
      const gameResult = {
        score,
        usedTime,
        timeRemaining,
        stars,
        outcome
      };
      
      // Lưu kết quả vào lịch sử
      saveGameResult(type, level, gameResult);
    }
  }, [type, mode, level, score, usedTime, timeRemaining, stars, outcome, saveGameResult, location.state]);
  
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
    if (outcome === 'timeout') return t('timeout');
    if (outcome === 'lifeout') return t('lifeout');
    return t('finish');
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
    const settings = location.state?.gameSettings || getGameSettings(type, mode, level);

    navigate(`/game/${type}/${mode}/play`, { 
      state: { 
        gameSettings: settings,
        mode,
        type
      }
    });
  };
  
  // Handle Continue button - only for campaign mode, goes to next level
  const handleContinue = () => {
    if (mode === 'campaign') {
      const nextLevel = level + 1;
      const settings = getGameSettings(type, mode, nextLevel);

      navigate(`/game/${type}/campaign/play`, { 
        state: { 
          gameSettings: settings,
          mode: 'campaign',
          type
        }
      });
    }
  };
  
  // Hiệu chỉnh thuật toán tính sao dựa trên độ khó
  const calculateStars = () => {
    if (stars > 0) return stars; // Nếu đã có stars (từ gameState), sử dụng giá trị đó
    
    // Các ngưỡng cho số sao dựa vào thời gian còn lại (%)
    const difficultyThresholds = {
      [DIFFICULTY_LEVELS.EASY]: {
        3: 70, // Cần 70% thời gian còn lại để đạt 3 sao ở mức Easy
        2: 50, // Cần 50% thời gian còn lại để đạt 2 sao ở mức Easy
        1: 20  // Cần 20% thời gian còn lại để đạt 1 sao ở mức Easy
      },
      [DIFFICULTY_LEVELS.NORMAL]: {
        3: 60, // Cần 60% thời gian còn lại để đạt 3 sao ở mức Normal
        2: 40, // Cần 40% thời gian còn lại để đạt 2 sao ở mức Normal
        1: 15  // Cần 15% thời gian còn lại để đạt 1 sao ở mức Normal
      },
      [DIFFICULTY_LEVELS.HARD]: {
        3: 50, // Cần 50% thời gian còn lại để đạt 3 sao ở mức Hard
        2: 30, // Cần 30% thời gian còn lại để đạt 2 sao ở mức Hard
        1: 10  // Cần 10% thời gian còn lại để đạt 1 sao ở mức Hard
      }
    };
    
    const thresholds = difficultyThresholds[difficulty] || difficultyThresholds[DIFFICULTY_LEVELS.NORMAL];
    
    // Tính tỷ lệ thời gian còn lại
    const totalTime = timeRemaining + usedTime;
    const remainingPercentage = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;
    
    // Xác định số sao dựa vào ngưỡng
    if (remainingPercentage >= thresholds[3]) return 3;
    if (remainingPercentage >= thresholds[2]) return 2;
    if (remainingPercentage >= thresholds[1]) return 1;
    return 0;
  };
  
  // Render stars based on performance (for campaign mode)
  const renderStars = () => {
    const numStars = mode === 'campaign' ? calculateStars() : 0;
    
    return (
      <div className={styles.starsContainer}>
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className={`${styles.star} ${index < numStars ? styles.activeStar : styles.inactiveStar}`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị thông tin về độ khó
  const renderDifficultyInfo = () => {
    const difficultyName = getDifficultyName(difficulty);
    const difficultyColor = getDifficultyColor(difficulty);
    
    return (
      <div className={styles.resultRow}>
        <span className={styles.resultLabel}>{t('difficulty')}</span>
        <span 
          className={styles.resultValue}
          style={{ color: difficultyColor }}
        >
          {difficultyName}
        </span>
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
          <span className={styles.resultLabel}>{t('score')}</span>
          <span className={styles.resultValue}>{score}</span>
        </div>
        
        {/* Hiển thị thông tin độ khó */}
        {renderDifficultyInfo()}
        
        {/* Show time info except for zen mode */}
        {mode !== 'zen' && (
          <>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>{t('usedTime')}</span>
              <span className={styles.resultValue}>{usedTime}s</span>
            </div>
            
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>{t('timeRemaining')}</span>
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
          {t('exit')}
        </button>
        
        <button 
          className={`${styles.actionButton} ${styles.replayButton}`}
          onClick={handleReplay}
        >
          {t('replay')}
        </button>
        
        {/* Only show Continue button for campaign mode */}
        {mode === 'campaign' && level < totalLevels && (
          <button 
            className={`${styles.actionButton} ${styles.continueButton}`}
            onClick={handleContinue}
          >
            {t('continue')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;