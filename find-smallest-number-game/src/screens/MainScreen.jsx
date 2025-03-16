import { useNavigate } from 'react-router-dom';
import styles from '../styles/MainScreen.module.css';

const MainScreen = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/game-mode');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Find the smallest number!</h1>
        <button 
          className={styles.playButton}
          onClick={handlePlayClick}
        >
          Play
        </button>
        <button 
          className={styles.settingButton}
          onClick={handleSettingsClick}
        >
          Setting
        </button>
      </div>
      <div className={styles.version}>v1.0</div>
    </div>
  );
};

export default MainScreen;