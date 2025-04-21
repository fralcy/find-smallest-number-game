import React, { createContext, useState, useContext, useEffect } from 'react';
import audioManager from '../utils/AudioManager';
import GameHistoryManager from '../data/GameHistoryManager';
import { setLanguage } from '../utils/languageUtils';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import { getDifficultyByLevel } from '../utils/difficultyUtils';

// Tạo context
const GameContext = createContext();

// Provider component để wrap ứng dụng
export const GameProvider = ({ children }) => {
  // Default settings cho game
  const DEFAULT_SETTINGS = {
    volume: 50,
    music: 50,
    language: 'Tiếng Việt',
    defaultGridSize: 5,
    defaultMaxNumbers: 20,
    defaultTimePerNumber: 5,
    defaultDifficulty: DIFFICULTY_LEVELS.EASY, // Thêm độ khó mặc định
  };

  // State cho cài đặt
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // State cho tiến trình của người chơi
  const [gridLevels, setGridLevels] = useState([]);
  const [freeLevels, setFreeLevels] = useState([]);
  const [highScores, setHighScores] = useState({});
  
  // THÊM MỚI: State cho lịch sử level
  const [levelHistory, setLevelHistory] = useState({});

  // Khi khởi tạo context
  useEffect(() => {
    // Load dữ liệu từ GameHistoryManager
    setGridLevels(GameHistoryManager.loadProgress('grid'));
    setFreeLevels(GameHistoryManager.loadProgress('free'));
    setHighScores(GameHistoryManager.loadHighScores());

    // Load cài đặt ngôn ngữ
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load cài đặt độ khó
    const savedDifficulty = localStorage.getItem('difficulty');
    if (savedDifficulty && Object.values(DIFFICULTY_LEVELS).includes(savedDifficulty)) {
      setSettings(prev => ({
        ...prev,
        defaultDifficulty: savedDifficulty
      }));
    }
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
  
    // Lưu vào localStorage và cập nhật biến toàn cục
    localStorage.setItem('language', language);
    setLanguage(language);
  };
  
  // Lưu cài đặt độ khó vào localStorage
  const saveDifficulty = (difficulty) => {
    if (Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
      setSettings((prev) => ({
        ...prev,
        defaultDifficulty: difficulty
      }));
      
      // Lưu vào localStorage
      localStorage.setItem('difficulty', difficulty);
    }
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
    
    // Cập nhật state khi reset lịch sử
    setLevelHistory({});
  };

  // Lưu kết quả game vào lịch sử
  const saveGameResult = (type, levelId, result) => {
    const savedResult = GameHistoryManager.saveGameResult(type, levelId, result);
    
    // Cập nhật state
    setLevelHistory(prev => {
      const key = `${type}_${levelId}`;
      const currentHistory = prev[key] || [];
      
      return {
        ...prev,
        [key]: [savedResult, ...currentHistory.slice(0, 19)] // Giữ tối đa 20 kết quả
      };
    });
    
    return savedResult;
  };
  
  // Lấy lịch sử của level
  const getLevelHistory = (type, levelId) => {
    const key = `${type}_${levelId}`;
    
    // Kiểm tra xem đã có trong state chưa
    if (levelHistory[key]) {
      return levelHistory[key];
    }
    
    // Nếu chưa có, load từ localStorage và cập nhật state
    const history = GameHistoryManager.getLevelHistory(type, levelId);
    
    // Cập nhật state
    setLevelHistory(prev => ({
      ...prev,
      [key]: history
    }));
    
    return history;
  };
  
  // Lấy điểm cao nhất của level
  const getHighestScoreForLevel = (type, levelId) => {
    return GameHistoryManager.getHighestScoreForLevel(type, levelId);
  };
  
  // Lấy số sao cao nhất của level
  const getMaxStarsForLevel = (type, levelId) => {
    return GameHistoryManager.getMaxStarsForLevel(type, levelId);
  };

  // Lấy độ khó cho mode và level hiện tại
  const getDifficulty = (type, mode, level = null) => {
    if (mode === 'campaign' && level) {
      // Dựa vào level để quyết định độ khó
      return getDifficultyByLevel(level);
    } else if (mode === 'zen') {
      // Zen mode luôn sử dụng độ khó HARD
      return DIFFICULTY_LEVELS.HARD;
    } else if (mode === 'custom') {
      // Custom mode sử dụng độ khó được lưu trong settings custom
      try {
        const customSettings = JSON.parse(localStorage.getItem('customGameSettings'));
        if (customSettings && customSettings.difficulty) {
          return customSettings.difficulty;
        }
      } catch (error) {
        console.error('Error loading custom difficulty:', error);
      }
    }
    
    // Mặc định trả về độ khó được cài đặt trong settings
    return settings.defaultDifficulty;
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
        
        // Thêm thông tin độ khó vào settings
        const difficulty = getDifficulty(type, mode, level);

        return {
          minNumber: levelData.minNumber,
          maxNumber: levelData.maxNumber,
          timePerNumber: levelData.timePerNumber,
          totalTime,
          level: levelData.id,
          difficulty,
          ...(type === 'grid'
            ? { gridSize: levelData.gridSize }
            : { maxNumbers: levelData.maxNumbers })
        };
      }
    } else if (mode === 'custom') {
      try {
        const customSettings = JSON.parse(localStorage.getItem('customGameSettings'));
        if (customSettings && customSettings.type === type) {
          // Đảm bảo có thông tin độ khó
          if (!customSettings.difficulty) {
            customSettings.difficulty = settings.defaultDifficulty;
          }
          return customSettings;
        }
      } catch (error) {
        console.error('Error loading custom settings:', error);
      }
    } else if (mode === 'zen') {
      // Zen mode luôn sử dụng độ khó HARD
      if (type === 'grid') {
        return {
          minNumber: 1,
          maxNumber: 100,
          gridSize: 9,
          timePerNumber: 0,
          totalTime: 0,
          difficulty: DIFFICULTY_LEVELS.HARD
        };
      } else {
        return {
          minNumber: 1,
          maxNumber: 100,
          maxNumbers: 30,
          timePerNumber: 0,
          totalTime: 0,
          difficulty: DIFFICULTY_LEVELS.HARD
        };
      }
    }

    // Thêm thông tin độ khó vào settings mặc định
    return {
      minNumber: 1,
      maxNumber: 100,
      timePerNumber: settings.defaultTimePerNumber,
      totalTime:
        settings.defaultTimePerNumber *
        (type === 'grid'
          ? settings.defaultGridSize * settings.defaultGridSize
          : settings.defaultMaxNumbers),
      difficulty: settings.defaultDifficulty,
      ...(type === 'grid'
        ? { gridSize: settings.defaultGridSize }
        : { maxNumbers: settings.defaultMaxNumbers })
    };
  };

  // Lưu cài đặt cho custom mode
  const saveCustomSettings = (customSettings) => {
    // Đảm bảo có trường difficulty
    if (!customSettings.difficulty) {
      customSettings.difficulty = settings.defaultDifficulty;
    }
    localStorage.setItem('customGameSettings', JSON.stringify(customSettings));
  };

  return (
    <GameContext.Provider
      value={{
        settings,
        saveAudioSettings,
        saveLanguage,
        saveDifficulty,
        getDifficulty,
        gridLevels,
        freeLevels,
        updateLevelProgress,
        resetProgress,
        highScores,
        saveHighScore,
        getGameSettings,
        saveCustomSettings,
        audioManager,
        // THÊM MỚI: Export các phương thức mới
        saveGameResult,
        getLevelHistory,
        getHighestScoreForLevel,
        getMaxStarsForLevel
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