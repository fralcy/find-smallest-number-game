import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/CustomScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';

const CustomScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  
  // Default settings
  const [range, setRange] = useState({ min: 1, max: 20 });
  const [gridSize, setGridSize] = useState(5); // For grid mode
  const [maxNumbers, setMaxNumbers] = useState(20); // For free mode
  const [timePerNumber, setTimePerNumber] = useState(5);
  
  const isGridMode = type === 'grid';
  
  const handleBack = () => {
    navigate(`/game-mode/${type}`);
  };
  
  const handleStart = () => {
    // Construct game settings to pass to game screen
    const gameSettings = {
      mode: type,
      range: range,
      timePerNumber: timePerNumber,
      ...(isGridMode ? { gridSize } : { maxNumbers }),
    };
    
    // Store settings in localStorage
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    
    // Navigate to game screen
    navigate(`/game/${type}/play`);
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
        <h1 className={styles.title}>Custom - {isGridMode ? 'Grid' : 'Free'} mode</h1>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>Range:</div>
          <div className={styles.settingValue}>{range.min}-{range.max}</div>
        </div>
        
        {isGridMode ? (
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>Size:</div>
            <div className={styles.settingValue}>{gridSize} x {gridSize}</div>
          </div>
        ) : (
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>Max numbers in screen:</div>
            <div className={styles.settingValue}>{maxNumbers}</div>
          </div>
        )}
        
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>Time:</div>
          <div className={styles.settingValue}>{timePerNumber}s per number - {timePerNumber * (isGridMode ? gridSize * gridSize : maxNumbers)}s in total</div>
        </div>
      </div>

      <button 
        className={styles.startButton}
        onClick={handleStart}
      >
        Start
      </button>
    </div>
  );
};

export default CustomScreen;