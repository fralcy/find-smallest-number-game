import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/GameModeScreen.module.css';

const GameModeScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleGridMode = () => {
    navigate('/game-mode/grid');
  };

  const handleFreeMode = () => {
    navigate('/game-mode/free');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBack}
        >
          ←
        </button>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Game Mode</h1>
      </div>

      <div className={styles.modeContainer}>
        <div 
          className={styles.modeCard} 
          onClick={handleGridMode}
        >
          <div className={styles.modeImagePlaceholder}></div>
          <button className={styles.modeButton}>Grid mode</button>
        </div>

        <div 
          className={styles.modeCard} 
          onClick={handleFreeMode}
        >
          <div className={styles.modeImagePlaceholder}></div>
          <button className={styles.modeButton}>Free mode</button>
        </div>
      </div>
    </div>
  );
};

export default GameModeScreen;