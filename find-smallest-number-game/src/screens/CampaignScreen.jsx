import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/CampaignScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import { getDifficultyName, getDifficultyDescription } from '../utils/difficultyUtils';

const CampaignScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  const location = useLocation();
  const { audioManager } = useGameContext();

  // Lấy dữ liệu màn chơi từ GameContext
  const { gridLevels, freeLevels } = useGameContext();

  // Chọn levels dựa trên type
  const levels = type === 'grid' ? gridLevels : freeLevels;

  const handleLevelSelect = (level) => {
    if (!level.unlocked) return;

    // Calculate total time
    const totalNumbers = type === 'grid' 
      ? level.gridSize * level.gridSize 
      : level.maxNumbers;

    const totalTime = Math.round(level.timePerNumber * totalNumbers);

    // Create gameSettings to pass to GameplayScreen
    const gameSettings = {
      minNumber: level.minNumber,
      maxNumber: level.maxNumber,
      timePerNumber: level.timePerNumber,
      totalTime: totalTime,
      level: level.id,
      difficulty: level.difficulty || DIFFICULTY_LEVELS.EASY, // Đảm bảo luôn có độ khó
      ...(type === 'grid' 
        ? { gridSize: level.gridSize } 
        : { maxNumbers: level.maxNumbers })
    };

    audioManager.play('button');

    // Navigate to GameplayScreen with state
    navigate(`/game/${type}/campaign/play`, {
      state: { gameSettings, mode: 'campaign' }
    });
  };

  const handleBack = () => {
    audioManager.play('button');
    navigate(`/game-mode/${type}`);
  };

  // Tạo tooltip text cho level
  const getLevelTooltip = (level) => {
    if (!level.difficulty) return '';
    
    const difficultyName = getDifficultyName(level.difficulty);
    const difficultyDesc = getDifficultyDescription(level.difficulty);
    
    return `${t('difficulty')} ${difficultyName}: ${difficultyDesc}`;
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            {t('back')}
          </button>
        </div>
        <div className={styles.middleSection}>
          <h1 className={styles.title}>
            {type === 'grid' ? t('campaignGridMode') : t('campaignFreeMode')}
          </h1>
        </div>
        <div className={styles.rightSection}>
          {/* Thành phần rỗng để căn chỉnh */}
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.levelGrid}>
          {levels.map((level) => {
            const difficultyClass = level.difficulty ? styles[level.difficulty] : '';
            const tooltipText = getLevelTooltip(level);
            
            return (
              <div 
                key={level.id} 
                className={`${styles.levelCard} ${difficultyClass} ${!level.unlocked ? styles.locked : ''}`}
                onClick={() => handleLevelSelect(level)}
                title={tooltipText}
              >
                <span className={styles.levelLabel}>{t('level')} {level.id}</span>
                <span className={styles.levelInfo}>
                  {type === 'grid' ? `${level.gridSize}x${level.gridSize}` : `${level.maxNumbers} nums`}
                </span>
                
                {!level.unlocked && <div className={styles.lockIcon}>🔒</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignScreen;