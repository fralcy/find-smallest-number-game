// Import dữ liệu level
import { gridLevelsData, freeLevelsData } from './CampaignLevelsData';

// Khóa lưu trữ trong localStorage
const STORAGE_KEYS = {
  GRID_LEVELS: 'campaign_levels_grid',
  FREE_LEVELS: 'campaign_levels_free',
  GRID_HIGH_SCORES: 'grid_high_scores',  // Key mới cho điểm cao Grid mode
  FREE_HIGH_SCORES: 'free_high_scores',  // Key mới cho điểm cao Free mode
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
    // Reset điểm cao grid
    localStorage.removeItem(STORAGE_KEYS.GRID_HIGH_SCORES);
  }

  if (!type || type === 'free') {
    const defaultFreeLevels = initializeLevels('free');
    saveProgress('free', defaultFreeLevels);
    // Reset điểm cao free
    localStorage.removeItem(STORAGE_KEYS.FREE_HIGH_SCORES);
  }
  
  // Xóa lịch sử level
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

// Hàm tải điểm cao cho từng mode
const loadCampaignHighScores = (type) => {
  const key = type === 'grid' ? STORAGE_KEYS.GRID_HIGH_SCORES : STORAGE_KEYS.FREE_HIGH_SCORES;
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : [];
};

// Hàm lưu điểm cao cho một level campaign
const saveHighScore = (type, mode, levelId, score, stars) => {
  // Chỉ lưu cho campaign mode
  if (mode !== 'campaign' || !levelId) {
    return;
  }
  
  // Lấy mảng điểm cao cho loại game
  const storageKey = type === 'grid' ? STORAGE_KEYS.GRID_HIGH_SCORES : STORAGE_KEYS.FREE_HIGH_SCORES;
  const highScores = loadCampaignHighScores(type);
  
  // Tìm dữ liệu của level hiện tại
  const levelIndex = highScores.findIndex(item => item.levelId === levelId);
  
  if (levelIndex === -1) {
    // Chưa có dữ liệu cho level này, thêm mới
    highScores.push({
      levelId,
      score,
      stars
    });
  } else {
    // Đã có dữ liệu, cập nhật nếu cao hơn
    const currentData = highScores[levelIndex];
    
    if (score > currentData.score) {
      currentData.score = score;
    }
    
    if (stars > currentData.stars) {
      currentData.stars = stars;
    }
  }
  
  // Lưu lại dữ liệu
  localStorage.setItem(storageKey, JSON.stringify(highScores));
};

// Hàm lưu kết quả game vào lịch sử
const saveGameResult = (type, levelId, result) => {
  // Xây dựng key cho localStorage
  const key = `${type}_${levelId}`;
  const storageKey = `${STORAGE_KEYS.LEVEL_HISTORY}_${key}`;

  // Lấy lịch sử hiện tại từ localStorage
  let history = [];
  const storedHistory = localStorage.getItem(storageKey);

  if (storedHistory) {
    try {
      history = JSON.parse(storedHistory);

      // Kiểm tra xem dữ liệu đã parse có phải là mảng không
      if (!Array.isArray(history)) {
        console.error('History data is not an array, resetting');
        history = [];
      }
    } catch (error) {
      console.error('Error parsing level history:', error);
      history = [];
    }
  }

  // Tạo kết quả mới
  const timestamp = Date.now();
  const newResult = {
    timestamp: timestamp,
    score: result.score || 0,
    timeUsed: result.usedTime || 0,
    timeRemaining: result.timeRemaining || 0,
    stars: result.stars || 0,
    uniqueId: result.uniqueId || `${timestamp}-${Math.random().toString(36).substr(2, 9)}`
  };

  // Kiểm tra xem kết quả này đã được lưu chưa
  const isDuplicate = history.some(item => {
    // Nếu có cùng uniqueId, chắc chắn là trùng lặp
    if (item.uniqueId && newResult.uniqueId && item.uniqueId === newResult.uniqueId) {
      return true;
    }
    
    // Kiểm tra các thông số quan trọng
    const sameScore = item.score === newResult.score;
    const sameTimeUsed = item.timeUsed === newResult.timeUsed;
    const sameTimeRemaining = item.timeRemaining === newResult.timeRemaining;
    const sameStars = item.stars === newResult.stars;
    
    // Kiểm tra thời gian - nếu thời gian quá gần nhau (trong vòng 5 giây) 
    // và tất cả các thuộc tính khác đều giống nhau => trùng lặp
    const timeClose = Math.abs(item.timestamp - timestamp) < 5000; // 5 giây
    
    return timeClose && sameScore && sameTimeUsed && sameTimeRemaining && sameStars && sameCompletion;
  });

  // Chỉ thêm vào nếu chưa có bản ghi tương tự
  if (!isDuplicate) {
    // Thêm vào đầu mảng để dễ lấy ra kết quả mới nhất
    history.unshift(newResult);

    // Giới hạn 20 kết quả gần nhất
    if (history.length > 20) {
      history = history.slice(0, 20);
    }

    // Lưu vào localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  }

  return newResult;
};

// Hàm lấy lịch sử của level
const getLevelHistory = (type, levelId) => {
  // Xây dựng key cho localStorage
  const key = `${type}_${levelId}`;
  const storageKey = `${STORAGE_KEYS.LEVEL_HISTORY}_${key}`;
  
  // Lấy dữ liệu từ localStorage
  const storedHistory = localStorage.getItem(storageKey);
  
  if (storedHistory) {
    try {
      const parsedHistory = JSON.parse(storedHistory);
      
      // Kiểm tra xem dữ liệu đã parse có phải là mảng không
      if (!Array.isArray(parsedHistory)) {
        console.error('History data is not an array, returning empty array');
        return [];
      }
      
      return parsedHistory;
    } catch (error) {
      console.error('Error parsing level history:', error);
      return [];
    }
  }
  
  // Nếu không có dữ liệu hoặc có lỗi, trả về mảng rỗng
  return [];
};

// Hàm lấy điểm cao nhất cho level
const getHighestScoreForLevel = (type, levelId) => {
  const highScores = loadCampaignHighScores(type);
  const levelData = highScores.find(item => item.levelId === parseInt(levelId, 10));
  return levelData ? levelData.score : 0;
};

// Hàm lấy số sao cao nhất cho level
const getMaxStarsForLevel = (type, levelId) => {
  const highScores = loadCampaignHighScores(type);
  const levelData = highScores.find(item => item.levelId === parseInt(levelId, 10));
  return levelData ? levelData.stars : 0;
};

// Export các hàm tiện ích
const GameHistoryManager = {
  loadProgress,
  saveProgress,
  updateLevelProgress,
  resetProgress,
  saveHighScore,
  saveGameResult,
  getLevelHistory,
  getHighestScoreForLevel,
  getMaxStarsForLevel
};

export default GameHistoryManager;