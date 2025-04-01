// Import dữ liệu level
import { gridLevelsData, freeLevelsData } from './CampaignLevelsData';

// Khóa lưu trữ trong localStorage
const STORAGE_KEYS = {
  GRID_LEVELS: 'campaign_levels_grid',
  FREE_LEVELS: 'campaign_levels_free',
  HIGH_SCORES: 'highScores'
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

// Export các hàm tiện ích
const GameHistoryManager = {
  loadProgress,
  saveProgress,
  updateLevelProgress,
  resetProgress,
  loadHighScores,
  saveHighScore
};

export default GameHistoryManager;