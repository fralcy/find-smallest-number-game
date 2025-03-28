import React from 'react';
import styles from '../styles/GameModeDetailScreen.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';

const GameModeDetailScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'
  const { audioManager } = useGameContext();

  const handleBack = () => {
    audioManager.play('button');
    navigate('/game-mode');
  };

  const handleCampaign = () => {
    audioManager.play('button');
    navigate(`/game/${type}/campaign`);
  };

  const handleCustom = () => {
    audioManager.play('button');
    navigate(`/game/${type}/custom`);
  };

  const handleZenMode = () => {
    audioManager.play('button');
    navigate(`/game/${type}/zen/play`);
  };

  const getModeTitle = () => {
    return type === 'grid' ? 'Grid Mode' : 'Free Mode';
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
          <h1 className={styles.title}>{getModeTitle()}</h1>
        </div>
        <div className={styles.rightSection}>
          {/* Thành phần rỗng để căn chỉnh */}
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.modeContainer}>
          <button 
            className={styles.modeButton}
            onClick={handleCampaign}
          >
            Campaign
          </button>

          <button 
            className={styles.modeButton}
            onClick={handleCustom}
          >
            Custom
          </button>

          <button 
            className={styles.modeButton}
            onClick={handleZenMode}
          >
            Zen mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeDetailScreen;