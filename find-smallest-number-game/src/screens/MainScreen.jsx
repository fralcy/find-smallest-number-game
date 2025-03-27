import { useNavigate } from 'react-router-dom';
import styles from '../styles/MainScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';

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
      <RotateDeviceNotice />
      <div className={styles.topSection}>
        <h1 className={styles.title}>Find the smallest number!</h1>
      </div>
      <div className={styles.bottomSection}>
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