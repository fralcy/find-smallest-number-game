import React from 'react';
import styles from '../styles/GameModeDetailScreen.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t } from '../utils/languageUtils';

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
    return type === 'grid' ? t('gridMode') : t('freeMode');
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
            {t('campaign')}
          </button>

          <button 
            className={styles.modeButton}
            onClick={handleCustom}
          >
            {t('custom')}
          </button>

          <button 
            className={styles.modeButton}
            onClick={handleZenMode}
          >
            {t('zenMode')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeDetailScreen;