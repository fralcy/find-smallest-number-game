import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/SettingsScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t, SUPPORTED_LANGUAGES, setLanguage } from '../utils/languageUtils';
import backButtonSvg from '../assets/back-button.svg';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveAudioSettings, saveLanguage, audioManager } = useGameContext();
  
  const fromGameplay = location.state?.fromGameplay || false;
  const gameType = location.state?.type;
  const gameMode = location.state?.mode;
  const score = location.state?.score || 0;
  const isZenMode = gameMode === 'zen';
  
  const [volume, setVolume] = useState(50);
  const [music, setMusic] = useState(50);
  const [language, setLanguageState] = useState('vi');

  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    const savedMusic = localStorage.getItem('music');
    const savedLanguage = localStorage.getItem('language');

    if (savedVolume !== null) setVolume(parseInt(savedVolume));
    if (savedMusic !== null) setMusic(parseInt(savedMusic));
    if (savedLanguage !== null) setLanguageState(savedLanguage);
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
    setLanguageState(newLanguage);
    
    setLanguage(newLanguage);
    saveLanguage(newLanguage);
    audioManager.play('button');
  };

  const handleBack = () => {
    // Phát âm thanh nút bấm
    audioManager.play('button');
    
    navigate(-1);
  };

  // Hàm xử lý kết thúc trò chơi - khác nhau giữa Zen và các chế độ khác
  const handleEndGame = () => {
    audioManager.play('button');
    
    if (isZenMode) {
      // Đối với Zen mode: chuyển đến màn hình kết quả
      // Đảm bảo truyền difficulty là HARD
      navigate('/result', {
        state: {
          type: gameType,
          mode: gameMode,
          outcome: 'finish', // Người chơi chủ động kết thúc
          score: score,
          usedTime: 0,
          timeRemaining: 0,
          // Thêm gameSettings với thông tin độ khó là HARD
          gameSettings: {
            ...location.state?.settings, // Giữ các setting khác
            difficulty: DIFFICULTY_LEVELS.HARD // Đảm bảo độ khó là HARD
          }
        }
      });
    } else {
      // Đối với Campaign và Custom mode: giữ nguyên hành vi hiện tại
      navigate(`/game/${gameType}/${gameMode}`);
    }
  };

  // Cập nhật phần render trong SettingsScreen.jsx

return (
  <div className={styles.container}>
    <RotateDeviceNotice />
    <div className={styles.header}>
      <div className={styles.leftSection}>
        {/* Chỉ hiển thị nút Back khi KHÔNG vào từ màn hình gameplay */}
        {!fromGameplay && (
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            <img src={backButtonSvg} alt="Back" width="30" height="30" />
          </button>
        )}
      </div>
      <div className={styles.middleSection}>
        <h1 className={styles.title}>{t('settings')}</h1>
      </div>
      <div className={styles.rightSection}>
        {/* Thành phần rỗng để căn chỉnh */}
      </div>
    </div>

    <div className={styles.contentWrapper}>
      <div className={styles.settingsWrapper}>
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>{t('volume')}</label>
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
          <label className={styles.settingLabel}>{t('music')}</label>
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
          <label className={styles.settingLabel}>{t('language')}</label>
          <select 
            value={language}
            onChange={handleLanguageChange}
            className={styles.languageSelect}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
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
            {isZenMode ? t('finish') : t('end')}
          </button>
          <button 
            className={styles.continueButton}
            onClick={handleBack}
          >
            {t('continue')}
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

export default SettingsScreen;