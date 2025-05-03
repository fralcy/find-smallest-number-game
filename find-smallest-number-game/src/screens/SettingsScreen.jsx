import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/SettingsScreen.module.css';
import RotateDeviceNotice from './RotateDeviceNotice';
import { useGameContext } from '../contexts/GameContext';
import { t, SUPPORTED_LANGUAGES, setLanguage } from '../utils/languageUtils';
import backButtonSvg from '../assets/back-button.svg';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

const SettingsScreen = ({ 
  // Props for modal mode
  fromGameplay = false, 
  type, 
  mode, 
  score, 
  timeLeft,
  lives,
  settings,
  onContinue, // Callback for when Continue is clicked
  onEndGame  // Callback for when End Game is clicked
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveAudioSettings, saveLanguage, audioManager } = useGameContext();
  
  // If props aren't passed, try to get them from location.state
  const isFromGameplay = fromGameplay || location.state?.fromGameplay || false;
  const gameType = type || location.state?.type;
  const gameMode = mode || location.state?.mode;
  const gameScore = score || location.state?.score || 0;
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

    // Save and update volume
    saveAudioSettings({ volume: newVolume, music });

    // Play sound to test
    audioManager.play('button');
  };

  const handleMusicChange = (e) => {
    const newMusic = parseInt(e.target.value);
    setMusic(newMusic);
    localStorage.setItem('music', newMusic.toString());

    // Save and update music volume
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
    // Play button sound
    audioManager.play('button');
    
    if (isFromGameplay && onContinue) {
      // If in modal mode with callback provided, use the callback
      onContinue();
    } else {
      // Otherwise use standard navigation
      navigate(-1);
    }
  };

  // Handle ending the game
  const handleEndGame = () => {
    audioManager.play('button');
    
    if (isFromGameplay && onEndGame) {
      // If in modal mode with callback provided, use the callback
      onEndGame();
    } else if (isZenMode) {
      // For Zen mode: navigate to result screen
      navigate('/result', {
        state: {
          type: gameType,
          mode: gameMode,
          outcome: 'finish',
          score: gameScore,
          usedTime: 0,
          timeRemaining: 0,
          gameSettings: {
            ...location.state?.settings,
            difficulty: DIFFICULTY_LEVELS.HARD
          }
        }
      });
    } else {
      // For Campaign and Custom mode: maintain existing behavior
      navigate(`/game/${gameType}/${gameMode}`);
    }
  };

  return (
    <div className={`${styles.container} ${isFromGameplay ? styles.modalMode : ''}`}>
      {!isFromGameplay && <RotateDeviceNotice />}
      <div className={styles.header}>
        <div className={styles.leftSection}>
          {/* Only show Back button when NOT coming from gameplay */}
          {!isFromGameplay && (
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
          {/* Empty component for alignment */}
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

        {isFromGameplay && (
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