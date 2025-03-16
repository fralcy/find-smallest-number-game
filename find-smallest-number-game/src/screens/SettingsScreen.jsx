import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SettingsScreen.module.css';

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
    navigate(-1); // Quay lại màn hình trước
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
    </div>
  );
};

export default SettingsScreen;