import React, { createContext, useState, useContext, useEffect } from 'react';
import audioManager from '../utils/AudioManager';

// Tạo context
const GameContext = createContext();

// Default settings cho game
const DEFAULT_SETTINGS = {
  // Cài đặt âm thanh
  volume: 50,
  music: 50,
  language: 'English',
  
  // Cài đặt gameplay
  defaultGridSize: 5,
  defaultMaxNumbers: 20,
  defaultTimePerNumber: 5,
  
  // Chế độ Grid, mức độ khó tăng dần
  gridLevels: [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      gridSize: 3,
      timePerNumber: 5,
      unlocked: true
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 30,
      gridSize: 4,
      timePerNumber: 4,
      unlocked: false
    },
    {
      id: 3,
      minNumber: 1,
      maxNumber: 50,
      gridSize: 4,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 4,
      minNumber: 1,
      maxNumber: 99,
      gridSize: 5,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 5,
      minNumber: 50,
      maxNumber: 200,
      gridSize: 5,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 6,
      minNumber: 100,
      maxNumber: 300,
      gridSize: 5,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 7,
      minNumber: 200,
      maxNumber: 500,
      gridSize: 6,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      gridSize: 6,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 6,
      timePerNumber: 1.5,
      unlocked: false
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 7,
      timePerNumber: 1.5,
      unlocked: false
    }
  ],
  
  // Chế độ Free, mức độ khó tăng dần
  freeLevels: [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      maxNumbers: 10,
      timePerNumber: 5,
      unlocked: true
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 50,
      maxNumbers: 15,
      timePerNumber: 4,
      unlocked: false
    },
    {
      id: 3,
      minNumber: 1,
      maxNumber: 99,
      maxNumbers: 15,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 4,
      minNumber: 10,
      maxNumber: 100,
      maxNumbers: 20,
      timePerNumber: 3,
      unlocked: false
    },
    {
      id: 5,
      minNumber: 50,
      maxNumber: 200,
      maxNumbers: 20,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 6,
      minNumber: 100,
      maxNumber: 300,
      maxNumbers: 25,
      timePerNumber: 2.5,
      unlocked: false
    },
    {
      id: 7,
      minNumber: 200,
      maxNumber: 500,
      maxNumbers: 25,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      maxNumbers: 30,
      timePerNumber: 2,
      unlocked: false
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 30,
      timePerNumber: 1.5,
      unlocked: false
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 35,
      timePerNumber: 1.5,
      unlocked: false
    }
  ]
};

// Provider component để wrap ứng dụng
export const GameProvider = ({ children }) => {
  // State cho cài đặt
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // State cho tiến trình của người chơi
  const [gridLevels, setGridLevels] = useState([]);
  const [freeLevels, setFreeLevels] = useState([]);
  const [highScores, setHighScores] = useState({});
  
  // Load cài đặt và tiến trình từ localStorage khi component được mount
  useEffect(() => {
    // Load cài đặt
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Chỉ cập nhật các cài đặt âm thanh/ngôn ngữ
        setSettings(prev => ({
          ...prev,
          volume: parsedSettings.volume ?? prev.volume,
          music: parsedSettings.music ?? prev.music,
          language: parsedSettings.language ?? prev.language
        }));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
    
    // Load tiến trình grid levels
    const savedGridLevels = localStorage.getItem('campaign_levels_grid');
    if (savedGridLevels) {
      try {
        const parsedLevels = JSON.parse(savedGridLevels);
        // Kiểm tra nếu dữ liệu bị thiếu hoặc không đầy đủ
        if (parsedLevels.length < DEFAULT_SETTINGS.gridLevels.length) {
          setGridLevels(DEFAULT_SETTINGS.gridLevels);
          localStorage.setItem('campaign_levels_grid', JSON.stringify(DEFAULT_SETTINGS.gridLevels));
        } else {
          setGridLevels(parsedLevels);
        }
      } catch (error) {
        console.error("Error loading grid levels:", error);
        setGridLevels(DEFAULT_SETTINGS.gridLevels);
        localStorage.setItem('campaign_levels_grid', JSON.stringify(DEFAULT_SETTINGS.gridLevels));
      }
    } else {
      setGridLevels(DEFAULT_SETTINGS.gridLevels);
      localStorage.setItem('campaign_levels_grid', JSON.stringify(DEFAULT_SETTINGS.gridLevels));
    }
    
    // Load tiến trình free levels
    const savedFreeLevels = localStorage.getItem('campaign_levels_free');
    if (savedFreeLevels) {
      try {
        setFreeLevels(JSON.parse(savedFreeLevels));
      } catch (error) {
        console.error("Error loading free levels:", error);
        setFreeLevels(DEFAULT_SETTINGS.freeLevels);
      }
    } else {
      setFreeLevels(DEFAULT_SETTINGS.freeLevels);
    }
    
    // Load high scores
    const savedHighScores = localStorage.getItem('highScores');
    if (savedHighScores) {
      try {
        setHighScores(JSON.parse(savedHighScores));
      } catch (error) {
        console.error("Error loading high scores:", error);
        setHighScores({});
      }
    }
  }, []);
  
  // Lưu cài đặt âm thanh vào localStorage
  const saveAudioSettings = (newSettings) => {
    const { volume, music } = newSettings;
    
    setSettings(prev => ({
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
    setSettings(prev => ({
      ...prev,
      language
    }));
    
    localStorage.setItem('language', language);
  };
  
  // Cập nhật tiến trình level sau khi hoàn thành một level
  const updateLevelProgress = (type, levelId, stars) => {
    if (type === 'grid') {
      const updatedLevels = gridLevels.map(level => {
        // Cập nhật số sao cho level hiện tại nếu cao hơn
        if (level.id === levelId) {
          return {
            ...level,
            stars: Math.max(level.stars || 0, stars)
          };
        }
        // Mở khóa level tiếp theo
        if (level.id === levelId + 1) {
          return { ...level, unlocked: true };
        }
        return level;
      });
      
      setGridLevels(updatedLevels);
      localStorage.setItem('campaign_levels_grid', JSON.stringify(updatedLevels));
    } else if (type === 'free') {
      const updatedLevels = freeLevels.map(level => {
        // Cập nhật số sao cho level hiện tại nếu cao hơn
        if (level.id === levelId) {
          return {
            ...level,
            stars: Math.max(level.stars || 0, stars)
          };
        }
        // Mở khóa level tiếp theo
        if (level.id === levelId + 1) {
          return { ...level, unlocked: true };
        }
        return level;
      });
      
      setFreeLevels(updatedLevels);
      localStorage.setItem('campaign_levels_free', JSON.stringify(updatedLevels));
    }
  };
  
  // Lưu điểm cao
  const saveHighScore = (type, mode, score) => {
    const key = `${type}_${mode}`;
    const currentHighScore = highScores[key] || 0;
    
    if (score > currentHighScore) {
      const newHighScores = {
        ...highScores,
        [key]: score
      };
      
      setHighScores(newHighScores);
      localStorage.setItem('highScores', JSON.stringify(newHighScores));
    }
  };
  
  // Reset tiến trình game
  const resetProgress = (type = null) => {
    if (!type || type === 'grid') {
      setGridLevels(DEFAULT_SETTINGS.gridLevels);
      localStorage.setItem('campaign_levels_grid', JSON.stringify(DEFAULT_SETTINGS.gridLevels));
    }
    
    if (!type || type === 'free') {
      setFreeLevels(DEFAULT_SETTINGS.freeLevels);
      localStorage.setItem('campaign_levels_free', JSON.stringify(DEFAULT_SETTINGS.freeLevels));
    }
    
    if (!type) {
      setHighScores({});
      localStorage.setItem('highScores', JSON.stringify({}));
    }
  };
  
  // Lấy cài đặt cho game
  const getGameSettings = (type, mode, level = null) => {
    if (mode === 'campaign' && level) {
      const levels = type === 'grid' ? gridLevels : freeLevels;
      const levelData = levels.find(l => l.id === level);
      
      if (levelData) {
        // Tính toán thời gian tổng
        const totalNumbers = type === 'grid' 
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
      // Trả về cài đặt từ localStorage cho custom mode
      try {
        const customSettings = JSON.parse(localStorage.getItem('customGameSettings'));
        if (customSettings && customSettings.type === type) {
          return customSettings;
        }
      } catch (error) {
        console.error("Error loading custom settings:", error);
      }
    } else if (mode === 'zen') {
      // Zen mode có cài đặt đặc biệt
      if (type === 'grid') {
        // Grid Zen Mode - bảng lớn
        return {
          minNumber: 1,
          maxNumber: 100,
          gridSize: 9, // 9x9 cho Zen mode
          timePerNumber: 0, // Không có giới hạn thời gian
          totalTime: 0
        };
      } else {
        // Free Zen Mode
        return {
          minNumber: 1,
          maxNumber: 100,
          maxNumbers: 30, // Nhiều số hơn cho Free Zen mode
          timePerNumber: 0, // Không có giới hạn thời gian
          totalTime: 0
        };
      }
    }
    
    // Trả về cài đặt mặc định nếu không tìm thấy cài đặt phù hợp
    return {
      minNumber: 1,
      maxNumber: 100,
      timePerNumber: settings.defaultTimePerNumber,
      totalTime: settings.defaultTimePerNumber * (
        type === 'grid' 
          ? settings.defaultGridSize * settings.defaultGridSize 
          : settings.defaultMaxNumbers
      ),
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
    <GameContext.Provider value={{
      // Cài đặt
      settings,
      saveAudioSettings,
      saveLanguage,
      
      // Level progress
      gridLevels,
      freeLevels,
      updateLevelProgress,
      resetProgress,
      
      // High scores
      highScores,
      saveHighScore,
      
      // Game settings
      getGameSettings,
      saveCustomSettings,

      // Audio manager
      audioManager
    }}>
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