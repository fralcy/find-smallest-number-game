import React, { useEffect, useState, useRef } from 'react';
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
    saveGameResult,
    saveHighScore 
  } = useGameContext();

  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
  
  // Dùng useRef để theo dõi đã lưu kết quả hay chưa
  const resultSaved = useRef(false);
  
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
  
  // Lưu kết quả game vào lịch sử và cập nhật điểm cao/số sao khi kết thúc game (chỉ một lần duy nhất)
  useEffect(() => {
    // Chỉ lưu kết quả cho campaign mode và chỉ lưu một lần duy nhất
    if (mode === 'campaign' && level && location.state && !resultSaved.current) {
      // Đánh dấu đã lưu để tránh lưu nhiều lần
      resultSaved.current = true;

      // Tạo object kết quả
      const gameResult = {
        score,
        usedTime,
        timeRemaining,
        stars,
        outcome,
        completed: outcome === 'finish' || outcome === 'timeout', // Cả hoàn thành và hết giờ đều tính là hoàn thành
        uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Lưu kết quả vào lịch sử
      saveGameResult(type, level, gameResult);
      
      // Lưu điểm cao và số sao cho campaign
      saveHighScore(type, mode, parseInt(level, 10), score, stars);
    }
  }, [
    mode,
    level,
    location.state,
    type,
    score,
    usedTime,
    timeRemaining,
    stars,
    outcome,
    saveGameResult,
    saveHighScore
  ]);
  
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
    audioManager.play('button');
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
    audioManager.play('button');
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
  
  // Render info về điểm số
  const renderScoreInfo = () => {
    return (
      <div className={styles.resultRow}>
        <span className={styles.resultLabel}>{t('score')}</span>
        <span className={styles.resultValue}>{score}</span>
      </div>
    );
  };
  
  // Render stars based on performance (for campaign mode)
  const renderStars = () => {
    // Sử dụng giá trị stars từ location.state, đã được tính toán trong useGameState
    const numStars = mode === 'campaign' ? Math.max(0, Math.min(stars, 3)) : 0;
    
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
          className={`${styles.resultValue} ${styles[`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`]}`}
          style={{ color: difficultyColor }}
        >
          {difficultyName}
        </span>
      </div>
    );
  };

  // Kiểm tra xem level tiếp theo có được mở khóa không
  useEffect(() => {
    if (mode === 'campaign' && level < totalLevels) {
      const nextLevel = level + 1;
      const levels = type === 'grid' ? gridLevels : freeLevels;
      const nextLevelData = levels.find(l => l.id === nextLevel);
      
      // Kiểm tra xem cấp độ tiếp theo đã được mở khóa chưa
      setNextLevelUnlocked(nextLevelData && nextLevelData.unlocked);
    }
  }, [mode, level, totalLevels, type, gridLevels, freeLevels]);

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <h1 className={styles.title}>{getResultTitle()}</h1>
      
      {/* Only show stars for campaign mode */}
      {mode === 'campaign' && renderStars()}
      
      <div className={styles.resultsContainer}>
        {renderScoreInfo()}
        
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
        {mode === 'campaign' && level < totalLevels && (outcome === 'finish' || nextLevelUnlocked) && (
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