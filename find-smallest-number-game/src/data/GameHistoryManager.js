// Import dữ liệu level
import { gridLevelsData, freeLevelsData } from './CampaignLevelsData';

// Khóa lưu trữ trong localStorage
const STORAGE_KEYS = {
  GRID_LEVELS: 'campaign_levels_grid',
  FREE_LEVELS: 'campaign_levels_free',
  HIGH_SCORES: 'highScores',
  LEVEL_HISTORY: 'level_history'
};

// Hàm khởi tạo dữ liệu mặc định
const initializeLevels = (type) => {
  const levelsData = type === 'grid' ? gridLevelsData : freeLevelsData;
  return levelsData.map(level => ({
    ...level,
    unlocked: level.id === 1, // Chỉ mở khóa màn đầu tiên
    stars: 0 // Mặc định chưa đạt sao nào
  }));
};

// Hàm tải tiến trình từ localStorage
const loadProgress = (type) => {
  const key = type === 'grid' ? STORAGE_KEYS.GRID_LEVELS : STORAGE_KEYS.FREE_LEVELS;
  const savedData = localStorage.getItem(key);

  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      const levelsData = type === 'grid' ? gridLevelsData : freeLevelsData;

      // Kiểm tra và đồng bộ dữ liệu nếu có thay đổi trong cấu trúc level
      if (parsedData.length < levelsData.length) {
        const updatedData = initializeLevels(type);
        localStorage.setItem(key, JSON.stringify(updatedData));
        return updatedData;
      }

      return parsedData;
    } catch (error) {
      console.error(`Error loading ${type} levels:`, error);
    }
  }

  // Nếu không có dữ liệu, khởi tạo mặc định
  const defaultData = initializeLevels(type);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

// Hàm lưu tiến trình vào localStorage
const saveProgress = (type, levels) => {
  const key = type === 'grid' ? STORAGE_KEYS.GRID_LEVELS : STORAGE_KEYS.FREE_LEVELS;
  localStorage.setItem(key, JSON.stringify(levels));
};

// Hàm cập nhật tiến trình sau khi hoàn thành một màn chơi
const updateLevelProgress = (type, levelId, stars) => {
  const levels = loadProgress(type);

  const updatedLevels = levels.map(level => {
    if (level.id === levelId) {
      return {
        ...level,
        stars: Math.max(level.stars || 0, stars) // Cập nhật số sao nếu cao hơn
      };
    }
    if (level.id === levelId + 1) {
      return { ...level, unlocked: true }; // Mở khóa màn tiếp theo
    }
    return level;
  });

  saveProgress(type, updatedLevels);
  return updatedLevels;
};

// Hàm reset tiến trình
const resetProgress = (type = null) => {
  if (!type || type === 'grid') {
    const defaultGridLevels = initializeLevels('grid');
    saveProgress('grid', defaultGridLevels);
  }

  if (!type || type === 'free') {
    const defaultFreeLevels = initializeLevels('free');
    saveProgress('free', defaultFreeLevels);
  }
  
  // Thêm reset lịch sử level khi reset tiến trình
  if (!type) {
    // Xóa tất cả lịch sử
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.LEVEL_HISTORY)) {
        localStorage.removeItem(key);
      }
    });
  } else {
    // Xóa lịch sử của loại level cụ thể
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${STORAGE_KEYS.LEVEL_HISTORY}_${type}`)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Hàm tải điểm cao
const loadHighScores = () => {
  const savedData = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
  return savedData ? JSON.parse(savedData) : {};
};

// Hàm lưu điểm cao
const saveHighScore = (type, mode, score) => {
  const key = `${type}_${mode}`;
  const highScores = loadHighScores();

  if (score > (highScores[key] || 0)) {
    highScores[key] = score;
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
  }
};

// Hàm lưu kết quả game vào lịch sử
const saveGameResult = (type, levelId, result) => {
  const key = `${type}_${levelId}`;
  let history = localStorage.getItem(`${STORAGE_KEYS.LEVEL_HISTORY}_${key}`);
  
  if (history) {
    try {
      history = JSON.parse(history);
    } catch (error) {
      console.error('Error parsing level history:', error);
      history = [];
    }
  } else {
    history = [];
  }
  
  // Thêm kết quả mới
  const newResult = {
    timestamp: Date.now(),
    score: result.score || 0,
    timeUsed: result.usedTime || 0,
    timeRemaining: result.timeRemaining || 0,
    stars: result.stars || 0,
    completed: result.outcome === 'finish'
  };
  
  // Thêm vào đầu mảng để dễ lấy ra kết quả mới nhất
  history.unshift(newResult);
  
  // Giới hạn 20 kết quả gần nhất
  if (history.length > 20) {
    history = history.slice(0, 20);
  }
  
  localStorage.setItem(`${STORAGE_KEYS.LEVEL_HISTORY}_${key}`, JSON.stringify(history));
  
  return newResult;
};

// Hàm lấy lịch sử của level
const getLevelHistory = (type, levelId) => {
  const key = `${type}_${levelId}`;
  const history = localStorage.getItem(`${STORAGE_KEYS.LEVEL_HISTORY}_${key}`);
  
  if (history) {
    try {
      return JSON.parse(history);
    } catch (error) {
      console.error('Error parsing level history:', error);
      return [];
    }
  }
  
  return [];
};

// Hàm lấy điểm cao nhất của level
const getHighestScoreForLevel = (type, levelId) => {
  const history = getLevelHistory(type, levelId);
  
  if (history.length === 0) return 0;
  
  // Lọc các kết quả đã hoàn thành và lấy điểm cao nhất
  const completedResults = history.filter(item => item.completed);
  if (completedResults.length === 0) return 0;
  
  return Math.max(...completedResults.map(item => item.score));
};

// Hàm lấy số sao cao nhất của level
const getMaxStarsForLevel = (type, levelId) => {
  const history = getLevelHistory(type, levelId);
  
  if (history.length === 0) return 0;
  
  // Lọc các kết quả đã hoàn thành và lấy số sao cao nhất
  const completedResults = history.filter(item => item.completed);
  if (completedResults.length === 0) return 0;
  
  return Math.max(...completedResults.map(item => item.stars || 0));
};

// Export các hàm tiện ích
const GameHistoryManager = {
  loadProgress,
  saveProgress,
  updateLevelProgress,
  resetProgress,
  loadHighScores,
  saveHighScore,
  saveGameResult,
  getLevelHistory,
  getHighestScoreForLevel,
  getMaxStarsForLevel
};

export default GameHistoryManager;