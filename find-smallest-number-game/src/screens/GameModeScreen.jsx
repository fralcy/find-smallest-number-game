import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/GameModeScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import gridModeImage from '../assets/grid-mode.png';
import freeModeImage from '../assets/free-mode.png';

const GameModeScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleGridMode = () => {
    navigate('/game-mode/grid');
  };

  const handleFreeMode = () => {
    navigate('/game-mode/free');
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
            ←
          </button>
        </div>
        <div className={styles.middleSection}>
          <h1 className={styles.title}>Game Mode</h1>
        </div>
        <div className={styles.rightSection}>
          {/* Thành phần rỗng để căn chỉnh */}
        </div>
      </div>

      <div className={styles.modeWrapper}>
        <div className={styles.modeContainer}>
          <div 
            className={styles.modeCard} 
            onClick={handleGridMode}
          >
            <img 
              src={gridModeImage} 
              alt="Grid Mode" 
              className={styles.modeImage}
            />
            <button className={styles.modeButton}>Grid mode</button>
          </div>

          <div 
            className={styles.modeCard} 
            onClick={handleFreeMode}
          >
            <img 
              src={freeModeImage} 
              alt="Free Mode" 
              className={styles.modeImage}
            />
            <button className={styles.modeButton}>Free mode</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeScreen;