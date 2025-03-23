import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/SettingsScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';

const LANGUAGES = [
  'English', 
  'Tiếng Việt', 
  '中文', 
  'Español', 
  'Français', 
  'Deutsch', 
  '日本語'
];

const SettingsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're navigating from gameplay
  const fromGameplay = location.state?.fromGameplay || false;
  const gameType = location.state?.type;
  const gameMode = location.state?.mode;
  
  // Trạng thái cài đặt
  const [volume, setVolume] = useState(50);
  const [music, setMusic] = useState(100);
  const [language, setLanguage] = useState('English');

  // Load cài đặt từ localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    const savedMusic = localStorage.getItem('music');
    const savedLanguage = localStorage.getItem('language');

    if (savedVolume !== null) setVolume(parseInt(savedVolume));
    if (savedMusic !== null) setMusic(parseInt(savedMusic));
    if (savedLanguage !== null) setLanguage(savedLanguage);
  }, []);

  // Lưu cài đặt khi thay đổi
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume.toString());
  };

  const handleMusicChange = (e) => {
    const newMusic = parseInt(e.target.value);
    setMusic(newMusic);
    localStorage.setItem('music', newMusic.toString());
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleBack = () => {
    if (fromGameplay) {
      // If from gameplay, go back to the game
      navigate(`/game/${gameType}/${gameMode}`);
    } else {
      // Otherwise, go back to main menu
      navigate(-1);
    }
  };
  
  const handleEndGame = () => {
    // Lấy thông tin gameplay từ location.state
    const { score, timeLeft, settings } = location.state || {};

    // Tính toán thời gian đã sử dụng
    const usedTime = settings.totalTime - timeLeft;

    // Điều hướng đến ResultScreen với đầy đủ thông tin
    navigate('/result', {
      state: {
        type: gameType,
        mode: gameMode,
        outcome: 'finish', // Khi người dùng chọn "End", vẫn hiển thị là "Finish"
        score: score || 0, // Điểm số hiện tại
        usedTime: usedTime || 0, // Thời gian đã sử dụng
        timeRemaining: timeLeft || 0, // Thời gian còn lại
        level: gameMode === 'campaign' ? settings.level : undefined, // Level (nếu là campaign mode)
        stars: calculateStars(timeLeft, settings.totalTime) // Tính số sao dựa trên thời gian còn lại
      }
    });
  };

  // Hàm tính số sao dựa trên thời gian còn lại
  const calculateStars = (timeLeft, totalTime) => {
    const timePercentage = (timeLeft / totalTime) * 100;
    if (timePercentage > 70) return 3;
    if (timePercentage > 40) return 2;
    return 1;
  };

  return (
    <div className={styles.container}>
      <RotateDeviceNotice />
      {!fromGameplay && (
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            ←
          </button>
        </div>
      )}
      
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Setting</h1>
      </div>

      <div className={styles.settingsWrapper}>
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>Volume:</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={handleVolumeChange}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{volume}</span>
          </div>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>Music:</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={music}
              onChange={handleMusicChange}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{music}</span>
          </div>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>Language:</label>
          <select 
            value={language}
            onChange={handleLanguageChange}
            className={styles.languageSelect}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
      
      {fromGameplay && (
        <div className={styles.gameplayButtons}>
          <button 
            className={styles.endButton}
            onClick={handleEndGame}
          >
            End
          </button>
          <button 
            className={styles.continueButton}
            onClick={handleBack}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;