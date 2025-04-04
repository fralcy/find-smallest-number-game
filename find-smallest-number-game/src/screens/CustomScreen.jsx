import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/CustomScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';

const CustomScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  const { audioManager } = useGameContext();
  
  // Default settings
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [gridSize, setGridSize] = useState(5); // For grid mode
  const [maxNumbers, setMaxNumbers] = useState(20); // For free mode
  const [timePerNumber, setTimePerNumber] = useState(5);
  
  const isGridMode = type === 'grid';
  
  // Load saved settings if they exist
  useEffect(() => {
    const savedSettings = localStorage.getItem('customGameSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Only load if the saved settings match the current game type
        if (parsedSettings.type === type) {
          setRange({
            min: parsedSettings.minNumber || 1,
            max: parsedSettings.maxNumber || 100
          });
          setTimePerNumber(parsedSettings.timePerNumber || 5);
          
          if (isGridMode && parsedSettings.gridSize) {
            setGridSize(parsedSettings.gridSize);
          } else if (!isGridMode && parsedSettings.maxNumbers) {
            setMaxNumbers(parsedSettings.maxNumbers);
          }
        }
      } catch (error) {
        console.error("Error loading saved settings:", error);
      }
    }
  }, [type, isGridMode]);
  
  const handleBack = () => {
    audioManager.play('button');
    navigate(`/game-mode/${type}`);
  };
  
  const handleStart = () => {
    // Calculate total time
    const totalNumbers = isGridMode ? gridSize * gridSize : maxNumbers;
    const totalTime = Math.round(timePerNumber * totalNumbers);
    
    // Construct game settings to pass to game screen
    const gameSettings = {
      type: type,
      minNumber: range.min,
      maxNumber: range.max,
      timePerNumber: timePerNumber,
      totalTime: totalTime,
      ...(isGridMode ? { gridSize } : { maxNumbers }),
    };
    
    // Store settings in localStorage
    localStorage.setItem('customGameSettings', JSON.stringify(gameSettings));

    audioManager.play('button');
    
    // Navigate to game screen with settings
    navigate(`/game/${type}/custom/play`, {
      state: { 
        gameSettings,
        mode: 'custom'
      }
    });
  };
  
  // Handle range changes
  const handleMinChange = (newMin) => {
    newMin = parseInt(newMin);
    if (isNaN(newMin) || newMin < 0) newMin = 0;
    if (newMin >= range.max) newMin = range.max - 1;
    setRange({ ...range, min: newMin });
    audioManager.play('button');
  };
  
  const handleMaxChange = (newMax) => {
    newMax = parseInt(newMax);
    if (isNaN(newMax) || newMax <= range.min) newMax = range.min + 1;
    if (newMax > 9999) newMax = 9999; // Upper limit
    setRange({ ...range, max: newMax });
    audioManager.play('button');
  };
  
  // Handle grid size changes
  const handleGridSizeChange = (newSize) => {
    newSize = parseInt(newSize);
    if (isNaN(newSize) || newSize < 3) newSize = 3; // Minimum 3x3
    if (newSize > 9) newSize = 9; // Maximum 9x9
    setGridSize(newSize);
    audioManager.play('button');
  };
  
  // Handle max numbers changes (for free mode)
  const handleMaxNumbersChange = (newMax) => {
    newMax = parseInt(newMax);
    if (isNaN(newMax) || newMax < 5) newMax = 5; // Minimum 5 numbers
    if (newMax > 45) newMax = 45; // Maximum 45 numbers
    setMaxNumbers(newMax);
    audioManager.play('button');
  };
  
  // Handle time per number changes
  const handleTimeChange = (newTime) => {
    newTime = parseFloat(newTime);
    if (isNaN(newTime) || newTime < 1) newTime = 1; // Minimum 1 second
    if (newTime > 15) newTime = 15; // Maximum 15 seconds
    setTimePerNumber(newTime);
    audioManager.play('button');
  };
  
  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      <div className={styles.header}>
        {/* Left Section: Back Button */}
        <div className={styles.leftSection}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            {t('back')}
          </button>
        </div>

        {/* Middle Section: Title */}
        <div className={styles.middleSection}>
          <h1 className={styles.title}>
            {type === 'grid' ? t('customGridMode') : t('customFreeMode')}
          </h1>
        </div>

        {/* Right Section: Empty (for future use or alignment purposes) */}
        <div className={styles.rightSection}></div>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>{t('numberRange')}</label>
          <div className={styles.rangeControls}>
            <div className={styles.inputControl}>
              <span>{t('min')}</span>
              <input 
                type="number" 
                value={range.min}
                onChange={(e) => handleMinChange(e.target.value)}
                className={styles.numberInput}
                min="0"
                max={range.max - 1}
              />
            </div>
            <div className={styles.inputControl}>
              <span>{t('max')}</span>
              <input 
                type="number" 
                value={range.max}
                onChange={(e) => handleMaxChange(e.target.value)}
                className={styles.numberInput}
                min={range.min + 1}
                max="9999"
              />
            </div>
          </div>
        </div>
        
        {isGridMode ? (
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>{t('gridSize')}</label>
            <div className={styles.inputControl}>
              <input 
                type="range" 
                min="3" 
                max="9" 
                value={gridSize}
                onChange={(e) => handleGridSizeChange(e.target.value)}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{gridSize} x {gridSize}</span>
            </div>
          </div>
        ) : (
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>{t('maxNumbers')}</label>
            <div className={styles.inputControl}>
              <input 
                type="range" 
                min="5" 
                max="45" 
                value={maxNumbers}
                onChange={(e) => handleMaxNumbersChange(e.target.value)}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{maxNumbers}</span>
            </div>
          </div>
        )}
        
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>{t('timePerNumber')}</label>
          <div className={styles.inputControl}>
            <input 
              type="range" 
              min="1" 
              max="15" 
              step="0.5"
              value={timePerNumber}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{timePerNumber}s</span>
          </div>
        </div>
        
        <div className={styles.settingInfo}>
          <span className={styles.infoLabel}>{t('totalNumbers')}</span>
          <span className={styles.infoValue}>
            {isGridMode ? gridSize * gridSize : maxNumbers}
          </span>
        </div>
        
        <div className={styles.settingInfo}>
          <span className={styles.infoLabel}>{t('totalTime')}</span>
          <span className={styles.infoValue}>
            {Math.round(timePerNumber * (isGridMode ? gridSize * gridSize : maxNumbers))}s
          </span>
        </div>
      </div>

      <button 
        className={styles.startButton}
        onClick={handleStart}
      >
        {t('startGame')}
      </button>
    </div>
  );
};

export default CustomScreen;