import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/GameModeScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import gridModeImage from '../assets/grid-mode.png';
import freeModeImage from '../assets/free-mode.png';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';
import backButtonSvg from '../assets/back-button.svg';

const GameModeScreen = () => {
  const navigate = useNavigate();
  const { audioManager } = useGameContext();

  const handleBack = () => {
    audioManager.play('button');
    navigate('/');
  };

  const handleGridMode = () => {
    audioManager.play('button');
    navigate('/game-mode/grid');
  };

  const handleFreeMode = () => {
    audioManager.play('button');
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
            <img src={backButtonSvg} alt="Back" width="30" height="30" />
          </button>
        </div>
        <div className={styles.middleSection}>
          <h1 className={styles.title}>{t('gameMode')}</h1>
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
            <button className={styles.modeButton}>{t('gridMode')}</button>
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
            <button className={styles.modeButton}>{t('freeMode')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeScreen;