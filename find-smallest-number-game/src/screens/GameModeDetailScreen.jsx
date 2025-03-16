import React from 'react';
import styles from '../styles/GameModeDetailScreen.module.css';
import { useNavigate } from 'react-router-dom';

const GameModeDetailScreen = () => {
  const navigate = useNavigate();

  // Simulating route parameter extraction
  const type = window.location.pathname.includes('grid') ? 'grid' : 'free';

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
    navigate(`/game/${type}/zen`);
  };

  const getModeTitle = () => {
    return type === 'grid' ? 'Grid Mode' : 'Free Mode';
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