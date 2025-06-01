/**
 * Các tiện ích để quản lý animation cho game, đặc biệt là các hiệu ứng cho NumberBox
 */
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

/**
 * Tạo hiệu ứng di chuyển ngẫu nhiên cho chế độ hard
 * @param {number} maxOffset - Khoảng cách tối đa có thể di chuyển (px)
 * @returns {Object} - Vị trí offset {x, y}
 */
export const generateRandomOffset = (maxOffset = 2.5) => {
  return {
    x: Math.random() * maxOffset * 2 - maxOffset, // -maxOffset to +maxOffset
    y: Math.random() * maxOffset * 2 - maxOffset
  };
};

/**
 * Tính toán độ mạnh của hiệu ứng dựa vào độ khó và số lượng số đã tìm thấy
 * @param {string} difficulty - Độ khó
 * @param {number} foundCount - Số lượng số đã tìm thấy
 * @param {number} totalCount - Tổng số lượng số
 * @returns {number} - Hệ số mạnh yếu (0-1)
 */
export const calculateEffectIntensity = (difficulty, foundCount, totalCount) => {
  // Độ khó cơ bản
  let baseIntensity = {
    [DIFFICULTY_LEVELS.EASY]: 0.2,
    [DIFFICULTY_LEVELS.NORMAL]: 0.5,
    [DIFFICULTY_LEVELS.HARD]: 0.8
  }[difficulty] || 0.5;
  
  // Tăng độ khó theo số lượng đã tìm thấy
  // Công thức: càng gần cuối càng khó hơn
  const progressFactor = foundCount / totalCount;
  
  // Tăng 20% độ khó khi đạt 50% tiến trình
  // Tăng 50% độ khó khi đạt 80% tiến trình
  let intensityMultiplier = 1;
  
  if (progressFactor > 0.8) {
    intensityMultiplier = 1.5;
  } else if (progressFactor > 0.5) {
    intensityMultiplier = 1.2;
  }
  
  return Math.min(1, baseIntensity * intensityMultiplier);
};

/**
 * Tạo các tham số animation dựa vào độ khó
 * @param {string} difficulty - Độ khó
 * @returns {Object} - Các tham số animation
 */
export const getAnimationParams = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return {
        duration: 0.5, // seconds
        easing: 'ease',
        delay: 0,
        iterations: 1,
        hoverScale: 1.05
      };
    case DIFFICULTY_LEVELS.NORMAL:
      return {
        duration: 0.4,
        easing: 'ease-in-out',
        delay: 0.1,
        iterations: 1,
        hoverScale: 1.08
      };
    case DIFFICULTY_LEVELS.HARD:
      return {
        duration: 0.3,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        delay: 0.05,
        iterations: 'infinite',
        hoverScale: 1.1
      };
    default:
      return {
        duration: 0.5,
        easing: 'ease',
        delay: 0,
        iterations: 1,
        hoverScale: 1.05
      };
  }
};

/**
 * Tạo thời gian ngẫu nhiên cho animation để các số không đồng bộ với nhau
 * @param {number} baseTime - Thời gian cơ bản (ms)
 * @param {number} variance - Độ biến thiên tối đa (ms)
 * @returns {number} - Thời gian ngẫu nhiên (ms)
 */
export const generateRandomTimingOffset = (baseTime = 500, variance = 200) => {
  return baseTime + Math.random() * variance - variance / 2;
};

/**
 * Tạo keyframes animation cho Web Animations API
 * @param {string} animationType - Loại animation ('wiggle', 'pulse', 'flicker', 'bounce')
 * @returns {Array} - Mảng các keyframes
 */
export const generateKeyframes = (animationType) => {
  switch (animationType) {
    case 'wiggle':
      return [
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: 'rotate(2deg)', offset: 0.25 },
        { transform: 'rotate(0deg)', offset: 0.5 },
        { transform: 'rotate(-2deg)', offset: 0.75 },
        { transform: 'rotate(0deg)', offset: 1 }
      ];
    case 'pulse':
      return [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(1.08)', offset: 0.5 },
        { transform: 'scale(1)', offset: 1 }
      ];
    case 'flicker':
      return [
        { opacity: 1, offset: 0 },
        { opacity: 0.7, offset: 0.25 },
        { opacity: 1, offset: 0.5 },
        { opacity: 0.8, offset: 0.75 },
        { opacity: 1, offset: 1 }
      ];
    case 'bounce':
      return [
        { transform: 'translateY(0)', offset: 0 },
        { transform: 'translateY(-5px)', offset: 0.5 },
        { transform: 'translateY(0)', offset: 1 }
      ];
    default:
      return [];
  }
};