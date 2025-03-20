import React from 'react';
import styles from '../styles/CampaignScreen.module.css';
import { useNavigate } from 'react-router-dom';
import RotateDeviceNotice from './RotateDeviceNotice';

const CampaignScreen = () => {
  const navigate = useNavigate();
  // Tạo danh sách các level
  const levels = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Level ${index + 1}`,
    locked: index !== 0 // Level đầu tiên mở khóa, các level sau khóa
  }));

  const handleLevelSelect = (level) => {
    if (!level.locked) {
      console.log(`Selected Level ${level.id}`);
      // Điều hướng đến màn chơi tương ứng
    }
  };

  const handleBack = () => {
    const currentPath = window.location.pathname;
  
    if (currentPath.includes('/game/grid/campaign')) {
      navigate('/game-mode/grid');
    } else {
      navigate('/game-mode/free');
    }
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
        <h1 className={styles.title}>Campaign</h1>
      </div>

      <div className={styles.levelGrid}>
        {levels.map((level) => (
          <div 
            key={level.id} 
            className={`${styles.levelCard} ${level.locked ? styles.locked : ''}`}
            onClick={() => handleLevelSelect(level)}
          >
            <span className={styles.levelLabel}>level {level.id}</span>
            {level.locked && <div className={styles.lockIcon}>🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignScreen;