import React from 'react';
import styles from '../styles/GameModeDetailScreen.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import RotateDeviceNotice from './RotateDeviceNotice';

const GameModeDetailScreen = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'grid' or 'free'

  const handleBack = () => {
    navigate('/game-mode'); // Use React Router's navigate function
  };

  const handleCampaign = () => {
    navigate(`/game/${type}/campaign`);
  };

  const handleCustom = () => {
    navigate(`/game/${type}/custom`);
  };

  const handleZenMode = () => {
    // Directly navigate to Zen gameplay screen rather than a configuration screen
    navigate(`/game/${type}/zen/play`);
  };

  const getModeTitle = () => {
    return type === 'grid' ? 'Grid Mode' : 'Free Mode';
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
        <h1 className={styles.title}>{getModeTitle()}</h1>
      </div>

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
  );
};

export default GameModeDetailScreen;