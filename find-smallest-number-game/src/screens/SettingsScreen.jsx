import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/SettingsScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';

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
  const { saveAudioSettings, saveLanguage, audioManager } = useGameContext();
  
  const fromGameplay = location.state?.fromGameplay || false;
  const gameType = location.state?.type;
  const gameMode = location.state?.mode;
  
  const [volume, setVolume] = useState(50);
  const [music, setMusic] = useState(100);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    const savedMusic = localStorage.getItem('music');
    const savedLanguage = localStorage.getItem('language');

    if (savedVolume !== null) setVolume(parseInt(savedVolume));
    if (savedMusic !== null) setMusic(parseInt(savedMusic));
    if (savedLanguage !== null) setLanguage(savedLanguage);
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('volume', newVolume.toString());

    // Lưu và cập nhật âm lượng
    saveAudioSettings({ volume: newVolume, music });

    // Phát âm thanh để kiểm tra
    audioManager.play('button');
  };

  const handleMusicChange = (e) => {
    const newMusic = parseInt(e.target.value);
    setMusic(newMusic);
    localStorage.setItem('music', newMusic.toString());

    // Lưu và cập nhật âm lượng nhạc
    saveAudioSettings({ volume, music: newMusic });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);

    // Phát âm thanh khi thay đổi
    audioManager.play('button');
  };

  const handleBack = () => {
    // Phát âm thanh nút bấm
    audioManager.play('button');

    if (fromGameplay) {
      navigate(`/game/${gameType}/${gameMode}`);
    } else {
      navigate(-1);
    }
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
          <h1 className={styles.title}>Settings</h1>
        </div>
        <div className={styles.rightSection}>
          {/* Thành phần rỗng để căn chỉnh */}
        </div>
      </div>

      {/* Thêm wrapper cho settings và gameplay buttons */}
      <div className={styles.contentWrapper}>
        <div className={styles.settingsWrapper}>
          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>Volume:</label>
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

          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>Music:</label>
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
              onClick={handleBack}
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
    </div>
  );
};

export default SettingsScreen;