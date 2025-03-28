import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from '../styles/MainScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';

const MainScreen = () => {
  const navigate = useNavigate();
  const { audioManager } = useGameContext();

  // Phát nhạc nền khi vào màn hình chính
  useEffect(() => {
    // Khởi tạo và tải âm thanh khi lần đầu mở ứng dụng
    audioManager.loadSounds();
    
    // Cleanup function
    return () => {
      // Không dừng nhạc nền khi rời khỏi màn hình chính
    };
  }, [audioManager]);

  const handlePlayClick = () => {
    // Phát âm thanh nút bấm
    audioManager.playMusic('./sounds/background-music.mp3');
    audioManager.play('button');
    navigate('/game-mode');
  };

  const handleSettingsClick = () => {
    // Phát âm thanh nút bấm
    audioManager.playMusic('./sounds/background-music.mp3');
    audioManager.play('button');
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