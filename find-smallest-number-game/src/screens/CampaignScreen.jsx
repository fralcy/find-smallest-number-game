import React, { useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from '../styles/CampaignScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';

const CampaignScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  const location = useLocation();

  // Lấy dữ liệu màn chơi từ GameContext
  const { gridLevels, freeLevels, updateLevelProgress } = useGameContext();

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
      ...(type === 'grid' 
        ? { gridSize: level.gridSize } 
        : { maxNumbers: level.maxNumbers })
    };

    // Navigate to GameplayScreen with state
    navigate(`/game/${type}/campaign/play`, {
      state: { gameSettings, mode: 'campaign' }
    });
  };

  const handleBack = () => {
    navigate(`/game-mode/${type}`);
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBack}
        >
          ←
        </button>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Campaign - {type === 'grid' ? 'Grid' : 'Free'} Mode</h1>
      </div>

      <div className={styles.levelGrid}>
        {levels.map((level) => (
          <div 
            key={level.id} 
            className={`${styles.levelCard} ${!level.unlocked ? styles.locked : ''}`}
            onClick={() => handleLevelSelect(level)}
          >
            <span className={styles.levelLabel}>Level {level.id}</span>
            <span className={styles.levelInfo}>
              {type === 'grid' ? `${level.gridSize}x${level.gridSize}` : `${level.maxNumbers} nums`}
            </span>
            {!level.unlocked && <div className={styles.lockIcon}>🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignScreen;