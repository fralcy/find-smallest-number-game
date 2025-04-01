import React, { createContext, useState, useContext, useEffect } from 'react';
import audioManager from '../utils/AudioManager';
import GameHistoryManager from '../data/GameHistoryManager';

// Tạo context
const GameContext = createContext();

// Provider component để wrap ứng dụng
export const GameProvider = ({ children }) => {
  // Default settings cho game
  const DEFAULT_SETTINGS = {
    volume: 50,
    music: 50,
    language: 'English',
    defaultGridSize: 5,
    defaultMaxNumbers: 20,
    defaultTimePerNumber: 5
  };

  // State cho cài đặt
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // State cho tiến trình của người chơi
  const [gridLevels, setGridLevels] = useState([]);
  const [freeLevels, setFreeLevels] = useState([]);
  const [highScores, setHighScores] = useState({});

  // Load dữ liệu từ GameHistoryManager khi component được mount
  useEffect(() => {
    setGridLevels(GameHistoryManager.loadProgress('grid'));
    setFreeLevels(GameHistoryManager.loadProgress('free'));
    setHighScores(GameHistoryManager.loadHighScores());
  }, []);

  // Lưu cài đặt âm thanh vào localStorage
  const saveAudioSettings = (newSettings) => {
    const { volume, music } = newSettings;

    setSettings((prev) => ({
      ...prev,
      volume,
      music
    }));

    // Lưu vào localStorage
    localStorage.setItem('volume', volume.toString());
    localStorage.setItem('music', music.toString());

    // Cập nhật AudioManager
    audioManager.updateVolume(volume, music);
  };

  // Lưu cài đặt ngôn ngữ vào localStorage
  const saveLanguage = (language) => {
    setSettings((prev) => ({
      ...prev,
      language
    }));

    localStorage.setItem('language', language);
  };

  // Cập nhật tiến trình level sau khi hoàn thành một level
  const updateLevelProgress = (type, levelId, stars) => {
    const updatedLevels = GameHistoryManager.updateLevelProgress(type, levelId, stars);

    if (type === 'grid') {
      setGridLevels(updatedLevels);
    } else if (type === 'free') {
      setFreeLevels(updatedLevels);
    }
  };

  // Lưu điểm cao
  const saveHighScore = (type, mode, score) => {
    GameHistoryManager.saveHighScore(type, mode, score);
    setHighScores(GameHistoryManager.loadHighScores());
  };

  // Reset tiến trình game
  const resetProgress = (type = null) => {
    GameHistoryManager.resetProgress(type);

    if (!type || type === 'grid') {
      setGridLevels(GameHistoryManager.loadProgress('grid'));
    }

    if (!type || type === 'free') {
      setFreeLevels(GameHistoryManager.loadProgress('free'));
    }

    if (!type) {
      setHighScores(GameHistoryManager.loadHighScores());
    }
  };

  // Lấy cài đặt cho game
  const getGameSettings = (type, mode, level = null) => {
    if (mode === 'campaign' && level) {
      const levels = type === 'grid' ? gridLevels : freeLevels;
      const levelData = levels.find((l) => l.id === level);

      if (levelData) {
        const totalNumbers =
          type === 'grid'
            ? levelData.gridSize * levelData.gridSize
            : levelData.maxNumbers;

        const totalTime = Math.round(levelData.timePerNumber * totalNumbers);

        return {
          minNumber: levelData.minNumber,
          maxNumber: levelData.maxNumber,
          timePerNumber: levelData.timePerNumber,
          totalTime,
          level: levelData.id,
          ...(type === 'grid'
            ? { gridSize: levelData.gridSize }
            : { maxNumbers: levelData.maxNumbers })
        };
      }
    } else if (mode === 'custom') {
      try {
        const customSettings = JSON.parse(localStorage.getItem('customGameSettings'));
        if (customSettings && customSettings.type === type) {
          return customSettings;
        }
      } catch (error) {
        console.error('Error loading custom settings:', error);
      }
    } else if (mode === 'zen') {
      if (type === 'grid') {
        return {
          minNumber: 1,
          maxNumber: 100,
          gridSize: 9,
          timePerNumber: 0,
          totalTime: 0
        };
      } else {
        return {
          minNumber: 1,
          maxNumber: 100,
          maxNumbers: 30,
          timePerNumber: 0,
          totalTime: 0
        };
      }
    }

    return {
      minNumber: 1,
      maxNumber: 100,
      timePerNumber: settings.defaultTimePerNumber,
      totalTime:
        settings.defaultTimePerNumber *
        (type === 'grid'
          ? settings.defaultGridSize * settings.defaultGridSize
          : settings.defaultMaxNumbers),
      ...(type === 'grid'
        ? { gridSize: settings.defaultGridSize }
        : { maxNumbers: settings.defaultMaxNumbers })
    };
  };

  // Lưu cài đặt cho custom mode
  const saveCustomSettings = (customSettings) => {
    localStorage.setItem('customGameSettings', JSON.stringify(customSettings));
  };

  return (
    <GameContext.Provider
      value={{
        settings,
        saveAudioSettings,
        saveLanguage,
        gridLevels,
        freeLevels,
        updateLevelProgress,
        resetProgress,
        highScores,
        saveHighScore,
        getGameSettings,
        saveCustomSettings,
        audioManager
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export default GameContext;